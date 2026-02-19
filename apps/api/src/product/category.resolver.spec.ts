import { MikroORM } from '@mikro-orm/postgresql'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AppTestModule } from '@test/app-test.module'
import { graphql } from '@test/gql'
import { GraphQLTestClient } from '@test/graphql.utils'

import { BaseSeeder } from '@src/db/seeds/BaseSeeder'
import { CATEGORY_IDS, TestCategorySeeder } from '@src/db/seeds/TestCategorySeeder'
import { TestMaterialSeeder } from '@src/db/seeds/TestMaterialSeeder'
import { TestProcessSeeder } from '@src/db/seeds/TestProcessSeeder'
import { TestTagSeeder } from '@src/db/seeds/TestTagSeeder'
import { TestVariantSeeder } from '@src/db/seeds/TestVariantSeeder'
import { UserSeeder } from '@src/db/seeds/UserSeeder'
import { clearDatabase } from '@src/db/test.utils'

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

  // Comprehensive Create Tests
  describe('CreateCategory comprehensive field tests', () => {
    test('should create category with all text fields', async () => {
      const res = await gql.send(
        graphql(`
          mutation CreateCategoryAllText($input: CreateCategoryInput!) {
            createCategory(input: $input) {
              category {
                id
                name
                desc
                descShort
                imageURL
              }
            }
          }
        `),
        {
          input: {
            name: 'New Test Category',
            desc: 'Detailed category description',
            descShort: 'Short desc',
            imageURL: 'https://example.com/category.jpg',
            lang: 'en',
          },
        },
      )
      expect(res.data?.createCategory?.category).toBeTruthy()
      expect(res.data?.createCategory?.category?.name).toBe('New Test Category')
      expect(res.data?.createCategory?.category?.desc).toBe('Detailed category description')
      expect(res.data?.createCategory?.category?.descShort).toBe('Short desc')
    })

    test('should create category with translated fields', async () => {
      const res = await gql.send(
        graphql(`
          mutation CreateCategoryTranslated($input: CreateCategoryInput!) {
            createCategory(input: $input) {
              category {
                id
                name
              }
            }
          }
        `),
        {
          input: {
            nameTr: [
              { lang: 'en', text: 'English Category' },
              { lang: 'sv', text: 'Svenska Kategori' },
            ],
            descTr: [
              { lang: 'en', text: 'English Description' },
              { lang: 'sv', text: 'Svenska Beskrivning' },
            ],
            descShortTr: [
              { lang: 'en', text: 'Short' },
              { lang: 'sv', text: 'Kort' },
            ],
          },
        },
      )
      expect(res.data?.createCategory?.category).toBeTruthy()
    })

    test('should create category with change tracking', async () => {
      const res = await gql.send(
        graphql(`
          mutation CreateCategoryWithChange($input: CreateCategoryInput!) {
            createCategory(input: $input) {
              category {
                id
                name
              }
              change {
                id
                title
                status
              }
            }
          }
        `),
        {
          input: {
            name: 'Category with Change',
            change: {
              title: 'Add new category',
              status: 'DRAFT',
            },
          },
        },
      )
      expect(res.data?.createCategory?.category).toBeTruthy()
      expect(res.data?.createCategory?.change).toBeTruthy()
      expect(res.data?.createCategory?.change?.status).toBe('DRAFT')
    })
  })

  // Comprehensive Update Tests
  describe('UpdateCategory comprehensive field tests', () => {
    let testCategoryID: string

    beforeAll(async () => {
      const res = await gql.send(
        graphql(`
          mutation CreateCategoryForUpdate($input: CreateCategoryInput!) {
            createCategory(input: $input) {
              category {
                id
              }
            }
          }
        `),
        {
          input: {
            name: 'Category for Updates',
          },
        },
      )
      testCategoryID = res.data?.createCategory?.category?.id
    })

    test('should update category text fields', async () => {
      const res = await gql.send(
        graphql(`
          mutation UpdateCategoryText($input: UpdateCategoryInput!) {
            updateCategory(input: $input) {
              category {
                id
                name
                desc
                descShort
              }
            }
          }
        `),
        {
          input: {
            id: testCategoryID,
            name: 'Updated Category Name',
            desc: 'Updated Description',
            descShort: 'Updated Short',
          },
        },
      )
      expect(res.data?.updateCategory?.category?.name).toBe('Updated Category Name')
      expect(res.data?.updateCategory?.category?.desc).toBe('Updated Description')
    })

    test('should update category with change tracking', async () => {
      const res = await gql.send(
        graphql(`
          mutation UpdateCategoryWithChange($input: UpdateCategoryInput!) {
            updateCategory(input: $input) {
              category {
                id
                name
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
            id: testCategoryID,
            name: 'Updated via Change',
            change: {
              title: 'Update category test',
              status: 'PROPOSED',
            },
          },
        },
      )
      expect(res.data?.updateCategory?.category).toBeTruthy()
      expect(res.data?.updateCategory?.change).toBeTruthy()
    })
  })
})
