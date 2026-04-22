import { MikroORM } from '@mikro-orm/postgresql'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AppTestModule } from '@test/app-test.module'
import { graphql } from '@test/gql'
import { ChangeStatus } from '@test/gql/types.generated'
import { GraphQLTestClient } from '@test/graphql.utils'

import { BaseSeeder } from '@src/db/seeds/BaseSeeder'
import { ORG_IDS, TestProcessSeeder } from '@src/db/seeds/TestProcessSeeder'
import { TAG_IDS, TestTagSeeder } from '@src/db/seeds/TestTagSeeder'
import { UserSeeder } from '@src/db/seeds/UserSeeder'
import { clearDatabase } from '@src/db/test.utils'
import { Place, PlacesTag } from '@src/geo/place.entity'
import { Tag, TagType } from '@src/process/tag.entity'

describe('PlaceResolver (integration)', () => {
  let app: INestApplication
  let gql: GraphQLTestClient
  let orm: MikroORM
  const EXTRA_PLACE_TAG_ID = 'tag_place_extra_stage'

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppTestModule],
    }).compile()

    app = module.createNestApplication()
    await app.init()

    gql = new GraphQLTestClient(app)

    orm = module.get<MikroORM>(MikroORM)

    await clearDatabase(orm, 'public', ['users'])
    await orm.seeder.seed(BaseSeeder, UserSeeder, TestProcessSeeder, TestTagSeeder)

    const em = orm.em.fork()
    em.create(Tag, {
      id: EXTRA_PLACE_TAG_ID,
      name: { en: 'Extra Place Tag' },
      type: TagType.PLACE,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    await em.flush()

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
    const placeNodes = filterRes.data?.places.nodes ?? []
    expect(placeNodes.length).toBeGreaterThan(0)
    for (const node of placeNodes) {
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

  describe('change tracking for org and tag references', () => {
    let changeID: string
    let placeID: string
    let directPlaceID: string
    let updateChangeID: string

    test('creates a place in change mode without persisting place or place_tags rows', async () => {
      const res = await gql.send(
        graphql(`
          mutation PlaceResolverCreatePlaceInChange($input: CreatePlaceInput!) {
            createPlace(input: $input) {
              place {
                id
                org {
                  id
                }
                tags {
                  nodes {
                    id
                  }
                }
              }
              change {
                id
              }
            }
          }
        `),
        {
          input: {
            name: 'Changed Place',
            location: { latitude: 59.3293, longitude: 18.0686 },
            org: { id: ORG_IDS[0] },
            tags: [{ id: TAG_IDS[1] }],
            change: { title: 'Place change flow', status: ChangeStatus.Draft },
          },
        },
      )

      expect(res.errors).toBeUndefined()
      placeID = res.data!.createPlace!.place!.id
      changeID = res.data!.createPlace!.change!.id

      const em = orm.em.fork()
      expect(await em.findOne(Place, { id: placeID } as any)).toBeNull()
      expect(await em.count(PlacesTag, { place: placeID } as any)).toBe(0)
    })

    test('updates an existing place in change mode without mutating persisted refs early', async () => {
      const directRes = await gql.send(
        graphql(`
          mutation PlaceResolverCreateDirectPlace($input: CreatePlaceInput!) {
            createPlace(input: $input) {
              place {
                id
              }
            }
          }
        `),
        {
          input: {
            name: 'Direct Place For Change',
            location: { latitude: 60.0, longitude: 18.0 },
            org: { id: ORG_IDS[0] },
            tags: [{ id: TAG_IDS[1] }],
          },
        },
      )
      expect(directRes.errors).toBeUndefined()
      directPlaceID = directRes.data!.createPlace!.place!.id

      const res = await gql.send(
        graphql(`
          mutation PlaceResolverUpdatePlaceInChange($input: UpdatePlaceInput!) {
            updatePlace(input: $input) {
              place {
                id
              }
              currentPlace {
                id
                org {
                  id
                }
              }
              change {
                id
              }
            }
          }
        `),
        {
          input: {
            id: directPlaceID,
            org: { id: ORG_IDS[1] },
            removeTags: [TAG_IDS[1]],
            addTags: [{ id: EXTRA_PLACE_TAG_ID }],
            change: { title: 'Place update refs', status: ChangeStatus.Draft },
          },
        },
      )

      expect(res.errors).toBeUndefined()
      updateChangeID = res.data!.updatePlace!.change!.id
      expect(res.data!.updatePlace!.currentPlace?.org?.id).toBe(ORG_IDS[0])

      const em = orm.em.fork()
      const persistedPlace = await em.findOne(Place, { id: directPlaceID } as any, {
        populate: ['org', 'place_tags', 'place_tags.tag'],
      })
      expect(persistedPlace?.org?.id).toBe(ORG_IDS[0])
      expect(persistedPlace?.place_tags.getItems().map((tag) => tag.tag.id)).toEqual([TAG_IDS[1]])
    })

    test('merges staged place references correctly for both create and update flows', async () => {
      const approveRes = await gql.send(
        graphql(`
          mutation PlaceResolverApproveChange($input: UpdateChangeInput!) {
            updateChange(input: $input) {
              change {
                id
                status
              }
            }
          }
        `),
        { input: { id: changeID, status: ChangeStatus.Approved } },
      )
      expect(approveRes.errors).toBeUndefined()
      expect(approveRes.data?.updateChange?.change?.status).toBe('APPROVED')

      const mergeRes = await gql.send(
        graphql(`
          mutation PlaceResolverMergeChange($id: ID!) {
            mergeChange(id: $id) {
              change {
                id
                status
              }
            }
          }
        `),
        { id: changeID },
      )
      expect(mergeRes.errors).toBeUndefined()
      expect(mergeRes.data?.mergeChange?.change?.status).toBe('MERGED')

      const approveUpdateRes = await gql.send(
        graphql(`
          mutation PlaceResolverApproveUpdateChange($input: UpdateChangeInput!) {
            updateChange(input: $input) {
              change {
                status
              }
            }
          }
        `),
        { input: { id: updateChangeID, status: ChangeStatus.Approved } },
      )
      expect(approveUpdateRes.errors).toBeUndefined()

      const mergeUpdateRes = await gql.send(
        graphql(`
          mutation PlaceResolverMergeUpdateChange($id: ID!) {
            mergeChange(id: $id) {
              change {
                status
              }
            }
          }
        `),
        { id: updateChangeID },
      )
      expect(mergeUpdateRes.errors).toBeUndefined()

      const em = orm.em.fork()
      const mergedCreatedPlace = await em.findOne(Place, { id: placeID } as any, {
        populate: ['org', 'place_tags', 'place_tags.tag'],
      })
      expect(mergedCreatedPlace?.org?.id).toBe(ORG_IDS[0])
      expect(mergedCreatedPlace?.place_tags.getItems().map((tag) => tag.tag.id)).toEqual([
        TAG_IDS[1],
      ])

      const mergedUpdatedPlace = await em.findOne(Place, { id: directPlaceID } as any, {
        populate: ['org', 'place_tags', 'place_tags.tag'],
      })
      expect(mergedUpdatedPlace?.org?.id).toBe(ORG_IDS[1])
      expect(mergedUpdatedPlace?.place_tags.getItems().map((tag) => tag.tag.id)).toEqual([
        EXTRA_PLACE_TAG_ID,
      ])
    })
  })
})
