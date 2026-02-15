import { MikroORM } from '@mikro-orm/postgresql'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AppTestModule } from '@test/app-test.module'
import { graphql } from '@test/gql'
import { GraphQLTestClient } from '@test/graphql.utils'

import { BaseSeeder } from '@src/db/seeds/BaseSeeder'
import { TestMaterialSeeder } from '@src/db/seeds/TestMaterialSeeder'
import { TestVariantSeeder, VARIANT_IDS } from '@src/db/seeds/TestVariantSeeder'
import { UserSeeder } from '@src/db/seeds/UserSeeder'
import { clearDatabase } from '@src/db/test.utils'

describe('VariantResolver (integration)', () => {
  let app: INestApplication
  let gql: GraphQLTestClient
  let variantID: string

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

    variantID = VARIANT_IDS[0]
  })

  afterAll(async () => {
    await app.close()
  })

  test('should query variants with pagination', async () => {
    const res = await gql.send(
      graphql(`
        query VariantResolverListVariants($first: Int) {
          variants(first: $first) {
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
    expect(res.data?.variants.nodes?.length).toBeGreaterThan(0)
    expect(res.data?.variants.totalCount).toBeGreaterThan(0)
  })

  test('should query a single variant', async () => {
    const res = await gql.send(
      graphql(`
        query VariantResolverGetVariant($id: ID!) {
          variant(id: $id) {
            id
            name
          }
        }
      `),
      { id: variantID },
    )
    expect(res.data?.variant).toBeTruthy()
    expect(res.data?.variant?.id).toBe(variantID)
  })

  test('should query variant schema', async () => {
    const res = await gql.send(
      graphql(`
        query VariantResolverGetVariantSchema {
          variantSchema {
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
    expect(res.data?.variantSchema).toBeTruthy()
    expect(res.data?.variantSchema?.create).toBeTruthy()
    expect(res.data?.variantSchema?.update).toBeTruthy()
  })

  test('should query variant items with pagination', async () => {
    const res = await gql.send(
      graphql(`
        query VariantResolverGetVariantItems($id: ID!, $first: Int) {
          variant(id: $id) {
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
      { id: variantID, first: 10 },
    )
    expect(res.data?.variant?.items).toBeTruthy()
    expect(Array.isArray(res.data?.variant?.items.nodes)).toBe(true)
  })

  test('should query variant orgs with pagination', async () => {
    const res = await gql.send(
      graphql(`
        query VariantResolverGetVariantOrgs($id: ID!, $first: Int) {
          variant(id: $id) {
            id
            orgs(first: $first) {
              nodes {
                org {
                  id
                  name
                }
              }
              totalCount
            }
          }
        }
      `),
      { id: variantID, first: 10 },
    )
    expect(res.data?.variant?.orgs).toBeTruthy()
    expect(Array.isArray(res.data?.variant?.orgs.nodes)).toBe(true)
  })

  test('should query variant tags with pagination', async () => {
    const res = await gql.send(
      graphql(`
        query VariantResolverGetVariantTags($id: ID!, $first: Int) {
          variant(id: $id) {
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
      { id: variantID, first: 10 },
    )
    expect(res.data?.variant?.tags).toBeTruthy()
    expect(Array.isArray(res.data?.variant?.tags.nodes)).toBe(true)
  })

  test('should query variant components with pagination', async () => {
    const res = await gql.send(
      graphql(`
        query VariantResolverGetVariantComponents($id: ID!, $first: Int) {
          variant(id: $id) {
            id
            components(first: $first) {
              nodes {
                component {
                  id
                  name
                }
              }
              totalCount
            }
          }
        }
      `),
      { id: variantID, first: 10 },
    )
    expect(res.data?.variant?.components).toBeTruthy()
    expect(Array.isArray(res.data?.variant?.components.nodes)).toBe(true)
  })

  test('should create a variant', async () => {
    const res = await gql.send(
      graphql(`
        mutation VariantResolverCreateVariant($input: CreateVariantInput!) {
          createVariant(input: $input) {
            variant {
              id
              name
            }
          }
        }
      `),
      {
        input: {
          name: 'Test Variant',
        },
      },
    )
    expect(res.data?.createVariant?.variant).toBeTruthy()
    expect(res.data?.createVariant?.variant?.name).toBe('Test Variant')
  })

  test('should update a variant', async () => {
    const res = await gql.send(
      graphql(`
        mutation VariantResolverUpdateVariant($input: UpdateVariantInput!) {
          updateVariant(input: $input) {
            variant {
              id
              name
            }
          }
        }
      `),
      {
        input: {
          id: variantID,
          name: 'Updated Variant Name',
        },
      },
    )
    expect(res.data?.updateVariant?.variant?.id).toBe(variantID)
  })

  test('should return error for non-existent variant', async () => {
    const res = await gql.send(
      graphql(`
        query VariantResolverGetNonExistentVariant($id: ID!) {
          variant(id: $id) {
            id
          }
        }
      `),
      { id: 'non-existent-id' },
    )
    expect(res.errors).toBeTruthy()
    expect(res.errors?.[0].message).toContain('Variant not found')
  })
})
