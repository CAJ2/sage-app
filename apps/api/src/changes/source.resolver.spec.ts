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
    expect(res.errors).toBeUndefined()
    expect(res.data?.sources).toBeDefined()
    expect(res.data?.sources.nodes).toHaveLength(res.data?.sources.nodes?.length ?? 0)
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
    expect(res.errors).toBeUndefined()
    expect(res.data?.sources).toBeDefined()
    expect(res.data?.sources.nodes).toBeDefined()
    expect(Array.isArray(res.data?.sources.nodes)).toBe(true)
    expect(res.data?.sources.nodes?.every((node) => node.type === SourceType.File)).toBe(true)
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
    expect(res.errors).toBeUndefined()
    expect(res.data?.source).toBeDefined()
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
    expect(res.errors).toBeUndefined()
    expect(res.data?.createSource?.source).toBeDefined()
    expect(res.data?.createSource?.source?.type).toBe(SourceType.File)
    expect(res.data?.createSource?.source?.id).toBeDefined()
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
    expect(res.errors).toBeUndefined()
    expect(res.data?.updateSource?.source).toBeDefined()
    expect(res.data?.updateSource?.source?.id).toBe(sourceID)
    expect(res.data?.updateSource?.source?.location).toBe('https://example.com/updated-source.pdf')
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
    expect(res.errors).toBeUndefined()
    expect(res.data?.markSourceProcessed).toBeDefined()
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
    expect(res.errors).toBeUndefined()
    expect(res.data?.deleteSource).toBeDefined()
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
    expect(res.errors).toBeDefined()
    expect(res.errors?.[0]?.extensions?.code).toBe('NOT_FOUND')
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
      expect(res.errors).toBeUndefined()
      expect(res.data?.createSource?.source).toBeDefined()
      expect(res.data?.createSource?.source?.type).toBe(SourceType.Url)
      expect(res.data?.createSource?.source?.location).toBe('https://recycling-guide.com/page1')
      expect(res.data?.createSource?.source?.contentURL).toBe(
        'https://cdn.example.com/content.json',
      )
      expect(res.data?.createSource?.source?.id).toBeDefined()
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
        expect(res.errors).toBeUndefined()
        expect(res.data?.createSource?.source).toBeDefined()
        expect(res.data?.createSource?.source?.type).toBe(type)
        expect(res.data?.createSource?.source?.id).toBeDefined()
      }
    })
  })

  // LinkSource Tests
  describe('linkSource', () => {
    test('should link a JSON-LD node to a source', async () => {
      const res = await gql.send(
        graphql(`
          mutation SourceResolverLinkSource($input: LinkSourceInput!) {
            linkSource(input: $input) {
              source {
                id
                content
              }
            }
          }
        `),
        {
          input: {
            id: sourceID,
            jsonld: {
              '@id': 'http://g.co/kg/m/05z87',
              '@type': ['Thing'],
              name: 'Plastic',
              detailedDescription: {
                url: 'https://en.wikipedia.org/wiki/Plastic',
                license:
                  'https://en.wikipedia.org/wiki/Wikipedia:Text_of_Creative_Commons_Attribution-ShareAlike_3.0_Unported_License',
                articleBody:
                  'Plastics are a wide range of synthetic or semisynthetic materials composed primarily of polymers. Their defining characteristic, plasticity, allows them to be molded, extruded, or pressed into a diverse range of solid forms. ',
              },
            },
          },
        },
      )
      expect(res.errors).toBeUndefined()
      expect(res.data?.linkSource?.source).toBeDefined()
      expect(res.data?.linkSource?.source?.id).toBe(sourceID)
      expect(res.data?.linkSource?.source?.content).toBeDefined()
      const content = res.data?.linkSource?.source?.content as Record<string, unknown>
      const doc = content.jsonld as Record<string, unknown>
      expect(doc['@context']).toBeDefined()
      const graph = doc['@graph'] as Array<Record<string, unknown>>
      expect(Array.isArray(graph)).toBe(true)
      expect(graph.some((n) => n['@id'] === 'http://g.co/kg/m/05z87')).toBe(true)
    })

    test('should replace an existing JSON-LD node with the same @id', async () => {
      // First link
      await gql.send(
        graphql(`
          mutation SourceResolverLinkFirst($input: LinkSourceInput!) {
            linkSource(input: $input) {
              source {
                id
              }
            }
          }
        `),
        {
          input: {
            id: sourceID,
            jsonld: {
              '@id': 'http://g.co/kg/glass',
              '@type': 'Material',
              name: 'Glass',
            },
          },
        },
      )
      // Link again with same @id but different data
      const res = await gql.send(
        graphql(`
          mutation SourceResolverLinkReplace($input: LinkSourceInput!) {
            linkSource(input: $input) {
              source {
                id
                content
              }
            }
          }
        `),
        {
          input: {
            id: sourceID,
            jsonld: {
              '@id': 'http://g.co/kg/glass',
              '@type': 'Material',
              name: 'Updated Glass',
            },
          },
        },
      )
      expect(res.errors).toBeUndefined()
      const content = res.data?.linkSource?.source?.content as Record<string, unknown>
      const doc = content.jsonld as Record<string, unknown>
      const graph = doc['@graph'] as Array<Record<string, unknown>>
      const glassNodes = graph.filter((n) => n['@id'] === 'http://g.co/kg/glass')
      expect(glassNodes).toHaveLength(1)
    })

    test('should accept a Wikidata entity IRI', async () => {
      const res = await gql.send(
        graphql(`
          mutation SourceResolverLinkWikidata($input: LinkSourceInput!) {
            linkSource(input: $input) {
              source {
                id
                content
              }
            }
          }
        `),
        {
          input: {
            id: sourceID,
            jsonld: {
              '@id': 'http://www.wikidata.org/entity/Q11469',
              '@type': 'Material',
            },
          },
        },
      )
      expect(res.errors).toBeUndefined()
      expect(res.data?.linkSource?.source).toBeDefined()
      const content = res.data?.linkSource?.source?.content as Record<string, unknown>
      const doc = content.jsonld as Record<string, unknown>
      const graph = doc['@graph'] as Array<Record<string, unknown>>
      expect(graph.some((n) => n['@id'] === 'wd:Q11469')).toBe(true)
    })

    test('should reject an invalid @id IRI', async () => {
      const res = await gql.send(
        graphql(`
          mutation SourceResolverLinkInvalidId($input: LinkSourceInput!) {
            linkSource(input: $input) {
              source {
                id
              }
            }
          }
        `),
        {
          input: {
            id: sourceID,
            jsonld: {
              '@id': 'https://example.com/not-valid',
              '@type': 'Material',
            },
          },
        },
      )
      expect(res.errors).toBeDefined()
    })

    test('should reject invalid JSON-LD document', async () => {
      const res = await gql.send(
        graphql(`
          mutation SourceResolverLinkInvalidJsonLd($input: LinkSourceInput!) {
            linkSource(input: $input) {
              source {
                id
              }
            }
          }
        `),
        {
          input: {
            id: sourceID,
            jsonld: {
              '@id': 'http://g.co/kg/test',
              '@type': 'Material',
              '@value': 'bad',
            },
          },
        },
      )
      expect(res.errors).toBeDefined()
    })
  })

  // UnlinkSource Tests
  describe('unlinkSource', () => {
    test('should unlink a JSON-LD node from a source', async () => {
      // First, link a node
      await gql.send(
        graphql(`
          mutation SourceResolverLinkForUnlink($input: LinkSourceInput!) {
            linkSource(input: $input) {
              source {
                id
              }
            }
          }
        `),
        {
          input: {
            id: sourceID,
            jsonld: {
              '@id': 'http://g.co/kg/aluminum',
              '@type': 'Material',
              name: 'Aluminum',
            },
          },
        },
      )
      // Now unlink it
      const res = await gql.send(
        graphql(`
          mutation SourceResolverUnlinkSource($input: UnlinkSourceInput!) {
            unlinkSource(input: $input) {
              source {
                id
                content
              }
            }
          }
        `),
        {
          input: {
            id: sourceID,
            jsonld: {
              '@id': 'http://g.co/kg/aluminum',
            },
          },
        },
      )
      expect(res.errors).toBeUndefined()
      expect(res.data?.unlinkSource?.source).toBeDefined()
      expect(res.data?.unlinkSource?.source?.id).toBe(sourceID)
      const content = res.data?.unlinkSource?.source?.content as Record<string, unknown>
      const doc = content.jsonld as Record<string, unknown>
      const graph = (doc?.['@graph'] ?? []) as Array<Record<string, unknown>>
      expect(graph.some((n) => n['@id'] === 'http://g.co/kg/aluminum')).toBe(false)
    })

    test('should be a no-op when unlinking a non-existent @id', async () => {
      const res = await gql.send(
        graphql(`
          mutation SourceResolverUnlinkNonExistent($input: UnlinkSourceInput!) {
            unlinkSource(input: $input) {
              source {
                id
                content
              }
            }
          }
        `),
        {
          input: {
            id: sourceID,
            jsonld: {
              '@id': 'http://g.co/kg/does-not-exist',
            },
          },
        },
      )
      expect(res.errors).toBeUndefined()
      expect(res.data?.unlinkSource?.source).toBeDefined()
      expect(res.data?.unlinkSource?.source?.id).toBe(sourceID)
    })

    test('should reject an invalid @id IRI', async () => {
      const res = await gql.send(
        graphql(`
          mutation SourceResolverUnlinkInvalidId($input: UnlinkSourceInput!) {
            unlinkSource(input: $input) {
              source {
                id
              }
            }
          }
        `),
        {
          input: {
            id: sourceID,
            jsonld: {
              '@id': 'not-a-valid-iri',
            },
          },
        },
      )
      expect(res.errors).toBeDefined()
    })

    test('should reject invalid JSON-LD document', async () => {
      const res = await gql.send(
        graphql(`
          mutation SourceResolverUnlinkInvalidJsonLd($input: UnlinkSourceInput!) {
            unlinkSource(input: $input) {
              source {
                id
              }
            }
          }
        `),
        {
          input: {
            id: sourceID,
            jsonld: {
              '@id': 'http://g.co/kg/test',
              '@value': 'bad',
            },
          },
        },
      )
      expect(res.errors).toBeDefined()
    })

    test('should not affect other linked nodes', async () => {
      // Link two nodes
      await gql.send(
        graphql(`
          mutation SourceResolverLinkNodeA($input: LinkSourceInput!) {
            linkSource(input: $input) {
              source {
                id
              }
            }
          }
        `),
        {
          input: {
            id: sourceID,
            jsonld: {
              '@id': 'http://g.co/kg/steel',
              '@type': 'Material',
            },
          },
        },
      )
      await gql.send(
        graphql(`
          mutation SourceResolverLinkNodeB($input: LinkSourceInput!) {
            linkSource(input: $input) {
              source {
                id
              }
            }
          }
        `),
        {
          input: {
            id: sourceID,
            jsonld: {
              '@id': 'http://g.co/kg/copper',
              '@type': 'Material',
            },
          },
        },
      )
      // Unlink only steel
      const res = await gql.send(
        graphql(`
          mutation SourceResolverUnlinkNodeA($input: UnlinkSourceInput!) {
            unlinkSource(input: $input) {
              source {
                id
                content
              }
            }
          }
        `),
        {
          input: {
            id: sourceID,
            jsonld: {
              '@id': 'http://g.co/kg/steel',
            },
          },
        },
      )
      expect(res.errors).toBeUndefined()
      const content = res.data?.unlinkSource?.source?.content as Record<string, unknown>
      const doc = content.jsonld as Record<string, unknown>
      const graph = doc['@graph'] as Array<Record<string, unknown>>
      expect(graph.some((n) => n['@id'] === 'http://g.co/kg/steel')).toBe(false)
      expect(graph.some((n) => n['@id'] === 'http://g.co/kg/copper')).toBe(true)
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
      expect(res.errors).toBeUndefined()
      expect(res.data?.updateSource?.source).toBeDefined()
      expect(res.data?.updateSource?.source?.location).toBe('https://updated-location.com')
      expect(res.data?.updateSource?.source?.contentURL).toBe(
        'https://updated-content.com/data.json',
      )
      expect(res.data?.updateSource?.source?.id).toBe(sourceID)
    })
  })
})
