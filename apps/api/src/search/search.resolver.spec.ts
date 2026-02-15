import { MikroORM } from '@mikro-orm/postgresql'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AppTestModule } from '@test/app-test.module'
import { graphql } from '@test/gql'
import { SearchType } from '@test/gql/graphql'
import { GraphQLTestClient } from '@test/graphql.utils'
import { nanoid } from 'nanoid'
import { type Mock } from 'vitest'

import { BaseSeeder } from '@src/db/seeds/BaseSeeder'
import { TestMaterialSeeder } from '@src/db/seeds/TestMaterialSeeder'
import { TestVariantSeeder } from '@src/db/seeds/TestVariantSeeder'
import { UserSeeder } from '@src/db/seeds/UserSeeder'
import { clearDatabase } from '@src/db/test.utils'
import { Variant } from '@src/product/variant.model'

import { SearchService } from './search.service'

describe('SearchResolver (integration)', () => {
  let app: INestApplication
  let gql: GraphQLTestClient
  let searchAllMock: Mock<any>

  beforeAll(async () => {
    // Mock the search service
    searchAllMock = vi.fn(() => {
      return {
        items: [],
        count: 0,
      }
    })
    const searchService = {
      searchAll: searchAllMock,
    }
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppTestModule],
    })
      .overrideProvider(SearchService)
      .useValue(searchService)
      .compile()

    app = module.createNestApplication()
    await app.init()

    gql = new GraphQLTestClient(app)

    const orm = module.get<MikroORM>(MikroORM)

    await clearDatabase(orm, 'public', ['users'])
    await orm.seeder.seed(BaseSeeder, UserSeeder, TestMaterialSeeder, TestVariantSeeder)

    await gql.signIn('admin', 'password')
  })

  afterAll(async () => {
    await app.close()
  })

  test('should search across all types', async () => {
    searchAllMock.mockResolvedValueOnce({
      items: [
        {
          id: nanoid(),
          name: {
            en: 'Test Variant',
          },
          _type: Variant,
        },
      ],
      count: 1,
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
    expect((res.data?.search.nodes?.[0] as any)?.name).toBe('Test Variant')
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
