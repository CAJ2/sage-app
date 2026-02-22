import { MikroORM } from '@mikro-orm/postgresql'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AppTestModule } from '@test/app-test.module'
import { graphql } from '@test/gql'
import { GraphQLTestClient } from '@test/graphql.utils'

import { BaseSeeder } from '@src/db/seeds/BaseSeeder'
import { TestMaterialSeeder } from '@src/db/seeds/TestMaterialSeeder'
import { UserSeeder } from '@src/db/seeds/UserSeeder'
import { clearDatabase } from '@src/db/test.utils'

describe('ProcessResolver (integration)', () => {
  let app: INestApplication
  let gql: GraphQLTestClient
  let processID: string

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppTestModule],
    }).compile()

    app = module.createNestApplication()
    await app.init()

    gql = new GraphQLTestClient(app)

    const orm = module.get<MikroORM>(MikroORM)

    await clearDatabase(orm, 'public', ['users'])
    await orm.seeder.seed(BaseSeeder, UserSeeder, TestMaterialSeeder)

    await gql.signIn('admin', 'password')
  })

  afterAll(async () => {
    await app.close()
  })

  test('should query processes with pagination', async () => {
    const res = await gql.send(
      graphql(`
        query ProcessResolverListProcesses($first: Int) {
          processes(first: $first) {
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
    expect(res.data?.processes).toBeTruthy()
    expect(Array.isArray(res.data?.processes.nodes)).toBe(true)
  })

  test('should query process schema', async () => {
    const res = await gql.send(
      graphql(`
        query ProcessResolverGetProcessSchema {
          processSchema {
            create {
              schema
              uischema
            }
            update {
              schema
              uischema
            }
          }
        }
      `),
    )
    expect(res.data?.processSchema).toBeTruthy()
    expect(res.data?.processSchema?.create).toBeTruthy()
    expect(res.data?.processSchema?.update).toBeTruthy()
  })

  test('should create a process', async () => {
    const res = await gql.send(
      graphql(`
        mutation ProcessResolverCreateProcess($input: CreateProcessInput!) {
          createProcess(input: $input) {
            process {
              id
              name
            }
          }
        }
      `),
      {
        input: {
          name: 'Test Process',
          intent: 'RECYCLE',
        },
      },
    )
    expect(res.data?.createProcess?.process).toBeTruthy()
    expect(res.data?.createProcess?.process?.name).toBe('Test Process')
    if (res.data?.createProcess?.process?.id) {
      processID = res.data?.createProcess?.process?.id
    }
  })

  test('should query a single process', async () => {
    const res = await gql.send(
      graphql(`
        query ProcessResolverGetProcess($id: ID!) {
          process(id: $id) {
            id
            name
          }
        }
      `),
      { id: processID },
    )
    expect(res.data?.process).toBeTruthy()
    expect(res.data?.process?.id).toBe(processID)
  })

  test('should update a process', async () => {
    const res = await gql.send(
      graphql(`
        mutation ProcessResolverUpdateProcess($input: UpdateProcessInput!) {
          updateProcess(input: $input) {
            process {
              id
              name
            }
          }
        }
      `),
      {
        input: {
          id: processID,
          name: 'Updated Process Name',
        },
      },
    )
    expect(res.data?.updateProcess?.process?.id).toBe(processID)
    expect(res.data?.updateProcess?.process?.name).toBe('Updated Process Name')
  })

  test('should return error for non-existent process', async () => {
    const res = await gql.send(
      graphql(`
        query ProcessResolverGetNonExistentProcess($id: ID!) {
          process(id: $id) {
            id
          }
        }
      `),
      { id: 'non-existent-id' },
    )
    expect(res.errors).toBeTruthy()
    expect(res.errors?.[0].message).toContain('Process not found')
  })

  describe('history tracking', () => {
    let historyProcessID: string

    test('should record history on direct create', async () => {
      const createRes = await gql.send(
        graphql(`
          mutation ProcessHistoryCreate($input: CreateProcessInput!) {
            createProcess(input: $input) {
              process {
                id
                history {
                  datetime
                  user {
                    id
                  }
                  original
                  changes
                }
              }
            }
          }
        `),
        { input: { name: 'History Test Process', intent: 'RECYCLE' } },
      )
      expect(createRes.errors).toBeUndefined()
      const process = createRes.data?.createProcess?.process
      expect(process).toBeDefined()
      historyProcessID = process!.id
      expect(process!.history).toHaveLength(1)
      expect(process!.history[0].user).toBeDefined()
      expect(process!.history[0].original).toBeNull()
      expect(process!.history[0].changes).toBeTruthy()
    })

    test('should record history on direct update', async () => {
      const updateRes = await gql.send(
        graphql(`
          mutation ProcessHistoryUpdate($input: UpdateProcessInput!) {
            updateProcess(input: $input) {
              process {
                id
                history {
                  datetime
                  user {
                    id
                  }
                  original
                  changes
                }
              }
            }
          }
        `),
        { input: { id: historyProcessID, name: 'Updated History Process' } },
      )
      expect(updateRes.errors).toBeUndefined()
      const process = updateRes.data?.updateProcess?.process
      expect(process).toBeDefined()
      expect(process!.history).toHaveLength(2)
      const latest = process!.history.at(-1)!
      expect(latest.original).toBeTruthy()
      expect(latest.changes).toBeTruthy()
    })
  })
})
