import { MikroORM } from '@mikro-orm/postgresql'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AppTestModule } from '@test/app-test.module'
import { graphql } from '@test/gql'
import { GraphQLTestClient } from '@test/graphql.utils'

import { BaseSeeder } from '@src/db/seeds/BaseSeeder'
import { UserSeeder } from '@src/db/seeds/UserSeeder'
import { clearDatabase } from '@src/db/test.utils'

describe('UsersResolver (integration)', () => {
  let app: INestApplication
  let gql: GraphQLTestClient
  let userID: string

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

    // Get the admin user ID for testing
    const adminUser = await orm.em.findOne('User', { username: 'admin' })
    userID = (adminUser as any)?.id
  })

  afterAll(async () => {
    await app.close()
  })

  test('should query a single user', async () => {
    const res = await gql.send(
      graphql(`
        query UsersResolverGetUser($id: ID!) {
          user(id: $id) {
            id
            username
            email
            name
          }
        }
      `),
      { id: userID },
    )
    expect(res.data?.user).toBeTruthy()
    expect(res.data?.user?.id).toBe(userID)
    expect(res.data?.user?.username).toBe('admin')
  })

  test('should query user orgs with pagination', async () => {
    const res = await gql.send(
      graphql(`
        query UsersResolverGetUserOrgs($id: ID!, $first: Int) {
          user(id: $id) {
            id
            orgs(first: $first) {
              nodes {
                org {
                  id
                  name
                }
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
      { id: userID, first: 10 },
    )
    expect(res.data?.user?.orgs).toBeTruthy()
    expect(Array.isArray(res.data?.user?.orgs.nodes)).toBe(true)
  })

  test('should return null for non-existent user', async () => {
    const res = await gql.send(
      graphql(`
        query UsersResolverGetNonExistentUser($id: ID!) {
          user(id: $id) {
            id
          }
        }
      `),
      { id: 'non-existent-id' },
    )
    expect(res.errors).toBeTruthy()
    expect(res.errors?.[0].message).toContain('User not found')
  })
})
