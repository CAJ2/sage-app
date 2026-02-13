import { MikroORM } from '@mikro-orm/postgresql'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { BaseSeeder } from '@src/db/seeds/BaseSeeder'
import {
  CATEGORY_IDS,
  TestCategorySeeder,
} from '@src/db/seeds/TestCategorySeeder'
import { UserSeeder } from '@src/db/seeds/UserSeeder'
import { clearDatabase } from '@src/db/test.utils'
import { AppTestModule } from '@test/app-test.module'
import { graphql } from '@test/gql'
import { GraphQLTestClient } from '@test/graphql.utils'
import { CATEGORY_ROOT } from './category.entity'

describe('CategoryResolver (integration)', () => {
  let app: INestApplication
  let gql: GraphQLTestClient
  let packagingID: string

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppTestModule],
    }).compile()

    app = module.createNestApplication()
    await app.init()

    gql = new GraphQLTestClient(app)

    const orm = module.get<MikroORM>(MikroORM)

    await clearDatabase(orm, 'public', ['users'])
    await orm.seeder.seed(BaseSeeder, UserSeeder, TestCategorySeeder)

    await gql.signIn('admin', 'password')

    packagingID = CATEGORY_IDS[0]
  })

  afterAll(async () => {
    await app.close()
  })

  test('should query categories with pagination', async () => {
    const res = await gql.send(
      graphql(`
        query CategoryResolverListCategories($first: Int) {
          categories(first: $first) {
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
    expect(res.data?.categories.nodes?.length).toBeGreaterThan(0)
    expect(res.data?.categories.totalCount).toBeGreaterThan(0)
  })

  test('should query a single category', async () => {
    const res = await gql.send(
      graphql(`
        query CategoryResolverGetCategory($id: ID!) {
          category(id: $id) {
            id
            name
          }
        }
      `),
      { id: packagingID },
    )
    expect(res.data?.category).toBeTruthy()
    expect(res.data?.category?.id).toBe(packagingID)
  })

  test('should query the root category', async () => {
    const res = await gql.send(
      graphql(`
        query CategoryResolverGetCategoryRoot {
          categoryRoot {
            id
            name
          }
        }
      `),
    )
    expect(res.data?.categoryRoot).toBeTruthy()
    expect(res.data?.categoryRoot?.id).toBe(CATEGORY_ROOT)
  })

  test('should query category schema', async () => {
    const res = await gql.send(
      graphql(`
        query CategoryResolverGetCategorySchema {
          categorySchema {
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
    expect(res.data?.categorySchema).toBeTruthy()
    expect(res.data?.categorySchema?.create).toBeTruthy()
    expect(res.data?.categorySchema?.update).toBeTruthy()
  })

  test('should query category parents with pagination', async () => {
    const res = await gql.send(
      graphql(`
        query CategoryResolverGetCategoryParents($id: ID!, $first: Int) {
          category(id: $id) {
            id
            parents(first: $first) {
              nodes {
                id
                name
              }
              totalCount
            }
          }
        }
      `),
      { id: packagingID, first: 10 },
    )
    expect(res.data?.category?.parents).toBeTruthy()
    expect(Array.isArray(res.data?.category?.parents.nodes)).toBe(true)
  })

  test('should query category children with pagination', async () => {
    const res = await gql.send(
      graphql(`
        query CategoryResolverGetCategoryChildren($id: ID!, $first: Int) {
          category(id: $id) {
            id
            children(first: $first) {
              nodes {
                id
                name
              }
              totalCount
            }
          }
        }
      `),
      { id: CATEGORY_ROOT, first: 10 },
    )
    expect(res.data?.category?.children).toBeTruthy()
    expect(Array.isArray(res.data?.category?.children.nodes)).toBe(true)
  })

  test('should query category items with pagination', async () => {
    const res = await gql.send(
      graphql(`
        query CategoryResolverGetCategoryItems($id: ID!, $first: Int) {
          category(id: $id) {
            id
            items(first: $first) {
              nodes {
                id
                name
              }
              totalCount
            }
          }
        }
      `),
      { id: packagingID, first: 10 },
    )
    expect(res.data?.category?.items).toBeTruthy()
    expect(Array.isArray(res.data?.category?.items.nodes)).toBe(true)
  })

  test('should update a category', async () => {
    const res = await gql.send(
      graphql(`
        mutation CategoryResolverUpdateCategory($input: UpdateCategoryInput!) {
          updateCategory(input: $input) {
            category {
              id
              name
            }
          }
        }
      `),
      {
        input: {
          id: packagingID,
          name: 'Updated Category Name',
        },
      },
    )
    expect(res.data?.updateCategory?.category?.id).toBe(packagingID)
  })

  test('should return error for non-existent category', async () => {
    const res = await gql.send(
      graphql(`
        query CategoryResolverGetNonExistentCategory($id: ID!) {
          category(id: $id) {
            id
          }
        }
      `),
      { id: 'non-existent-id' },
    )
    expect(res.errors).toBeTruthy()
    expect(res.errors?.[0].message).toContain('Category not found')
  })
})
