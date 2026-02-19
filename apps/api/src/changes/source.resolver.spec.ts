import { MikroORM } from '@mikro-orm/postgresql'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AppTestModule } from '@test/app-test.module'
import { graphql } from '@test/gql'
import { SourceType } from '@test/gql/graphql'
import { GraphQLTestClient } from '@test/graphql.utils'

import { BaseSeeder } from '@src/db/seeds/BaseSeeder'
import { TestMaterialSeeder } from '@src/db/seeds/TestMaterialSeeder'
import { SOURCE_IDS, TestVariantSeeder } from '@src/db/seeds/TestVariantSeeder'
import { UserSeeder } from '@src/db/seeds/UserSeeder'
import { clearDatabase } from '@src/db/test.utils'

describe('SourceResolver (integration)', () => {
  let app: INestApplication
  let gql: GraphQLTestClient
  let sourceID: string

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

    sourceID = SOURCE_IDS[0]
  })

  afterAll(async () => {
    await app.close()
  })

  test('should query sources with pagination', async () => {
    const res = await gql.send(
      graphql(`
        query SourceResolverListSources($first: Int) {
          sources(first: $first) {
            nodes {
              id
              type
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
    expect(res.data?.sources.nodes?.length).toBeGreaterThan(0)
    expect(res.data?.sources.totalCount).toBeGreaterThan(0)
  })

  test('should query sources with type filter', async () => {
    const res = await gql.send(
      graphql(`
        query SourceResolverListSourcesByType($type: SourceType, $first: Int) {
          sources(type: $type, first: $first) {
            nodes {
              id
              type
            }
            totalCount
          }
        }
      `),
      {
        type: SourceType.File,
        first: 10,
      },
    )
    expect(res.data?.sources).toBeTruthy()
    expect(Array.isArray(res.data?.sources.nodes)).toBe(true)
  })

  test('should query a single source', async () => {
    const res = await gql.send(
      graphql(`
        query SourceResolverGetSource($id: ID!) {
          source(id: $id) {
            id
            type
          }
        }
      `),
      { id: sourceID },
    )
    expect(res.data?.source).toBeTruthy()
    expect(res.data?.source?.id).toBe(sourceID)
  })

  test('should create a source', async () => {
    const res = await gql.send(
      graphql(`
        mutation SourceResolverCreateSource($input: CreateSourceInput!) {
          createSource(input: $input) {
            source {
              id
              type
            }
          }
        }
      `),
      {
        input: {
          type: SourceType.File,
          location: 'https://example.com/test-datasheet.pdf',
        },
      },
    )
    expect(res.data?.createSource?.source).toBeTruthy()
    expect(res.data?.createSource?.source?.type).toBe(SourceType.File)
  })

  test('should update a source', async () => {
    const res = await gql.send(
      graphql(`
        mutation SourceResolverUpdateSource($input: UpdateSourceInput!) {
          updateSource(input: $input) {
            source {
              id
              location
            }
          }
        }
      `),
      {
        input: {
          id: sourceID,
          location: 'https://example.com/updated-source.pdf',
        },
      },
    )
    expect(res.data?.updateSource?.source?.id).toBe(sourceID)
  })

  test('should mark source as processed', async () => {
    const res = await gql.send(
      graphql(`
        mutation SourceResolverMarkSourceProcessed($id: ID!) {
          markSourceProcessed(id: $id) {
            success
          }
        }
      `),
      { id: sourceID },
    )
    expect(res.data?.markSourceProcessed?.success).toBe(true)
  })

  test('should delete a source', async () => {
    // Create a new source to delete
    const createRes = await gql.send(
      graphql(`
        mutation SourceResolverCreateSourceToDelete(
          $input: CreateSourceInput!
        ) {
          createSource(input: $input) {
            source {
              id
            }
          }
        }
      `),
      {
        input: {
          type: SourceType.File,
          location: 'https://example.com/to-delete.pdf',
        },
      },
    )
    const idToDelete = createRes.data?.createSource?.source?.id
    if (!idToDelete) {
      throw new Error('Failed to create source for deletion test')
    }

    const res = await gql.send(
      graphql(`
        mutation SourceResolverDeleteSource($id: ID!) {
          deleteSource(id: $id) {
            success
          }
        }
      `),
      { id: idToDelete },
    )
    expect(res.data?.deleteSource?.success).toBe(true)
  })

  test('should return null for non-existent source', async () => {
    const res = await gql.send(
      graphql(`
        query SourceResolverGetNonExistentSource($id: ID!) {
          source(id: $id) {
            id
          }
        }
      `),
      { id: 'non-existent-id' },
    )
    expect(res.data?.source).toBeNull()
  })

  // Comprehensive Create Tests
  describe('CreateSource comprehensive field tests', () => {
    test('should create source with all fields', async () => {
      const res = await gql.send(
        graphql(`
          mutation CreateSourceAllFields($input: CreateSourceInput!) {
            createSource(input: $input) {
              source {
                id
                type
                location
                contentURL
              }
            }
          }
        `),
        {
          input: {
            type: SourceType.Url,
            location: 'https://recycling-guide.com/page1',
            contentURL: 'https://cdn.example.com/content.json',
            content: { title: 'Recycling Guide', pages: 10 },
            metadata: { author: 'Test Author', date: '2024-01-01' },
          },
        },
      )
      expect(res.data?.createSource?.source).toBeTruthy()
      expect(res.data?.createSource?.source?.type).toBe(SourceType.Url)
      expect(res.data?.createSource?.source?.location).toBe('https://recycling-guide.com/page1')
    })

    test('should create source for each SourceType', async () => {
      const types = [SourceType.File, SourceType.Image, SourceType.Url, SourceType.Pdf]
      for (const type of types) {
        const res = await gql.send(
          graphql(`
            mutation CreateSourceWithType($input: CreateSourceInput!) {
              createSource(input: $input) {
                source {
                  id
                  type
                }
              }
            }
          `),
          {
            input: {
              type,
              location: `https://example.com/${type.toLowerCase()}/test`,
            },
          },
        )
        expect(res.data?.createSource?.source?.type).toBe(type)
      }
    })
  })

  // Comprehensive Update Tests
  describe('UpdateSource comprehensive field tests', () => {
    test('should update source fields', async () => {
      const res = await gql.send(
        graphql(`
          mutation UpdateSourceAllFields($input: UpdateSourceInput!) {
            updateSource(input: $input) {
              source {
                id
                location
                contentURL
              }
            }
          }
        `),
        {
          input: {
            id: sourceID,
            location: 'https://updated-location.com',
            contentURL: 'https://updated-content.com/data.json',
            content: { updated: true },
            metadata: { updatedBy: 'Test User' },
          },
        },
      )
      expect(res.data?.updateSource?.source?.location).toBe('https://updated-location.com')
    })
  })
})
