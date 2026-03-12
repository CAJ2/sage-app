import { MikroORM } from '@mikro-orm/postgresql'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AppTestModule } from '@test/app-test.module'
import { graphql } from '@test/gql'
import { ChangeStatus } from '@test/gql/types.generated'
import { GraphQLTestClient } from '@test/graphql.utils'

import { BaseSeeder } from '@src/db/seeds/BaseSeeder'
import { MATERIAL_IDS, TestMaterialSeeder } from '@src/db/seeds/TestMaterialSeeder'
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
    expect(typeof res.data?.processes.totalCount).toBe('number')
    expect(res.data?.processes.pageInfo.hasNextPage).toBe(false)
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
    expect(res.data?.process?.name).toBe('Test Process')
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

  test('should return currentProcess with DB state when using change tracking', async () => {
    // First set a known name directly in the DB
    const directRes = await gql.send(
      graphql(`
        mutation ProcessSetCurrentName($input: UpdateProcessInput!) {
          updateProcess(input: $input) {
            process {
              id
              name
            }
          }
        }
      `),
      { input: { id: processID, name: 'Current DB Name' } },
    )
    expect(directRes.errors).toBeUndefined()

    // Now update via change — process should show proposed, currentProcess the DB value
    const changeRes = await gql.send(
      graphql(`
        mutation UpdateProcessWithChangeCurrentProcess($input: UpdateProcessInput!) {
          updateProcess(input: $input) {
            process {
              id
              name
            }
            currentProcess {
              id
              name
            }
            change {
              id
            }
          }
        }
      `),
      {
        input: {
          id: processID,
          name: 'Proposed Name',
          change: { title: 'current process test' },
        },
      },
    )
    expect(changeRes.errors).toBeUndefined()
    expect(changeRes.data?.updateProcess?.process?.name).toBe('Proposed Name')
    expect(changeRes.data?.updateProcess?.currentProcess?.name).toBe('Current DB Name')
    expect(changeRes.data?.updateProcess?.currentProcess?.id).toBe(processID)
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
    expect(res.errors?.[0].extensions?.code).toBe('NOT_FOUND')
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
                  nodes {
                    datetime
                    user {
                      id
                    }
                    original {
                      id
                    }
                    changes {
                      id
                    }
                  }
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
      expect(process!.history.nodes).toHaveLength(1)
      expect(process!.history.nodes![0].user).toBeDefined()
      expect(process!.history.nodes![0].original).toBeNull()
      expect(process!.history.nodes![0].changes).toBeTruthy()
    })

    test('should record history on direct update', async () => {
      const updateRes = await gql.send(
        graphql(`
          mutation ProcessHistoryUpdate($input: UpdateProcessInput!) {
            updateProcess(input: $input) {
              process {
                id
                history {
                  nodes {
                    datetime
                    user {
                      id
                    }
                    original {
                      id
                      name
                    }
                    changes {
                      id
                      name
                    }
                  }
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
      expect(process!.history.nodes).toHaveLength(2)
      const latest = process!.history.nodes!.at(-1)!
      expect(latest.original).toBeTruthy()
      expect(latest.changes).toBeTruthy()
      expect(latest.original?.name).toBe('History Test Process')
      expect(latest.changes?.name).toBe('Updated History Process')
    })
  })

  describe('multi-entity change flow (process + org + material)', () => {
    let changeID: string
    let flowProcessID: string
    let flowOrgID: string

    test('step 1: create a process with a new change', async () => {
      const res = await gql.send(
        graphql(`
          mutation FlowCreateProcess($input: CreateProcessInput!) {
            createProcess(input: $input) {
              process {
                id
              }
              change {
                id
                status
                edits {
                  nodes {
                    entityName
                    id
                    createInput
                    changes {
                      ... on Process {
                        __typename
                        id
                        name
                        material {
                          id
                        }
                        org {
                          id
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `),
        {
          input: {
            name: 'Flow Process',
            intent: 'RECYCLE',
            change: { title: 'Multi-entity flow change', status: ChangeStatus.Draft },
          },
        },
      )
      expect(res.errors).toBeUndefined()
      flowProcessID = res.data!.createProcess!.process!.id
      changeID = res.data!.createProcess!.change!.id
      expect(res.data!.createProcess!.change!.status).toBe('DRAFT')

      const edits = res.data!.createProcess!.change!.edits.nodes
      expect(edits).toHaveLength(1)
      expect(edits[0].entityName).toBe('Process')
      expect(edits[0].id).toBe(flowProcessID)
      expect(edits[0].createInput).toBeTruthy()
      const changes = edits[0].changes
      expect(changes?.__typename).toBe('Process')
      if (changes?.__typename === 'Process') {
        expect(changes.name).toBe('Flow Process')
        expect(changes.material).toBeNull()
        expect(changes.org).toBeNull()
      }
    })

    test('step 2: update the process adding a material reference on the same change', async () => {
      const res = await gql.send(
        graphql(`
          mutation FlowUpdateProcessMaterial($input: UpdateProcessInput!) {
            updateProcess(input: $input) {
              process {
                id
              }
              change {
                id
                edits {
                  nodes {
                    entityName
                    id
                    updateInput
                    changes {
                      ... on Process {
                        __typename
                        id
                        name
                        material {
                          id
                        }
                        org {
                          id
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `),
        {
          input: {
            id: flowProcessID,
            material: { id: MATERIAL_IDS[0] },
            changeID,
          },
        },
      )
      expect(res.errors).toBeUndefined()
      expect(res.data!.updateProcess!.change!.id).toBe(changeID)

      const edits = res.data!.updateProcess!.change!.edits.nodes
      const processEdit = edits.find((e) => e.entityName === 'Process' && e.id === flowProcessID)
      expect(processEdit).toBeDefined()
      expect(processEdit!.updateInput).toBeTruthy()
      const changes = processEdit!.changes
      expect(changes?.__typename).toBe('Process')
      if (changes?.__typename === 'Process') {
        expect(changes.material?.id).toBe(MATERIAL_IDS[0])
        expect(changes.org).toBeNull()
      }
    })

    test('step 3: create an org on the same change', async () => {
      const res = await gql.send(
        graphql(`
          mutation FlowCreateOrg($input: CreateOrgInput!) {
            createOrg(input: $input) {
              org {
                id
                name
                slug
              }
              change {
                id
              }
            }
          }
        `),
        {
          input: {
            name: 'Flow Org',
            slug: 'flow-org',
            changeID,
          },
        },
      )
      expect(res.errors).toBeUndefined()
      flowOrgID = res.data!.createOrg!.org!.id
      expect(res.data!.createOrg!.org!.name).toBe('Flow Org')
      expect(res.data!.createOrg!.change!.id).toBe(changeID)
    })

    test('step 4: update the process adding the new org on the same change', async () => {
      const res = await gql.send(
        graphql(`
          mutation FlowUpdateProcessOrg($input: UpdateProcessInput!) {
            updateProcess(input: $input) {
              process {
                id
              }
              change {
                id
              }
            }
          }
        `),
        {
          input: {
            id: flowProcessID,
            org: { id: flowOrgID },
            changeID,
          },
        },
      )
      expect(res.errors).toBeUndefined()
      expect(res.data!.updateProcess!.change!.id).toBe(changeID)
    })

    test('step 5: approve and merge the change', async () => {
      const approveRes = await gql.send(
        graphql(`
          mutation FlowApproveChange($input: UpdateChangeInput!) {
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
          mutation FlowMergeChange($id: ID!) {
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
      expect(mergeRes.data?.mergeChange?.change).toBeDefined()
    })

    test('after merge: process is linked to material and org', async () => {
      const res = await gql.send(
        graphql(`
          query FlowGetProcess($id: ID!) {
            process(id: $id) {
              id
              name
              material {
                id
              }
              org {
                id
              }
            }
          }
        `),
        { id: flowProcessID },
      )
      expect(res.errors).toBeUndefined()
      expect(res.data?.process?.name).toBe('Flow Process')
      expect(res.data?.process?.material?.id).toBe(MATERIAL_IDS[0])
      expect(res.data?.process?.org?.id).toBe(flowOrgID)
    })

    test('after merge: org exists and is queryable', async () => {
      const res = await gql.send(
        graphql(`
          query FlowGetOrg($id: ID!) {
            org(id: $id) {
              id
              name
              slug
            }
          }
        `),
        { id: flowOrgID },
      )
      expect(res.errors).toBeUndefined()
      expect(res.data?.org?.id).toBe(flowOrgID)
      expect(res.data?.org?.name).toBe('Flow Org')
      expect(res.data?.org?.slug).toBe('flow-org')
    })
  })
})
