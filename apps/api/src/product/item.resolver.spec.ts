import { MikroORM } from '@mikro-orm/postgresql'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { BaseSeeder } from '@src/db/seeds/BaseSeeder'
import { TestMaterialSeeder } from '@src/db/seeds/TestMaterialSeeder'
import { ITEM_IDS, TestVariantSeeder } from '@src/db/seeds/TestVariantSeeder'
import { UserSeeder } from '@src/db/seeds/UserSeeder'
import { clearDatabase } from '@src/db/test.utils'
import { AppTestModule } from '@test/app-test.module'
import { graphql } from '@test/gql'
import { GraphQLTestClient } from '@test/graphql.utils'

describe('ItemResolver (integration)', () => {
  let app: INestApplication
  let gql: GraphQLTestClient
  let itemID: string

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppTestModule],
    }).compile()

    app = module.createNestApplication()
    await app.init()

    gql = new GraphQLTestClient(app)

    const orm = module.get<MikroORM>(MikroORM)

    await clearDatabase(orm, 'public', ['users'])
    await orm.seeder.seed(BaseSeeder, UserSeeder, TestMaterialSeeder, TestVariantSeeder)

    await gql.signIn('admin', 'password')

    itemID = ITEM_IDS[0]
  })

  afterAll(async () => {
    await app.close()
  })

  test('should query items with pagination', async () => {
    const res = await gql.send(
      graphql(`
        query ItemResolverListItems($first: Int) {
          items(first: $first) {
            nodes {
              id
              name
            }
            totalCount
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
          }
        }
      `),
      { first: 10 },
    )
    expect(res.data?.items.nodes?.length).toBeGreaterThan(0)
    expect(res.data?.items.totalCount).toBeGreaterThan(0)
  })

  test('should query a single item', async () => {
    const res = await gql.send(
      graphql(`
        query ItemResolverGetItem($id: ID!) {
          item(id: $id) {
            id
            name
          }
        }
      `),
      { id: itemID },
    )
    expect(res.data?.item).toBeTruthy()
    expect(res.data?.item?.id).toBe(itemID)
  })

  test('should query item schema', async () => {
    const res = await gql.send(
      graphql(`
        query ItemResolverGetItemSchema {
          itemSchema {
            create {
              schema
              uischema
            }
            update {
              schema
              uischema
            }
          }
        }
      `),
    )
    expect(res.data?.itemSchema).toBeTruthy()
    expect(res.data?.itemSchema?.create).toBeTruthy()
    expect(res.data?.itemSchema?.update).toBeTruthy()
  })

  test('should query item categories with pagination', async () => {
    const res = await gql.send(
      graphql(`
        query ItemResolverGetItemCategories($id: ID!, $first: Int) {
          item(id: $id) {
            id
            categories(first: $first) {
              nodes {
                id
                name
              }
              totalCount
            }
          }
        }
      `),
      { id: itemID, first: 10 },
    )
    expect(res.data?.item?.categories).toBeTruthy()
    expect(Array.isArray(res.data?.item?.categories.nodes)).toBe(true)
  })

  test('should query item tags with pagination', async () => {
    const res = await gql.send(
      graphql(`
        query ItemResolverGetItemTags($id: ID!, $first: Int) {
          item(id: $id) {
            id
            tags(first: $first) {
              nodes {
                id
                name
              }
              totalCount
            }
          }
        }
      `),
      { id: itemID, first: 10 },
    )
    expect(res.data?.item?.tags).toBeTruthy()
    expect(Array.isArray(res.data?.item?.tags.nodes)).toBe(true)
  })

  test('should query item variants with pagination', async () => {
    const res = await gql.send(
      graphql(`
        query ItemResolverGetItemVariants($id: ID!, $first: Int) {
          item(id: $id) {
            id
            variants(first: $first) {
              nodes {
                id
                name
              }
              totalCount
            }
          }
        }
      `),
      { id: itemID, first: 10 },
    )
    expect(res.data?.item?.variants).toBeTruthy()
    expect(Array.isArray(res.data?.item?.variants.nodes)).toBe(true)
  })

  test('should create an item', async () => {
    const res = await gql.send(
      graphql(`
        mutation ItemResolverCreateItem($input: CreateItemInput!) {
          createItem(input: $input) {
            item {
              id
              name
            }
          }
        }
      `),
      {
        input: {
          name: 'Test Item',
        },
      },
    )
    expect(res.data?.createItem?.item).toBeTruthy()
    expect(res.data?.createItem?.item?.name).toBe('Test Item')
  })

  test('should update an item', async () => {
    const res = await gql.send(
      graphql(`
        mutation ItemResolverUpdateItem($input: UpdateItemInput!) {
          updateItem(input: $input) {
            item {
              id
              name
            }
          }
        }
      `),
      {
        input: {
          id: itemID,
          name: 'Updated Item Name',
        },
      },
    )
    expect(res.data?.updateItem?.item?.id).toBe(itemID)
  })

  test('should return error for non-existent item', async () => {
    const res = await gql.send(
      graphql(`
        query ItemResolverGetNonExistentItem($id: ID!) {
          item(id: $id) {
            id
          }
        }
      `),
      { id: 'non-existent-id' },
    )
    expect(res.errors).toBeTruthy()
    expect(res.errors?.[0].message).toContain('Item not found')
  })
})
