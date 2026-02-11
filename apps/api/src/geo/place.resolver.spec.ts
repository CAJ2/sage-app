import { MikroORM } from '@mikro-orm/postgresql'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { BaseSeeder } from '@src/db/seeds/BaseSeeder'
import { UserSeeder } from '@src/db/seeds/UserSeeder'
import { clearDatabase } from '@src/db/test.utils'
import { AppTestModule } from '@test/app-test.module'
import { graphql } from '@test/gql'
import { GraphQLTestClient } from '@test/graphql.utils'

describe('PlaceResolver (integration)', () => {
  let app: INestApplication
  let gql: GraphQLTestClient
  let placeID: string

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

    // Get a place for testing if any exist
    const place = await orm.em.findOne('Place', {})
    if (place) {
      placeID = (place as any).id
    }
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

  test('should query a single place when it exists', async () => {
    if (!placeID) {
      return // Skip if no places exist
    }

    const res = await gql.send(
      graphql(`
        query PlaceResolverGetPlace($id: ID!) {
          place(id: $id) {
            id
            name
          }
        }
      `),
      { id: placeID },
    )
    expect(res.data?.place).toBeTruthy()
    expect(res.data?.place?.id).toBe(placeID)
  })

  test('should query place tags when place exists', async () => {
    if (!placeID) {
      return // Skip if no places exist
    }

    const res = await gql.send(
      graphql(`
        query PlaceResolverGetPlaceTags($id: ID!) {
          place(id: $id) {
            id
            tags {
              nodes {
                id
                name
              }
            }
          }
        }
      `),
      { id: placeID },
    )
    expect(res.data?.place).toBeTruthy()
    expect(res.data?.place?.tags?.nodes).toBeTruthy()
    expect(Array.isArray(res.data?.place?.tags?.nodes)).toBe(true)
  })

  test('should query place org when place exists', async () => {
    if (!placeID) {
      return // Skip if no places exist
    }

    const res = await gql.send(
      graphql(`
        query PlaceResolverGetPlaceOrg($id: ID!) {
          place(id: $id) {
            id
            org {
              id
              name
            }
          }
        }
      `),
      { id: placeID },
    )
    expect(res.data?.place).toBeTruthy()
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
