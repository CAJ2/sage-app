import { MikroORM } from '@mikro-orm/postgresql'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AppTestModule } from '@test/app-test.module'
import { graphql } from '@test/gql'
import { GraphQLTestClient } from '@test/graphql.utils'

import { BaseSeeder } from '@src/db/seeds/BaseSeeder'
import { UserSeeder } from '@src/db/seeds/UserSeeder'
import { clearDatabase } from '@src/db/test.utils'

describe('PlaceResolver (integration)', () => {
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
    await orm.seeder.seed(BaseSeeder, UserSeeder)

    await gql.signIn('admin', 'password')
  })

  afterAll(async () => {
    await app.close()
  })

  test('should query places with pagination', async () => {
    const res = await gql.send(
      graphql(`
        query PlaceResolverListPlaces($first: Int) {
          places(first: $first) {
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
    expect(res.data?.places).toBeTruthy()
    expect(Array.isArray(res.data?.places.nodes)).toBe(true)
  })

  test('should filter places by org', async () => {
    // 1. Create an org
    const orgRes = await gql.send(
      graphql(`
        mutation PlaceResolverCreateOrg($input: CreateOrgInput!) {
          createOrg(input: $input) {
            org {
              id
              name
            }
          }
        }
      `),
      {
        input: {
          name: 'Filter Org',
          slug: 'filter-org',
        },
      },
    )
    expect(orgRes.errors).toBeUndefined()
    const orgId = orgRes.data?.createOrg?.org?.id
    expect(orgId).toBeDefined()

    // 2. Create a place linked to this org
    const placeRes = await gql.send(
      graphql(`
        mutation PlaceResolverCreatePlace($input: CreatePlaceInput!) {
          createPlace(input: $input) {
            place {
              id
              name
            }
          }
        }
      `),
      {
        input: {
          name: 'Org Place',
          org: { id: orgId! },
          location: { latitude: 59.3293, longitude: 18.0686 },
        },
      },
    )
    expect(placeRes.errors).toBeUndefined()
    const placeId = placeRes.data?.createPlace?.place?.id
    expect(placeId).toBeDefined()

    // 3. Query places with org filter
    const filterRes = await gql.send(
      graphql(`
        query PlaceResolverFilterPlaces($query: String) {
          places(query: $query) {
            nodes {
              id
              name
              org {
                id
              }
            }
            totalCount
          }
        }
      `),
      { query: `org:${orgId}` },
    )

    expect(filterRes.errors).toBeUndefined()
    expect(filterRes.data?.places.nodes.length).toBeGreaterThan(0)
    for (const node of filterRes.data?.places.nodes ?? []) {
      expect(node.org?.id).toBe(orgId)
    }
  })

  test('should return error for non-existent place', async () => {
    const res = await gql.send(
      graphql(`
        query PlaceResolverGetNonExistentPlace($id: ID!) {
          place(id: $id) {
            id
          }
        }
      `),
      { id: 'non-existent-id' },
    )
    expect(res.errors).toBeTruthy()
    expect(res.errors?.[0].message).toContain('Place not found')
  })
})
