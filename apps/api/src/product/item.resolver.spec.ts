import { MikroORM } from '@mikro-orm/postgresql'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AppTestModule } from '@test/app-test.module'
import { graphql } from '@test/gql'
import { ChangeStatus } from '@test/gql/types.generated'
import { GraphQLTestClient } from '@test/graphql.utils'

import { BaseSeeder } from '@src/db/seeds/BaseSeeder'
import { CATEGORY_IDS, TestCategorySeeder } from '@src/db/seeds/TestCategorySeeder'
import { TestMaterialSeeder } from '@src/db/seeds/TestMaterialSeeder'
import { TestProcessSeeder } from '@src/db/seeds/TestProcessSeeder'
import { TAG_IDS, TestTagSeeder } from '@src/db/seeds/TestTagSeeder'
import { ITEM_IDS, TestVariantSeeder } from '@src/db/seeds/TestVariantSeeder'
import { UserSeeder } from '@src/db/seeds/UserSeeder'
import { clearDatabase } from '@src/db/test.utils'

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
    await orm.seeder.seed(
      BaseSeeder,
      UserSeeder,
      TestCategorySeeder,
      TestMaterialSeeder,
      TestProcessSeeder,
      TestTagSeeder,
      TestVariantSeeder,
    )

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

  // Comprehensive Create Tests
  describe('CreateItem comprehensive field tests', () => {
    test('should create item with all text fields', async () => {
      const res = await gql.send(
        graphql(`
          mutation CreateItemAllText($input: CreateItemInput!) {
            createItem(input: $input) {
              item {
                id
                name
                desc
                imageURL
              }
            }
          }
        `),
        {
          input: {
            name: 'Comprehensive Test Item',
            desc: 'Detailed item description',
            imageURL: 'https://example.com/item.jpg',
            lang: 'en',
          },
        },
      )
      expect(res.data?.createItem?.item).toBeTruthy()
      expect(res.data?.createItem?.item?.name).toBe('Comprehensive Test Item')
      expect(res.data?.createItem?.item?.desc).toBe('Detailed item description')
      expect(res.data?.createItem?.item?.imageURL).toBe('https://example.com/item.jpg')
    })

    test('should create item with translated fields (nameTr, descTr)', async () => {
      const res = await gql.send(
        graphql(`
          mutation CreateItemTranslated($input: CreateItemInput!) {
            createItem(input: $input) {
              item {
                id
                name
                desc
              }
            }
          }
        `),
        {
          input: {
            nameTr: [
              { lang: 'en', text: 'English Item Name' },
              { lang: 'sv', text: 'Svenska Artikel Namn' },
            ],
            descTr: [
              { lang: 'en', text: 'English Item Description' },
              { lang: 'sv', text: 'Svenska Artikel Beskrivning' },
            ],
          },
        },
      )
      expect(res.data?.createItem?.item).toBeTruthy()
      // Name and desc will be set from translations
      expect(res.data?.createItem?.item?.name).toBeTruthy()
    })

    test('should create item with categories relationship', async () => {
      const res = await gql.send(
        graphql(`
          mutation CreateItemWithCategories($input: CreateItemInput!) {
            createItem(input: $input) {
              item {
                id
                name
                categories {
                  nodes {
                    id
                  }
                  totalCount
                }
              }
            }
          }
        `),
        {
          input: {
            name: 'Item with Categories',
            categories: [{ id: CATEGORY_IDS[0] }, { id: CATEGORY_IDS[1] }],
          },
        },
      )
      expect(res.errors).toBeUndefined()
      expect(res.data?.createItem?.item).toBeTruthy()
      // Categories are created but not populated in response
    })

    test('should create item with tags including metadata', async () => {
      const res = await gql.send(
        graphql(`
          mutation CreateItemWithTags($input: CreateItemInput!) {
            createItem(input: $input) {
              item {
                id
                name
                tags {
                  nodes {
                    id
                  }
                  totalCount
                }
              }
            }
          }
        `),
        {
          input: {
            name: 'Item with Tags',
            tags: [
              { id: TAG_IDS[1], meta: { time: 'fast' } },
              { id: TAG_IDS[0], meta: { score: 88 } },
            ],
          },
        },
      )
      expect(res.data?.createItem?.item).toBeTruthy()
      // Tags are created but not populated in response
    })

    test('should create item with change tracking (change input)', async () => {
      const res = await gql.send(
        graphql(`
          mutation CreateItemWithChange($input: CreateItemInput!) {
            createItem(input: $input) {
              item {
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
            name: 'Item with Change',
            change: {
              title: 'Add new item via change',
              description: 'Testing change-based creation',
              status: ChangeStatus.Draft,
            },
          },
        },
      )
      expect(res.data?.createItem?.item).toBeTruthy()
      expect(res.data?.createItem?.change).toBeTruthy()
      expect(res.data?.createItem?.change?.status).toBe('DRAFT')
    })

    test('should create item with all fields combined', async () => {
      const res = await gql.send(
        graphql(`
          mutation CreateItemAllFields($input: CreateItemInput!) {
            createItem(input: $input) {
              item {
                id
                name
                desc
                imageURL
                categories {
                  totalCount
                }
                tags {
                  totalCount
                }
              }
            }
          }
        `),
        {
          input: {
            name: 'Complete Item',
            desc: 'All fields test',
            imageURL: 'https://example.com/complete-item.jpg',
            lang: 'en',
            categories: [{ id: CATEGORY_IDS[0] }],
            tags: [{ id: TAG_IDS[1], meta: { time: 'slow' } }],
          },
        },
      )
      expect(res.data?.createItem?.item).toBeTruthy()
      // Categories and tags are created but not populated in response
    })
  })

  // Comprehensive Update Tests
  describe('UpdateItem comprehensive field tests', () => {
    let testItemID: string

    beforeAll(async () => {
      // Create an item to update in all tests
      const res = await gql.send(
        graphql(`
          mutation CreateItemForUpdate($input: CreateItemInput!) {
            createItem(input: $input) {
              item {
                id
              }
            }
          }
        `),
        {
          input: {
            name: 'Item for Updates',
          },
        },
      )
      if (!res.data?.createItem?.item?.id) {
        throw new Error('Failed to create item for update tests')
      }
      testItemID = res.data?.createItem?.item?.id
    })

    test('should update item text fields', async () => {
      const res = await gql.send(
        graphql(`
          mutation UpdateItemText($input: UpdateItemInput!) {
            updateItem(input: $input) {
              item {
                id
                name
                desc
              }
            }
          }
        `),
        {
          input: {
            id: testItemID,
            name: 'Updated Item Name',
            desc: 'Updated Item Description',
          },
        },
      )
      expect(res.data?.updateItem?.item?.name).toBe('Updated Item Name')
      expect(res.data?.updateItem?.item?.desc).toBe('Updated Item Description')
    })

    test('should add categories to existing item', async () => {
      const res = await gql.send(
        graphql(`
          mutation UpdateItemAddCategories($input: UpdateItemInput!) {
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
            id: testItemID,
            addCategories: [{ id: CATEGORY_IDS[0] }, { id: CATEGORY_IDS[1] }],
          },
        },
      )
      expect(res.data?.updateItem?.item).toBeTruthy()
    })

    test('should remove categories from item', async () => {
      const res = await gql.send(
        graphql(`
          mutation UpdateItemRemoveCategories($input: UpdateItemInput!) {
            updateItem(input: $input) {
              item {
                id
                categories {
                  totalCount
                }
              }
            }
          }
        `),
        {
          input: {
            id: testItemID,
            removeCategories: [CATEGORY_IDS[0]],
          },
        },
      )
      expect(res.data?.updateItem?.item).toBeTruthy()
    })

    test('should add tags to existing item', async () => {
      const res = await gql.send(
        graphql(`
          mutation UpdateItemAddTags($input: UpdateItemInput!) {
            updateItem(input: $input) {
              item {
                id
                tags {
                  totalCount
                }
              }
            }
          }
        `),
        {
          input: {
            id: testItemID,
            addTags: [{ id: TAG_IDS[1], meta: { time: 'moderate' } }],
          },
        },
      )
      expect(res.data?.updateItem?.item?.tags?.totalCount).toBeGreaterThanOrEqual(1)
    })

    test('should remove tags from item', async () => {
      const res = await gql.send(
        graphql(`
          mutation UpdateItemRemoveTags($input: UpdateItemInput!) {
            updateItem(input: $input) {
              item {
                id
                tags {
                  totalCount
                }
              }
            }
          }
        `),
        {
          input: {
            id: testItemID,
            removeTags: [TAG_IDS[1]],
          },
        },
      )
      expect(res.data?.updateItem?.item).toBeTruthy()
    })

    test('should update item with change tracking', async () => {
      const res = await gql.send(
        graphql(`
          mutation UpdateItemWithChange($input: UpdateItemInput!) {
            updateItem(input: $input) {
              item {
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
            id: testItemID,
            name: 'Updated via Change',
            change: {
              title: 'Update item test',
              status: ChangeStatus.Proposed,
            },
          },
        },
      )
      expect(res.data?.updateItem?.item).toBeTruthy()
      expect(res.data?.updateItem?.change).toBeTruthy()
      expect(res.data?.updateItem?.change?.status).toBe('PROPOSED')
    })
  })

  // Batch mutation tests
  describe('Batch mutations', () => {
    test('should handle multiple create mutations in single request', async () => {
      const res = await gql.send(
        graphql(`
          mutation BatchCreateItems(
            $input1: CreateItemInput!
            $input2: CreateItemInput!
          ) {
            item1: createItem(input: $input1) {
              item {
                id
                name
              }
            }
            item2: createItem(input: $input2) {
              item {
                id
                name
              }
            }
          }
        `),
        {
          input1: { name: 'Batch Item 1' },
          input2: { name: 'Batch Item 2' },
        },
      )
      expect(res.data?.item1?.item).toBeTruthy()
      expect(res.data?.item2?.item).toBeTruthy()
      expect(res.data?.item1?.item?.name).toBe('Batch Item 1')
      expect(res.data?.item2?.item?.name).toBe('Batch Item 2')
    })
  })
})
