import { MikroORM } from '@mikro-orm/postgresql'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AppTestModule } from '@test/app-test.module'
import { graphql } from '@test/gql'
import { GraphQLTestClient } from '@test/graphql.utils'

import { BaseSeeder } from '@src/db/seeds/BaseSeeder'
import { RegionSeeder } from '@src/db/seeds/RegionSeeder'
import { UserSeeder } from '@src/db/seeds/UserSeeder'
import { clearDatabase } from '@src/db/test.utils'

describe('RegionResolver (integration)', () => {
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
    await orm.seeder.seed(BaseSeeder, UserSeeder, RegionSeeder)

    await gql.signIn('admin', 'password')
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

  test('should search regions by point with pagination', async () => {
    const res = await gql.send(
      graphql(`
        query RegionResolverSearchRegionsByPoint($latlong: [Float!]!, $first: Int) {
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

  describe('currentRegion', () => {
    afterEach(() => {
      gql.setHeader('x-location', undefined)
    })

    test('returns null when no X-Location header is set', async () => {
      const res = await gql.send(
        graphql(`
          query RegionResolverCurrentRegionNoHeader {
            currentRegion {
              region {
                id
              }
              regionHierarchy {
                id
              }
            }
          }
        `),
      )
      expect(res.data?.currentRegion).toBeNull()
    })

    test('resolves by WoF region ID', async () => {
      gql.setHeader('x-location', 'wof_102087579')
      const res = await gql.send(
        graphql(`
          query RegionResolverCurrentRegionByID {
            currentRegion {
              region {
                id
                placetype
              }
              regionHierarchy {
                id
                placetype
              }
            }
          }
        `),
      )
      expect(res.data?.currentRegion?.region?.id).toBe('wof_102087579')
      expect(res.data?.currentRegion?.region?.placetype).toBe('county')
      // hierarchy: SF county first (adminLevel=6), then CA (4), then US (2)
      const hierarchy = res.data?.currentRegion?.regionHierarchy
      expect(hierarchy?.length).toBe(3)
      expect(hierarchy?.[0]?.id).toBe('wof_102087579')
      expect(hierarchy?.[1]?.id).toBe('wof_85688637')
      expect(hierarchy?.[2]?.id).toBe('wof_85633793')
    })

    test('resolves by lat/lng (San Francisco)', async () => {
      gql.setHeader('x-location', '37.7749,-122.4194')
      const res = await gql.send(
        graphql(`
          query RegionResolverCurrentRegionByLatLng {
            currentRegion {
              region {
                id
                placetype
              }
              regionHierarchy {
                id
                placetype
              }
            }
          }
        `),
      )
      // SF coordinates fall inside the SF county bbox — same hierarchy as the WoF ID test
      const hierarchy = res.data?.currentRegion?.regionHierarchy
      expect(res.data?.currentRegion?.region?.id).toBe('wof_102087579')
      expect(hierarchy?.length).toBe(3)
      expect(hierarchy?.[0]?.id).toBe('wof_102087579')
      expect(hierarchy?.[1]?.id).toBe('wof_85688637')
      expect(hierarchy?.[2]?.id).toBe('wof_85633793')
    })
  })
})
