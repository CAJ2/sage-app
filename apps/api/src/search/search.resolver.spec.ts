import { MikroORM } from '@mikro-orm/postgresql'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AppTestModule } from '@test/app-test.module'
import { graphql } from '@test/gql'
import { SearchType } from '@test/gql/graphql'
import { GraphQLTestClient } from '@test/graphql.utils'
import { type Mock } from 'vitest'

import { MeiliService } from '@src/common/meilisearch.service'
import { BaseSeeder } from '@src/db/seeds/BaseSeeder'
import { CATEGORY_IDS, TestCategorySeeder } from '@src/db/seeds/TestCategorySeeder'
import { TestMaterialSeeder } from '@src/db/seeds/TestMaterialSeeder'
import { TestVariantSeeder, VARIANT_IDS } from '@src/db/seeds/TestVariantSeeder'
import { UserSeeder } from '@src/db/seeds/UserSeeder'
import { clearDatabase } from '@src/db/test.utils'

describe('SearchResolver (integration)', () => {
  let app: INestApplication
  let gql: GraphQLTestClient
  let searchMock: Mock<any>
  let federatedSearchMock: Mock<any>

  const emptySearchResult = {
    hits: [],
    query: '',
    processingTimeMs: 0,
    limit: 11,
    offset: 0,
    estimatedTotalHits: 0,
  }

  const emptyFederatedResult = {
    hits: [],
    processingTimeMs: 0,
    limit: 11,
    offset: 0,
    estimatedTotalHits: 0,
  }

  beforeAll(async () => {
    searchMock = vi.fn().mockResolvedValue(emptySearchResult)
    federatedSearchMock = vi.fn().mockResolvedValue(emptyFederatedResult)

    const meiliService = {
      search: searchMock,
      federatedSearch: federatedSearchMock,
    }

    const module: TestingModule = await Test.createTestingModule({
      imports: [AppTestModule],
    })
      .overrideProvider(MeiliService)
      .useValue(meiliService)
      .compile()

    app = module.createNestApplication()
    await app.init()

    gql = new GraphQLTestClient(app)

    const orm = module.get<MikroORM>(MikroORM)

    await clearDatabase(orm, 'public', ['users'])
    await orm.seeder.seed(
      BaseSeeder,
      UserSeeder,
      TestMaterialSeeder,
      TestVariantSeeder,
      TestCategorySeeder,
    )

    await gql.signIn('admin', 'password')
  })

  afterAll(async () => {
    await app.close()
  })

  test('should hydrate variant from database via federated search', async () => {
    const variantId = VARIANT_IDS[0]
    federatedSearchMock.mockResolvedValueOnce({
      hits: [
        {
          id: variantId,
          _federation: {
            indexUid: 'variants_en',
            queriesPosition: 0,
            weightedRankingScore: 1.0,
          },
        },
      ],
      processingTimeMs: 2,
      limit: 11,
      offset: 0,
      estimatedTotalHits: 1,
    })
    const res = await gql.send(
      graphql(`
        query SearchResolverSearchAll($query: String!, $limit: Int) {
          search(query: $query, limit: $limit) {
            nodes {
              __typename
              ... on Named {
                id
                name
              }
            }
            totalCount
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
          }
        }
      `),
      {
        query: 'variant',
        limit: 10,
      },
    )
    expect(res.data?.search).toBeTruthy()
    expect(res.data?.search.totalCount).toBe(1)
    expect(res.data?.search.nodes?.[0]?.__typename).toBe('Variant')
    expect((res.data?.search.nodes?.[0] as any)?.id).toBe(variantId)
  })

  test('should hydrate categories from database via single-index search', async () => {
    searchMock.mockResolvedValueOnce({
      hits: [{ id: CATEGORY_IDS[0] }, { id: CATEGORY_IDS[1] }, { id: CATEGORY_IDS[2] }],
      query: 'packaging',
      processingTimeMs: 3,
      limit: 11,
      offset: 0,
      estimatedTotalHits: 3,
    })
    const res = await gql.send(
      graphql(`
        query SearchResolverCategoryResults(
          $query: String!
          $types: [SearchType!]
          $limit: Int
        ) {
          search(query: $query, types: $types, limit: $limit) {
            nodes {
              __typename
              ... on Named {
                id
                name
              }
            }
            totalCount
          }
        }
      `),
      {
        query: 'packaging',
        types: [SearchType.Category],
        limit: 10,
      },
    )
    expect(res.data?.search).toBeTruthy()
    expect(res.data?.search.totalCount).toBe(3)
    const nodes = res.data?.search.nodes as any[]
    expect(nodes).toHaveLength(3)
    expect(nodes[0].__typename).toBe('Category')
    expect(nodes[0].name).toBe('Packaging')
    expect(nodes[1].name).toBe('Electronics')
    expect(nodes[2].name).toBe('Bottles')
  })

  test('should search with specific types', async () => {
    const res = await gql.send(
      graphql(`
        query SearchResolverSearchTypes(
          $query: String!
          $types: [SearchType!]
          $limit: Int
        ) {
          search(query: $query, types: $types, limit: $limit) {
            nodes {
              __typename
              ... on Named {
                id
                name
              }
            }
            totalCount
          }
        }
      `),
      {
        query: 'test',
        types: [SearchType.Variant, SearchType.Item],
        limit: 10,
      },
    )
    expect(res.data?.search).toBeTruthy()
    expect(Array.isArray(res.data?.search.nodes)).toBe(true)
  })

  test('should search with location filter', async () => {
    const res = await gql.send(
      graphql(`
        query SearchResolverSearchWithLocation(
          $query: String!
          $latlong: [Float!]
          $limit: Int
        ) {
          search(query: $query, latlong: $latlong, limit: $limit) {
            nodes {
              __typename
              ... on Named {
                id
                name
              }
            }
            totalCount
          }
        }
      `),
      {
        query: 'test',
        latlong: [37.7749, -122.4194], // San Francisco coordinates
        limit: 10,
      },
    )
    expect(res.data?.search).toBeTruthy()
    expect(Array.isArray(res.data?.search.nodes)).toBe(true)
  })

  test('should handle empty search results', async () => {
    const res = await gql.send(
      graphql(`
        query SearchResolverSearchEmpty($query: String!, $limit: Int) {
          search(query: $query, limit: $limit) {
            nodes {
              __typename
            }
            totalCount
          }
        }
      `),
      {
        query: 'nonexistent-search-term-xyz123',
        limit: 10,
      },
    )
    expect(res.data?.search).toBeTruthy()
    expect(res.data?.search.totalCount).toBe(0)
    expect(res.data?.search.nodes?.length).toBe(0)
  })

  test('should search with pagination', async () => {
    const res = await gql.send(
      graphql(`
        query SearchResolverSearchPagination(
          $query: String!
          $limit: Int
          $offset: Int
        ) {
          search(query: $query, limit: $limit, offset: $offset) {
            nodes {
              __typename
              ... on Named {
                id
                name
              }
            }
            totalCount
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
          }
        }
      `),
      {
        query: 'test',
        limit: 5,
        offset: 0,
      },
    )
    expect(res.data?.search).toBeTruthy()
    expect(Array.isArray(res.data?.search.nodes)).toBe(true)
  })
})
