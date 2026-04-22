import { MikroORM } from '@mikro-orm/postgresql'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AppTestModule } from '@test/app-test.module'
import { graphql } from '@test/gql'
import { ChangeStatus } from '@test/gql/types.generated'
import { GraphQLTestClient } from '@test/graphql.utils'

import { BaseSeeder } from '@src/db/seeds/BaseSeeder'
import { MATERIAL_IDS, TestMaterialSeeder } from '@src/db/seeds/TestMaterialSeeder'
import { TEST_REGION_ID, TestRegionSeeder } from '@src/db/seeds/TestRegionSeeder'
import { UserSeeder } from '@src/db/seeds/UserSeeder'
import { clearDatabase } from '@src/db/test.utils'
import { Place } from '@src/geo/place.entity'
import { Region } from '@src/geo/region.entity'

describe('ProcessResolver (integration)', () => {
  let app: INestApplication
  let gql: GraphQLTestClient
  let orm: MikroORM
  let processID: string

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppTestModule],
    }).compile()

    app = module.createNestApplication()
    await app.init()

    gql = new GraphQLTestClient(app)

    orm = module.get<MikroORM>(MikroORM)

    await clearDatabase(orm, 'public', ['users'])
    await orm.seeder.seed(BaseSeeder, UserSeeder, TestMaterialSeeder, TestRegionSeeder)

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

  test('should filter processes by material', async () => {
    const materialId = MATERIAL_IDS[0]
    // First create a process with this material
    await gql.send(
      graphql(`
        mutation CreateProcessWithMaterial($input: CreateProcessInput!) {
          createProcess(input: $input) {
            process {
              id
            }
          }
        }
      `),
      {
        input: {
          name: 'Material Filter Process',
          intent: 'RECYCLE',
          material: { id: materialId },
        },
      },
    )

    const res = await gql.send(
      graphql(`
        query FilterProcessesByMaterial($material: ID) {
          processes(material: $material) {
            nodes {
              id
              name
              material {
                id
              }
            }
            totalCount
          }
        }
      `),
      { material: materialId },
    )

    expect(res.errors).toBeUndefined()
    const processNodes = res.data?.processes.nodes ?? []
    expect(processNodes.length).toBeGreaterThan(0)
    for (const node of processNodes) {
      expect(node.material?.id).toBe(materialId)
    }
  })

  test('should filter processes by region', async () => {
    const regionId = TEST_REGION_ID
    // First create a process with this region
    await gql.send(
      graphql(`
        mutation CreateProcessWithRegion($input: CreateProcessInput!) {
          createProcess(input: $input) {
            process {
              id
            }
          }
        }
      `),
      {
        input: {
          name: 'Region Filter Process',
          intent: 'RECYCLE',
          region: { id: regionId },
        },
      },
    )

    const res = await gql.send(
      graphql(`
        query FilterProcessesByRegion($region: ID) {
          processes(region: $region) {
            nodes {
              id
              name
              region {
                id
              }
            }
            totalCount
          }
        }
      `),
      { region: regionId },
    )

    expect(res.errors).toBeUndefined()
    const processNodes = res.data?.processes.nodes ?? []
    expect(processNodes.length).toBeGreaterThan(0)
    for (const node of processNodes) {
      expect(node.region?.id).toBe(regionId)
    }
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

  test('should keep currentProcess relation refs isolated while staging new refs in a change', async () => {
    const extraRegionID = 'wof_process_current_alt'
    const em = orm.em.fork()
    em.create(Region, {
      id: extraRegionID,
      name: { en: 'Alt Region' },
      placetype: 'country',
      properties: { hierarchy: [] },
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    await em.flush()

    const baselineOrgRes = await gql.send(
      graphql(`
        mutation ProcessCurrentBaselineOrg($input: CreateOrgInput!) {
          createOrg(input: $input) {
            org {
              id
            }
          }
        }
      `),
      { input: { name: 'Baseline Process Org', slug: 'baseline-process-org' } },
    )
    const proposedOrgRes = await gql.send(
      graphql(`
        mutation ProcessCurrentProposedOrg($input: CreateOrgInput!) {
          createOrg(input: $input) {
            org {
              id
            }
          }
        }
      `),
      { input: { name: 'Proposed Process Org', slug: 'proposed-process-org' } },
    )
    const baselineVariantRes = await gql.send(
      graphql(`
        mutation ProcessCurrentBaselineVariant($input: CreateVariantInput!) {
          createVariant(input: $input) {
            variant {
              id
            }
          }
        }
      `),
      { input: { name: 'Baseline Process Variant' } },
    )
    const proposedVariantRes = await gql.send(
      graphql(`
        mutation ProcessCurrentProposedVariant($input: CreateVariantInput!) {
          createVariant(input: $input) {
            variant {
              id
            }
          }
        }
      `),
      { input: { name: 'Proposed Process Variant' } },
    )

    expect(baselineOrgRes.errors).toBeUndefined()
    expect(proposedOrgRes.errors).toBeUndefined()
    expect(baselineVariantRes.errors).toBeUndefined()
    expect(proposedVariantRes.errors).toBeUndefined()

    const baselineOrgID = baselineOrgRes.data!.createOrg!.org!.id
    const proposedOrgID = proposedOrgRes.data!.createOrg!.org!.id
    const baselineVariantID = baselineVariantRes.data!.createVariant!.variant!.id
    const proposedVariantID = proposedVariantRes.data!.createVariant!.variant!.id

    const baselinePlaceRes = await gql.send(
      graphql(`
        mutation ProcessCurrentBaselinePlace($input: CreatePlaceInput!) {
          createPlace(input: $input) {
            place {
              id
            }
          }
        }
      `),
      {
        input: {
          name: 'Baseline Process Place',
          location: { latitude: 59.3293, longitude: 18.0686 },
          org: { id: baselineOrgID },
        },
      },
    )
    const proposedPlaceRes = await gql.send(
      graphql(`
        mutation ProcessCurrentProposedPlace($input: CreatePlaceInput!) {
          createPlace(input: $input) {
            place {
              id
            }
          }
        }
      `),
      {
        input: {
          name: 'Proposed Process Place',
          location: { latitude: 40.7128, longitude: -74.006 },
          org: { id: proposedOrgID },
        },
      },
    )
    expect(baselinePlaceRes.errors).toBeUndefined()
    expect(proposedPlaceRes.errors).toBeUndefined()

    const baselinePlaceID = baselinePlaceRes.data!.createPlace!.place!.id
    const proposedPlaceID = proposedPlaceRes.data!.createPlace!.place!.id

    const directRes = await gql.send(
      graphql(`
        mutation ProcessCurrentBaselineRefs($input: UpdateProcessInput!) {
          updateProcess(input: $input) {
            process {
              id
            }
          }
        }
      `),
      {
        input: {
          id: processID,
          material: { id: MATERIAL_IDS[0] },
          variant: { id: baselineVariantID },
          org: { id: baselineOrgID },
          region: { id: TEST_REGION_ID },
          place: { id: baselinePlaceID },
        },
      },
    )
    expect(directRes.errors).toBeUndefined()

    const changeRes = await gql.send(
      graphql(`
        mutation ProcessCurrentProposedRefs($input: UpdateProcessInput!) {
          updateProcess(input: $input) {
            process {
              id
              material {
                id
              }
              variant {
                id
              }
              org {
                id
              }
              region {
                id
              }
              place {
                id
              }
            }
            currentProcess {
              id
              material {
                id
              }
              variant {
                id
              }
              org {
                id
              }
              region {
                id
              }
              place {
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
          id: processID,
          material: { id: MATERIAL_IDS[1] },
          variant: { id: proposedVariantID },
          org: { id: proposedOrgID },
          region: { id: extraRegionID },
          place: { id: proposedPlaceID },
          change: { title: 'current process refs' },
        },
      },
    )

    expect(changeRes.errors).toBeUndefined()
    expect(changeRes.data?.updateProcess?.process?.material?.id).toBe(MATERIAL_IDS[1])
    expect(changeRes.data?.updateProcess?.process?.variant?.id).toBe(proposedVariantID)
    expect(changeRes.data?.updateProcess?.process?.org?.id).toBe(proposedOrgID)
    expect(changeRes.data?.updateProcess?.process?.region?.id).toBe(extraRegionID)
    expect(changeRes.data?.updateProcess?.process?.place?.id).toBe(proposedPlaceID)
    expect(changeRes.data?.updateProcess?.currentProcess?.material?.id).toBe(MATERIAL_IDS[0])
    expect(changeRes.data?.updateProcess?.currentProcess?.variant?.id).toBe(baselineVariantID)
    expect(changeRes.data?.updateProcess?.currentProcess?.org?.id).toBe(baselineOrgID)
    expect(changeRes.data?.updateProcess?.currentProcess?.region?.id).toBe(TEST_REGION_ID)
    expect(changeRes.data?.updateProcess?.currentProcess?.place?.id).toBe(baselinePlaceID)
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
    let flowPlaceID: string

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
      expect(edits![0].entityName).toBe('Process')
      expect(edits![0].id).toBe(flowProcessID)
      expect(edits![0].createInput).toBeTruthy()
      const changes = edits![0].changes
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
      expect(edits).toBeDefined()
      expect(edits).toHaveLength(1)
      const processEdit = edits!.find((e) => e.entityName === 'Process' && e.id === flowProcessID)
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

    test('step 4: create a place on the same change without persisting it early', async () => {
      const res = await gql.send(
        graphql(`
          mutation FlowCreatePlace($input: CreatePlaceInput!) {
            createPlace(input: $input) {
              place {
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
            name: 'Flow Place',
            location: { latitude: 59.33, longitude: 18.06 },
            org: { id: flowOrgID },
            changeID,
          },
        },
      )
      expect(res.errors).toBeUndefined()
      flowPlaceID = res.data!.createPlace!.place!.id
      expect(res.data!.createPlace!.change!.id).toBe(changeID)

      const em = orm.em.fork()
      expect(await em.findOne(Place, { id: flowPlaceID } as any)).toBeNull()
    })

    test('step 5: update the process adding the new org and place on the same change', async () => {
      const res = await gql.send(
        graphql(`
          mutation FlowUpdateProcessOrgAndPlace($input: UpdateProcessInput!) {
            updateProcess(input: $input) {
              process {
                id
                org {
                  id
                }
                place {
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
            id: flowProcessID,
            org: { id: flowOrgID },
            place: { id: flowPlaceID },
            changeID,
          },
        },
      )
      expect(res.errors).toBeUndefined()
      expect(res.data!.updateProcess!.change!.id).toBe(changeID)
    })

    test('step 6: approve and merge the change', async () => {
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

    test('after merge: process is linked to material, org, and place', async () => {
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
              place {
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
      expect(res.data?.process?.place?.id).toBe(flowPlaceID)
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

    test('after merge: place exists and is queryable', async () => {
      const res = await gql.send(
        graphql(`
          query FlowGetPlace($id: ID!) {
            place(id: $id) {
              id
              name
              org {
                id
              }
            }
          }
        `),
        { id: flowPlaceID },
      )
      expect(res.errors).toBeUndefined()
      expect(res.data?.place?.id).toBe(flowPlaceID)
      expect(res.data?.place?.name).toBe('Flow Place')
      expect(res.data?.place?.org?.id).toBe(flowOrgID)
    })
  })
})
