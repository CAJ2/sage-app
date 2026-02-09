import { MikroORM } from '@mikro-orm/postgresql'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { BaseSeeder } from '@src/db/seeds/BaseSeeder'
import { UserSeeder } from '@src/db/seeds/UserSeeder'
import { clearDatabase } from '@src/db/test.utils'
import { User } from '@src/users/users.entity'
import { AppTestModule } from '@test/app-test.module'
import { graphql } from '@test/gql'
import { GraphQLTestClient } from '@test/graphql.utils'
import { ChangeService } from './change.service'
import { EditService } from './edit.service'

describe('ChangeResolver (integration)', () => {
  let app: INestApplication
  let gql: GraphQLTestClient
  let changeService: ChangeService
  let editService: EditService
  let changeID: string
  let editID: string

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppTestModule],
    }).compile()

    app = module.createNestApplication()
    await app.init()

    gql = new GraphQLTestClient(app)

    changeService = module.get(ChangeService)
    editService = module.get(EditService)
    const orm = module.get<MikroORM>(MikroORM)

    await clearDatabase(orm, 'auth')
    await clearDatabase(orm, 'public')
    await orm.getSeeder().seed(BaseSeeder, UserSeeder)

    const user = await orm.em.findOne(User, {
      username: 'admin',
    })
    if (!user) {
      throw new Error('Admin user not found')
    }

    await gql.signIn('admin', 'password')

    // Insert a change using the service
    const change = await changeService.create(
      {
        title: 'Test Change',
        description: 'Integration test',
      },
      user.id,
    )
    changeID = change.id
    // Insert an edit for the change
    const edit = await editService.create(
      {
        title: 'Test Edit',
        description: 'Integration test edit',
      },
      user.id,
    )
    editID = edit.id
  })

  afterAll(async () => {
    await app.close()
  })

  test('should query changes', async () => {
    const res = await gql.send(
      graphql(`
        query ListChanges($after: String, $first: Int) {
          changes(after: $after, first: $first) {
            nodes {
              id
              title
              description
            }
            totalCount
          }
        }
      `),
      { after: null, first: 10 },
    )
    expect(res.data?.changes.nodes?.length).toBeGreaterThan(0)
    expect(res.data?.changes.nodes?.at(0)).toHaveProperty('id')
  })

  test('should query a single change', async () => {
    const res = await gql.send(
      graphql(`
        query GetChange($id: ID!) {
          change(id: $id) {
            id
            title
            description
          }
        }
      `),
      { id: changeID },
    )
    expect(res.data?.change).toBeTruthy()
    expect(res.data?.change?.id).toBe(changeID)
  })

  test('should query directEdit (Item)', async () => {
    const res = await gql.send(
      graphql(`
        query GetDirectEdit($id: ID!, $entityName: String!) {
          directEdit(id: $id, entityName: $entityName) {
            id
            entityName
          }
        }
      `),
      { id: changeID, entityName: 'Item' },
    )
    expect(res.data?.directEdit).toBeTruthy()
    expect(res.data?.directEdit?.entityName).toBe('Item')
  })

  test('should create a change', async () => {
    const res = await gql.send(
      graphql(`
        mutation CreateChange($input: CreateChangeInput!) {
          createChange(input: $input) {
            change {
              id
              title
            }
          }
        }
      `),
      {
        input: {
          title: 'New Change',
          description: 'Created by test',
        },
      },
    )
    expect(res.data?.createChange?.change).toHaveProperty('id')
    expect(res.data?.createChange?.change?.title).toBe('New Change')
  })

  test('should update a change', async () => {
    const res = await gql.send(
      graphql(`
        mutation UpdateChange($input: UpdateChangeInput!) {
          updateChange(input: $input) {
            change {
              id
              title
            }
          }
        }
      `),
      {
        input: {
          id: changeID,
          title: 'Updated Title',
        },
      },
    )
    expect(res.data?.updateChange?.change?.id).toBe(changeID)
    expect(res.data?.updateChange?.change?.title).toBe('Updated Title')
  })

  test('should discard an edit', async () => {
    const res = await gql.send(
      graphql(`
        mutation DiscardEdit($changeID: ID!, $editID: ID!) {
          discardEdit(changeID: $changeID, editID: $editID) {
            success
            id
          }
        }
      `),
      {
        changeID,
        editID,
      },
    )
    expect(res.data?.discardEdit?.success).toBe(true)
    expect(res.data?.discardEdit?.id).toBe(editID)
  })

  test('should delete a change', async () => {
    const res = await gql.send(
      graphql(`
        mutation DeleteChange($id: ID!) {
          deleteChange(id: $id) {
            success
          }
        }
      `),
      {
        id: changeID,
      },
    )
    expect(res.data?.deleteChange?.success).toBe(true)
  })
})
