import { MikroORM } from '@mikro-orm/postgresql'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AppTestModule } from '@test/app-test.module'
import { graphql } from '@test/gql'
import { TagType } from '@test/gql/graphql'
import { GraphQLTestClient } from '@test/graphql.utils'

import { BaseSeeder } from '@src/db/seeds/BaseSeeder'
import { UserSeeder } from '@src/db/seeds/UserSeeder'
import { clearDatabase } from '@src/db/test.utils'

describe('TagResolver (integration)', () => {
  let app: INestApplication
  let gql: GraphQLTestClient
  let tagID: string

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

  test('should query tags with pagination', async () => {
    const res = await gql.send(
      graphql(`
        query TagResolverListTags($first: Int) {
          tags(first: $first) {
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
    expect(res.errors).toBeUndefined()
    expect(res.data?.tags).toBeDefined()
    expect(Array.isArray(res.data?.tags.nodes)).toBe(true)
    expect(res.data?.tags.totalCount).toBeGreaterThanOrEqual(0)
  })

  test('should create a tag definition', async () => {
    const res = await gql.send(
      graphql(`
        mutation TagResolverCreateTagDefinition(
          $input: CreateTagDefinitionInput!
        ) {
          createTagDefinition(input: $input) {
            tag {
              id
              name
            }
          }
        }
      `),
      {
        input: {
          name: 'Test Tag',
          type: TagType.Component,
        },
      },
    )
    expect(res.errors).toBeUndefined()
    expect(res.data?.createTagDefinition?.tag).toBeDefined()
    expect(res.data?.createTagDefinition?.tag?.name).toBe('Test Tag')
    if (res.data?.createTagDefinition?.tag?.id) {
      tagID = res.data?.createTagDefinition?.tag?.id
    }
  })

  test('should query a single tag', async () => {
    const res = await gql.send(
      graphql(`
        query TagResolverGetTag($id: ID!) {
          tag(id: $id) {
            id
            name
          }
        }
      `),
      { id: tagID },
    )
    expect(res.errors).toBeUndefined()
    expect(res.data?.tag).toBeDefined()
    expect(res.data?.tag?.id).toBe(tagID)
  })

  test('should update a tag definition', async () => {
    const res = await gql.send(
      graphql(`
        mutation TagResolverUpdateTagDefinition(
          $input: UpdateTagDefinitionInput!
        ) {
          updateTagDefinition(input: $input) {
            tag {
              id
              name
            }
          }
        }
      `),
      {
        input: {
          id: tagID,
          name: 'updated-tag',
        },
      },
    )
    expect(res.errors).toBeUndefined()
    expect(res.data?.updateTagDefinition?.tag?.id).toBe(tagID)
    expect(res.data?.updateTagDefinition?.tag?.name).toBe('updated-tag')
  })

  test('should return error for non-existent tag', async () => {
    const res = await gql.send(
      graphql(`
        query TagResolverGetNonExistentTag($id: ID!) {
          tag(id: $id) {
            id
          }
        }
      `),
      { id: 'non-existent-id' },
    )
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors?.[0].message).toContain('Tag not found')
  })

  // Comprehensive Create Tests
  describe('CreateTagDefinition comprehensive field tests', () => {
    test('should create tag with all fields', async () => {
      const res = await gql.send(
        graphql(`
          mutation CreateTagAllFields($input: CreateTagDefinitionInput!) {
            createTagDefinition(input: $input) {
              tag {
                id
                name
                desc
                type
                bgColor
                image
              }
            }
          }
        `),
        {
          input: {
            name: 'Comprehensive Tag',
            desc: 'Detailed tag description',
            type: TagType.Component,
            bgColor: '#FF5733',
            image: 'https://example.com/tag.png',
            metaTemplate: {
              schema: {
                type: 'object',
                properties: {
                  score: { type: 'number' },
                  level: { type: 'string' },
                },
              },
            },
          },
        },
      )
      expect(res.errors).toBeUndefined()
      expect(res.data?.createTagDefinition?.tag).toBeDefined()
      expect(res.data?.createTagDefinition?.tag?.name).toBe('Comprehensive Tag')
      expect(res.data?.createTagDefinition?.tag?.desc).toBe('Detailed tag description')
      expect(res.data?.createTagDefinition?.tag?.bgColor).toBe('#FF5733')
      expect(res.data?.createTagDefinition?.tag?.type).toBe(TagType.Component)
      expect(res.data?.createTagDefinition?.tag?.image).toBe('https://example.com/tag.png')
    })

    test('should create tag for each TagType', async () => {
      const types = [TagType.Place, TagType.Variant, TagType.Component]
      for (const type of types) {
        const res = await gql.send(
          graphql(`
            mutation CreateTagWithType($input: CreateTagDefinitionInput!) {
              createTagDefinition(input: $input) {
                tag {
                  id
                  type
                }
              }
            }
          `),
          {
            input: {
              name: `Tag for ${type}`,
              type,
            },
          },
        )
        expect(res.errors).toBeUndefined()
        expect(res.data?.createTagDefinition?.tag).toBeDefined()
        expect(res.data?.createTagDefinition?.tag?.type).toBe(type)
      }
    })
  })

  // Comprehensive Update Tests
  describe('UpdateTagDefinition comprehensive field tests', () => {
    test('should update tag fields', async () => {
      const res = await gql.send(
        graphql(`
          mutation UpdateTagAllFields($input: UpdateTagDefinitionInput!) {
            updateTagDefinition(input: $input) {
              tag {
                id
                name
                desc
                bgColor
              }
            }
          }
        `),
        {
          input: {
            id: tagID,
            name: 'Updated Tag Name',
            desc: 'Updated description',
            bgColor: '#00FF00',
          },
        },
      )
      expect(res.errors).toBeUndefined()
      expect(res.data?.updateTagDefinition?.tag).toBeDefined()
      expect(res.data?.updateTagDefinition?.tag?.name).toBe('Updated Tag Name')
      expect(res.data?.updateTagDefinition?.tag?.desc).toBe('Updated description')
      expect(res.data?.updateTagDefinition?.tag?.bgColor).toBe('#00FF00')
      expect(res.data?.updateTagDefinition?.tag?.id).toBe(tagID)
    })
  })
})
