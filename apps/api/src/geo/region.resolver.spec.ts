import { MikroORM } from '@mikro-orm/postgresql'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { BaseSeeder } from '@src/db/seeds/BaseSeeder'
import { UserSeeder } from '@src/db/seeds/UserSeeder'
import { clearDatabase } from '@src/db/test.utils'
import { AppTestModule } from '@test/app-test.module'
import { graphql } from '@test/gql'
import { GraphQLTestClient } from '@test/graphql.utils'

describe('RegionResolver (integration)', () => {
  let app: INestApplication
  let gql: GraphQLTestClient
  let regionID: string

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

    // Get a region for testing if any exist
    const region = await orm.em.findOne('Region', {})
    if (region) {
      regionID = (region as any).id
    }
  })

  afterAll(async () => {
    await app.close()
  })

  test('should query regions with pagination', async () => {
    const res = await gql.send(
      graphql(`
        query RegionResolverListRegions($first: Int) {
          regions(first: $first) {
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
    expect(res.data?.regions).toBeTruthy()
    expect(Array.isArray(res.data?.regions.nodes)).toBe(true)
  })

  test('should query a single region when it exists', async () => {
    if (!regionID) {
      return // Skip if no regions exist
    }

    const res = await gql.send(
      graphql(`
        query RegionResolverGetRegion($id: ID!) {
          region(id: $id) {
            id
            name
          }
        }
      `),
      { id: regionID },
    )
    expect(res.data?.region).toBeTruthy()
    expect(res.data?.region?.id).toBe(regionID)
  })

  test('should search regions by point with pagination', async () => {
    const res = await gql.send(
      graphql(`
        query RegionResolverSearchRegionsByPoint(
          $latlong: [Float!]!
          $first: Int
        ) {
          searchRegionsByPoint(latlong: $latlong, first: $first) {
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
      {
        latlong: [37.7749, -122.4194], // San Francisco coordinates
        first: 10,
      },
    )
    expect(res.data?.searchRegionsByPoint).toBeTruthy()
    expect(Array.isArray(res.data?.searchRegionsByPoint.nodes)).toBe(true)
  })

  test('should return error for non-existent region', async () => {
    const res = await gql.send(
      graphql(`
        query RegionResolverGetNonExistentRegion($id: ID!) {
          region(id: $id) {
            id
          }
        }
      `),
      { id: 'non-existent-id' },
    )
    expect(res.errors).toBeTruthy()
    expect(res.errors?.[0].message).toContain('Region not found')
  })
})
