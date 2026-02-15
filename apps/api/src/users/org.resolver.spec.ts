import { MikroORM } from '@mikro-orm/postgresql'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { BaseSeeder } from '@src/db/seeds/BaseSeeder'
import { OrgSeeder } from '@src/db/seeds/OrgSeeder'
import { UserSeeder } from '@src/db/seeds/UserSeeder'
import { clearDatabase } from '@src/db/test.utils'
import { AppTestModule } from '@test/app-test.module'
import { graphql } from '@test/gql'
import { GraphQLTestClient } from '@test/graphql.utils'

import { Org } from './org.entity'

describe('OrgResolver (integration)', () => {
  let app: INestApplication
  let gql: GraphQLTestClient
  let orgID: string

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppTestModule],
    }).compile()

    app = module.createNestApplication()
    await app.init()

    gql = new GraphQLTestClient(app)

    const orm = module.get<MikroORM>(MikroORM)

    await clearDatabase(orm, 'public', ['users', 'orgs'])
    await orm.seeder.seed(BaseSeeder, UserSeeder, OrgSeeder)

    await gql.signIn('admin', 'password')

    const org = await orm.em.findOne(Org, { slug: 'sage' })
    if (!org) {
      throw new Error('Seeded org not found')
    }
    orgID = org.id
  })

  afterAll(async () => {
    await app.close()
  })

  test('should query a single org', async () => {
    const res = await gql.send(
      graphql(`
        query OrgResolverGetOrg($id: ID!) {
          org(id: $id) {
            id
            name
            slug
          }
        }
      `),
      { id: orgID },
    )
    expect(res.data?.org).toBeTruthy()
    expect(res.data?.org?.id).toBe(orgID)
  })

  test('should query org users with pagination', async () => {
    const res = await gql.send(
      graphql(`
        query OrgResolverGetOrgUsers($id: ID!, $first: Int) {
          org(id: $id) {
            id
            users(first: $first) {
              nodes {
                id
                username
              }
              totalCount
              pageInfo {
                hasNextPage
                hasPreviousPage
              }
            }
          }
        }
      `),
      { id: orgID, first: 10 },
    )
    expect(res.data?.org?.users).toBeTruthy()
    expect(Array.isArray(res.data?.org?.users.nodes)).toBe(true)
  })

  test('should create an org', async () => {
    const res = await gql.send(
      graphql(`
        mutation OrgResolverCreateOrg($input: CreateOrgInput!) {
          createOrg(input: $input) {
            org {
              id
              name
              slug
            }
          }
        }
      `),
      {
        input: {
          name: 'Test Organization',
          slug: 'test-org',
        },
      },
    )
    expect(res.data?.createOrg?.org).toBeTruthy()
    expect(res.data?.createOrg?.org?.name).toBe('Test Organization')
    expect(res.data?.createOrg?.org?.slug).toBe('test-org')
  })

  test('should update an org', async () => {
    const res = await gql.send(
      graphql(`
        mutation OrgResolverUpdateOrg($input: UpdateOrgInput!) {
          updateOrg(input: $input) {
            org {
              id
              name
            }
          }
        }
      `),
      {
        input: {
          id: orgID,
          name: 'Updated Org Name',
        },
      },
    )
    expect(res.data?.updateOrg?.org?.id).toBe(orgID)
    expect(res.data?.updateOrg?.org?.name).toBe('Updated Org Name')
  })

  test('should return error for non-existent org', async () => {
    const res = await gql.send(
      graphql(`
        query OrgResolverGetNonExistentOrg($id: ID!) {
          org(id: $id) {
            id
          }
        }
      `),
      { id: 'non-existent-id' },
    )
    expect(res.errors).toBeTruthy()
    expect(res.errors?.[0].message).toContain('Org not found')
  })
})
