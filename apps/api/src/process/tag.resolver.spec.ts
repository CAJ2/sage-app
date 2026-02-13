import { MikroORM } from '@mikro-orm/postgresql'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { BaseSeeder } from '@src/db/seeds/BaseSeeder'
import { UserSeeder } from '@src/db/seeds/UserSeeder'
import { clearDatabase } from '@src/db/test.utils'
import { AppTestModule } from '@test/app-test.module'
import { graphql } from '@test/gql'
import { TagType } from '@test/gql/graphql'
import { GraphQLTestClient } from '@test/graphql.utils'

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
    expect(res.data?.tags).toBeTruthy()
    expect(Array.isArray(res.data?.tags.nodes)).toBe(true)
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
    expect(res.data?.createTagDefinition?.tag).toBeTruthy()
    expect(res.data?.createTagDefinition?.tag?.name).toBe('Test Tag')
    tagID = res.data?.createTagDefinition?.tag?.id!
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
    expect(res.data?.tag).toBeTruthy()
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
    expect(res.errors).toBeTruthy()
    expect(res.errors?.[0].message).toContain('Tag not found')
  })
})
