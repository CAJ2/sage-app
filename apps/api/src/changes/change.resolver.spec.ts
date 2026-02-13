import { MikroORM } from '@mikro-orm/postgresql'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { BaseSeeder } from '@src/db/seeds/BaseSeeder'
import { TestMaterialSeeder } from '@src/db/seeds/TestMaterialSeeder'
import { TestVariantSeeder, VARIANT_IDS } from '@src/db/seeds/TestVariantSeeder'
import { UserSeeder } from '@src/db/seeds/UserSeeder'
import { clearDatabase } from '@src/db/test.utils'
import { User } from '@src/users/users.entity'
import { AppTestModule } from '@test/app-test.module'
import { graphql } from '@test/gql'
import { GraphQLTestClient } from '@test/graphql.utils'
import { ChangeService } from './change.service'

describe('ChangeResolver (integration)', () => {
  let app: INestApplication
  let gql: GraphQLTestClient
  let changeService: ChangeService
  let changeID: string

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppTestModule],
    }).compile()

    app = module.createNestApplication()
    await app.init()

    gql = new GraphQLTestClient(app)

    changeService = module.get(ChangeService)
    const orm = module.get<MikroORM>(MikroORM)

    await clearDatabase(orm, 'public', ['users'])
    await orm.seeder.seed(
      BaseSeeder,
      UserSeeder,
      TestMaterialSeeder,
      TestVariantSeeder,
    )

    const user = await orm.em.findOne(User, {
      username: 'admin',
    })
    if (!user) {
      throw new Error('Admin user not found')
    }

    await gql.signIn('admin', 'password')

    // Insert a change using the service
    const change = await changeService.create(
      {
        title: 'Test Change',
        description: 'Integration test',
      },
      user.id,
    )
    changeID = change.id
  })

  afterAll(async () => {
    await app.close()
  })

  test('should query changes', async () => {
    const res = await gql.send(
      graphql(`
        query ChangeResolverListChanges($after: String, $first: Int) {
          changes(after: $after, first: $first) {
            nodes {
              id
              title
              description
            }
            totalCount
          }
        }
      `),
      { after: null, first: 10 },
    )
    expect(res.data?.changes.nodes?.length).toBeGreaterThan(0)
    expect(res.data?.changes.nodes?.at(0)).toHaveProperty('id')
  })

  test('should query a single change', async () => {
    const res = await gql.send(
      graphql(`
        query ChangeResolverGetChange($id: ID!) {
          change(id: $id) {
            id
            title
            description
          }
        }
      `),
      { id: changeID },
    )
    expect(res.data?.change).toBeTruthy()
    expect(res.data?.change?.id).toBe(changeID)
  })

  test('should create a change', async () => {
    const res = await gql.send(
      graphql(`
        mutation ChangeResolverCreateChange($input: CreateChangeInput!) {
          createChange(input: $input) {
            change {
              id
              title
            }
          }
        }
      `),
      {
        input: {
          title: 'New Change',
          description: 'Created by test',
        },
      },
    )
    expect(res.data?.createChange?.change).toHaveProperty('id')
    expect(res.data?.createChange?.change?.title).toBe('New Change')
  })

  test('should update a change', async () => {
    const res = await gql.send(
      graphql(`
        mutation ChangeResolverUpdateChange($input: UpdateChangeInput!) {
          updateChange(input: $input) {
            change {
              id
              title
            }
          }
        }
      `),
      {
        input: {
          id: changeID,
          title: 'Updated Title',
        },
      },
    )
    expect(res.data?.updateChange?.change?.id).toBe(changeID)
    expect(res.data?.updateChange?.change?.title).toBe('Updated Title')
  })

  test('should make an edit to a Variant', async () => {
    const res = await gql.send(
      graphql(`
        mutation ChangeResolverEditVariant($input: UpdateVariantInput!) {
          updateVariant(input: $input) {
            change {
              id
              edits(first: 10) {
                nodes {
                  id
                  entityName
                }
              }
            }
            variant {
              name
            }
          }
        }
      `),
      {
        input: {
          id: VARIANT_IDS[0],
          changeID,
          name: 'Updated Name',
        },
      },
    )
    expect(res.data?.updateVariant).toBeTruthy()
    const body = res.data?.updateVariant
    expect(body?.change?.id).toBe(changeID)
    // expect(body?.variant?.name).toBe(`Variant ${VARIANT_IDS[0]}`)
    expect(body?.change?.edits?.nodes?.length).toEqual(1)
    expect(body?.change?.edits?.nodes?.[0]?.id).toBe(VARIANT_IDS[0])
    expect(body?.change?.edits?.nodes?.[0]?.entityName).toBe('Variant')
  })

  test('should discard an edit', async () => {
    const res = await gql.send(
      graphql(`
        mutation ChangeResolverDiscardEdit($changeID: ID!, $editID: ID!) {
          discardEdit(changeID: $changeID, editID: $editID) {
            success
            id
          }
        }
      `),
      {
        changeID,
        editID: VARIANT_IDS[0],
      },
    )
    expect(res.data?.discardEdit?.success).toBe(true)
    expect(res.data?.discardEdit?.id).toBe(VARIANT_IDS[0])
  })

  test('should delete a change', async () => {
    const res = await gql.send(
      graphql(`
        mutation ChangeResolverDeleteChange($id: ID!) {
          deleteChange(id: $id) {
            success
          }
        }
      `),
      {
        id: changeID,
      },
    )
    expect(res.data?.deleteChange?.success).toBe(true)
  })
})
