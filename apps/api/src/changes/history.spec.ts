import { MikroORM } from '@mikro-orm/postgresql'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AppTestModule } from '@test/app-test.module'
import { graphql } from '@test/gql'
import { ChangeStatus } from '@test/gql/types.generated'
import { GraphQLTestClient } from '@test/graphql.utils'

import { BaseSeeder } from '@src/db/seeds/BaseSeeder'
import { TestCategorySeeder } from '@src/db/seeds/TestCategorySeeder'
import { TestMaterialSeeder } from '@src/db/seeds/TestMaterialSeeder'
import { TestProcessSeeder } from '@src/db/seeds/TestProcessSeeder'
import { TestTagSeeder } from '@src/db/seeds/TestTagSeeder'
import { ITEM_IDS, TestVariantSeeder, VARIANT_IDS } from '@src/db/seeds/TestVariantSeeder'
import { UserSeeder } from '@src/db/seeds/UserSeeder'
import { clearDatabase } from '@src/db/test.utils'

describe('History via Change/Merge flow (integration)', () => {
  let app: INestApplication
  let gql: GraphQLTestClient

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppTestModule],
    }).compile()

    app = module.createNestApplication()
    await app.init()

    gql = new GraphQLTestClient(app)

    const orm = module.get<MikroORM>(MikroORM)

    await clearDatabase(orm, 'public', ['users'])
    await orm.seeder.seed(
      BaseSeeder,
      UserSeeder,
      TestMaterialSeeder,
      TestCategorySeeder,
      TestProcessSeeder,
      TestTagSeeder,
      TestVariantSeeder,
    )

    await gql.signIn('admin', 'password')
  })

  afterAll(async () => {
    await app.close()
  })

  describe('single Change with multiple entity edits', () => {
    let changeID: string
    let newProcessID: string
    const existingItemID = ITEM_IDS[0]
    const existingVariantID = VARIANT_IDS[0]

    test('should create a Process edit inside a new Change', async () => {
      const res = await gql.send(
        graphql(`
          mutation HistorySpecCreateProcess($input: CreateProcessInput!) {
            createProcess(input: $input) {
              process {
                id
              }
              change {
                id
                status
              }
            }
          }
        `),
        {
          input: {
            name: 'Change-Flow Process',
            intent: 'RECYCLE',
            change: { title: 'Multi-entity change', status: ChangeStatus.Draft },
          },
        },
      )
      expect(res.errors).toBeUndefined()
      expect(res.data?.createProcess?.process).toBeDefined()
      expect(res.data?.createProcess?.change).toBeDefined()
      newProcessID = res.data!.createProcess!.process!.id
      changeID = res.data!.createProcess!.change!.id
    })

    test('should add an Item update to the same Change', async () => {
      const res = await gql.send(
        graphql(`
          mutation HistorySpecUpdateItem($input: UpdateItemInput!) {
            updateItem(input: $input) {
              item {
                id
              }
              change {
                id
              }
            }
          }
        `),
        {
          input: {
            id: existingItemID,
            name: 'Item updated via Change',
            changeID,
          },
        },
      )
      expect(res.errors).toBeUndefined()
      expect(res.data?.updateItem?.item).toBeDefined()
      expect(res.data?.updateItem?.change?.id).toBe(changeID)
    })

    test('should add a Variant update to the same Change', async () => {
      const res = await gql.send(
        graphql(`
          mutation HistorySpecUpdateVariant($input: UpdateVariantInput!) {
            updateVariant(input: $input) {
              variant {
                id
              }
              change {
                id
              }
            }
          }
        `),
        {
          input: {
            id: existingVariantID,
            name: 'Variant updated via Change',
            changeID,
          },
        },
      )
      expect(res.errors).toBeUndefined()
      expect(res.data?.updateVariant?.variant).toBeDefined()
      expect(res.data?.updateVariant?.change?.id).toBe(changeID)
    })

    test('should approve the Change', async () => {
      const res = await gql.send(
        graphql(`
          mutation HistorySpecApproveChange($input: UpdateChangeInput!) {
            updateChange(input: $input) {
              change {
                id
                status
              }
            }
          }
        `),
        { input: { id: changeID, status: ChangeStatus.Approved } },
      )
      expect(res.errors).toBeUndefined()
      expect(res.data?.updateChange?.change?.status).toBe('APPROVED')
    })

    test('should merge the Change', async () => {
      const res = await gql.send(
        graphql(`
          mutation HistorySpecMergeChange($id: ID!) {
            mergeChange(id: $id) {
              change {
                id
                status
              }
            }
          }
        `),
        { id: changeID },
      )
      expect(res.errors).toBeUndefined()
      expect(res.data?.mergeChange?.change).toBeDefined()
    })

    test('should have history on the new Process after merge', async () => {
      const res = await gql.send(
        graphql(`
          query HistorySpecGetProcess($id: ID!) {
            process(id: $id) {
              id
              history {
                datetime
                user {
                  id
                }
                original
                changes
              }
            }
          }
        `),
        { id: newProcessID },
      )
      expect(res.errors).toBeUndefined()
      const history = res.data?.process?.history
      expect(history).toHaveLength(1)
      expect(history![0].user).toBeDefined()
      expect(history![0].original).toBeNull()
      expect(history![0].changes).toBeTruthy()
    })

    test('should have history on the updated Item after merge', async () => {
      const res = await gql.send(
        graphql(`
          query HistorySpecGetItem($id: ID!) {
            item(id: $id) {
              id
              history {
                datetime
                user {
                  id
                }
                original
                changes
              }
            }
          }
        `),
        { id: existingItemID },
      )
      expect(res.errors).toBeUndefined()
      const history = res.data?.item?.history
      expect(history!.length).toBeGreaterThanOrEqual(1)
      const latest = history!.at(-1)!
      expect(latest.user).toBeDefined()
      expect(latest.changes).toBeTruthy()
    })

    test('should have history on the updated Variant after merge', async () => {
      const res = await gql.send(
        graphql(`
          query HistorySpecGetVariant($id: ID!) {
            variant(id: $id) {
              id
              history {
                datetime
                user {
                  id
                }
                original
                changes
              }
            }
          }
        `),
        { id: existingVariantID },
      )
      expect(res.errors).toBeUndefined()
      const history = res.data?.variant?.history
      expect(history!.length).toBeGreaterThanOrEqual(1)
      const latest = history!.at(-1)!
      expect(latest.user).toBeDefined()
      expect(latest.changes).toBeTruthy()
    })
  })
})
