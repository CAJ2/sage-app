import { MikroORM } from '@mikro-orm/postgresql'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AppTestModule } from '@test/app-test.module'
import { graphql } from '@test/gql'
import { ChangeStatus } from '@test/gql/types.generated'
import { GraphQLTestClient } from '@test/graphql.utils'

import { BaseSeeder } from '@src/db/seeds/BaseSeeder'
import { MATERIAL_IDS, TestMaterialSeeder } from '@src/db/seeds/TestMaterialSeeder'
import { REGION_IDS, TestProcessSeeder } from '@src/db/seeds/TestProcessSeeder'
import { TAG_IDS, TestTagSeeder } from '@src/db/seeds/TestTagSeeder'
import { COMPONENT_IDS, TestVariantSeeder } from '@src/db/seeds/TestVariantSeeder'
import { UserSeeder } from '@src/db/seeds/UserSeeder'
import { clearDatabase } from '@src/db/test.utils'

describe('ComponentResolver (integration)', () => {
  let app: INestApplication
  let gql: GraphQLTestClient
  let componentID: string

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppTestModule],
    }).compile()

    app = module.createNestApplication()
    await app.init()

    gql = new GraphQLTestClient(app)

    const orm = module.get<MikroORM>(MikroORM)

    await clearDatabase(orm, 'public', ['users'])
    await orm.seeder.seed(
      BaseSeeder,
      UserSeeder,
      TestMaterialSeeder,
      TestProcessSeeder,
      TestTagSeeder,
      TestVariantSeeder,
    )

    await gql.signIn('admin', 'password')

    componentID = COMPONENT_IDS[0]
  })

  afterAll(async () => {
    await app.close()
  })

  test('should query components with pagination', async () => {
    const res = await gql.send(
      graphql(`
        query ComponentResolverListComponents($first: Int) {
          components(first: $first) {
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
    expect(res.data?.components.nodes).toBeDefined()
    expect(res.data?.components.nodes?.length).toBeGreaterThan(0)
    expect(res.data?.components.totalCount).toBeGreaterThan(0)
  })

  test('should query a single component', async () => {
    const res = await gql.send(
      graphql(`
        query ComponentResolverGetComponent($id: ID!) {
          component(id: $id) {
            id
            name
          }
        }
      `),
      { id: componentID },
    )
    expect(res.errors).toBeUndefined()
    expect(res.data?.component).toBeDefined()
    expect(res.data?.component?.id).toBe(componentID)
  })

  test('should query component schema', async () => {
    const res = await gql.send(
      graphql(`
        query ComponentResolverGetComponentSchema {
          componentSchema {
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
    expect(res.errors).toBeUndefined()
    expect(res.data?.componentSchema).toBeDefined()
    expect(res.data?.componentSchema?.create).toBeDefined()
    expect(res.data?.componentSchema?.update).toBeDefined()
  })

  test('should query component material', async () => {
    const res = await gql.send(
      graphql(`
        query ComponentResolverGetComponentMaterial($id: ID!) {
          component(id: $id) {
            id
            materials {
              material {
                id
                name
              }
            }
          }
        }
      `),
      { id: componentID },
    )
    expect(res.errors).toBeUndefined()
    expect(res.data?.component).toBeDefined()
  })

  test('should query component tags', async () => {
    const res = await gql.send(
      graphql(`
        query ComponentResolverGetComponentTags($id: ID!) {
          component(id: $id) {
            id
            tags {
              id
              name
            }
          }
        }
      `),
      { id: componentID },
    )
    expect(res.errors).toBeUndefined()
    expect(res.data?.component).toBeDefined()
    expect(Array.isArray(res.data?.component?.tags)).toBe(true)
  })

  test('should create a component', async () => {
    const res = await gql.send(
      graphql(`
        mutation ComponentResolverCreateComponent(
          $input: CreateComponentInput!
        ) {
          createComponent(input: $input) {
            component {
              id
              name
            }
          }
        }
      `),
      {
        input: {
          name: 'Test Component',
          primaryMaterial: {
            id: MATERIAL_IDS[0],
          },
        },
      },
    )
    expect(res.errors).toBeUndefined()
    expect(res.data?.createComponent?.component).toBeDefined()
    expect(res.data?.createComponent?.component?.name).toBe('Test Component')
  })

  test('should update a component', async () => {
    const res = await gql.send(
      graphql(`
        mutation ComponentResolverUpdateComponent(
          $input: UpdateComponentInput!
        ) {
          updateComponent(input: $input) {
            component {
              id
              name
            }
          }
        }
      `),
      {
        input: {
          id: componentID,
          name: 'Updated Component Name',
        },
      },
    )
    expect(res.errors).toBeUndefined()
    expect(res.data?.updateComponent?.component).toBeDefined()
    expect(res.data?.updateComponent?.component?.id).toBe(componentID)
    expect(res.data?.updateComponent?.component?.name).toBe('Updated Component Name')
  })

  test('should return error for non-existent component', async () => {
    const res = await gql.send(
      graphql(`
        query ComponentResolverGetNonExistentComponent($id: ID!) {
          component(id: $id) {
            id
          }
        }
      `),
      { id: 'non-existent-id' },
    )
    expect(res.errors).toBeTruthy()
    expect(res.errors?.[0].message).toContain('Component not found')
  })

  // Comprehensive Create Tests
  describe('CreateComponent comprehensive field tests', () => {
    test('should create component with all text fields and primary material', async () => {
      const res = await gql.send(
        graphql(`
          mutation CreateComponentAllFields($input: CreateComponentInput!) {
            createComponent(input: $input) {
              component {
                id
                name
                desc
                imageURL
                primaryMaterial {
                  id
                }
              }
            }
          }
        `),
        {
          input: {
            name: 'Comprehensive Test Component',
            desc: 'Detailed component description',
            imageURL: 'https://example.com/component.jpg',
            lang: 'en',
            primaryMaterial: { id: MATERIAL_IDS[0] },
          },
        },
      )
      expect(res.errors).toBeUndefined()
      expect(res.data?.createComponent?.component).toBeDefined()
      expect(res.data?.createComponent?.component?.name).toBe('Comprehensive Test Component')
      expect(res.data?.createComponent?.component?.desc).toBe('Detailed component description')
      expect(res.data?.createComponent?.component?.imageURL).toBe(
        'https://example.com/component.jpg',
      )
      expect(res.data?.createComponent?.component?.primaryMaterial?.id).toBe(MATERIAL_IDS[0])
    })

    test('should create component with translated fields', async () => {
      const res = await gql.send(
        graphql(`
          mutation CreateComponentTranslated($input: CreateComponentInput!) {
            createComponent(input: $input) {
              component {
                id
                name
              }
            }
          }
        `),
        {
          input: {
            nameTr: [
              { lang: 'en', text: 'English Component' },
              { lang: 'sv', text: 'Svenska Komponent' },
            ],
            descTr: [
              { lang: 'en', text: 'English Comp Description' },
              { lang: 'sv', text: 'Svenska Beskrivning' },
            ],
            primaryMaterial: { id: MATERIAL_IDS[0] },
          },
        },
      )
      expect(res.errors).toBeUndefined()
      expect(res.data?.createComponent?.component).toBeDefined()
    })

    test('should create component with materials and physical data', async () => {
      const res = await gql.send(
        graphql(`
          mutation CreateComponentWithMaterials($input: CreateComponentInput!) {
            createComponent(input: $input) {
              component {
                id
                name
              }
            }
          }
        `),
        {
          input: {
            name: 'Component with Materials',
            primaryMaterial: { id: MATERIAL_IDS[0] },
            materials: [
              { id: MATERIAL_IDS[0], materialFraction: 0.7 },
              { id: MATERIAL_IDS[1], materialFraction: 0.3 },
            ],
            physical: { weight: 100, unit: 'g' },
          },
        },
      )
      expect(res.errors).toBeUndefined()
      expect(res.data?.createComponent?.component).toBeDefined()
      expect(res.data?.createComponent?.component?.name).toBe('Component with Materials')
    })

    test('should create component with tags', async () => {
      const res = await gql.send(
        graphql(`
          mutation CreateComponentWithTags($input: CreateComponentInput!) {
            createComponent(input: $input) {
              component {
                id
                tags {
                  id
                }
              }
            }
          }
        `),
        {
          input: {
            name: 'Component with Tags',
            primaryMaterial: { id: MATERIAL_IDS[0] },
            tags: [
              { id: TAG_IDS[0], meta: { score: 95 } },
              { id: TAG_IDS[3], meta: { level: 'low' } },
            ],
          },
        },
      )
      expect(res.errors).toBeUndefined()
      expect(res.data?.createComponent?.component).toBeDefined()
      expect(res.data?.createComponent?.component?.tags).toHaveLength(2)
      expect(res.data?.createComponent?.component?.tags?.map((t: any) => t.id)).toContain(
        TAG_IDS[0],
      )
      expect(res.data?.createComponent?.component?.tags?.map((t: any) => t.id)).toContain(
        TAG_IDS[3],
      )
    })

    test('should create component with region', async () => {
      const res = await gql.send(
        graphql(`
          mutation CreateComponentWithRegion($input: CreateComponentInput!) {
            createComponent(input: $input) {
              component {
                id
                region {
                  id
                }
              }
            }
          }
        `),
        {
          input: {
            name: 'Component with Region',
            primaryMaterial: { id: MATERIAL_IDS[0] },
            region: { id: REGION_IDS[0] },
          },
        },
      )
      expect(res.errors).toBeUndefined()
      expect(res.data?.createComponent?.component).toBeDefined()
      expect(res.data?.createComponent?.component?.region?.id).toBe(REGION_IDS[0])
    })

    test('should create component with change tracking', async () => {
      const res = await gql.send(
        graphql(`
          mutation CreateComponentWithChange($input: CreateComponentInput!) {
            createComponent(input: $input) {
              component {
                id
              }
              change {
                id
                status
              }
            }
          }
        `),
        {
          input: {
            name: 'Component with Change',
            primaryMaterial: { id: MATERIAL_IDS[0] },
            change: {
              title: 'Add new component',
              status: ChangeStatus.Draft,
            },
          },
        },
      )
      expect(res.errors).toBeUndefined()
      expect(res.data?.createComponent?.component).toBeDefined()
      expect(res.data?.createComponent?.change).toBeDefined()
      expect(res.data?.createComponent?.change?.status).toBe('DRAFT')
    })
  })

  // Comprehensive Update Tests
  describe('UpdateComponent comprehensive field tests', () => {
    let testComponentID: string

    beforeAll(async () => {
      const res = await gql.send(
        graphql(`
          mutation CreateComponentForUpdate($input: CreateComponentInput!) {
            createComponent(input: $input) {
              component {
                id
              }
            }
          }
        `),
        {
          input: {
            name: 'Component for Updates',
            primaryMaterial: { id: MATERIAL_IDS[0] },
          },
        },
      )
      if (res.data?.createComponent?.component?.id) {
        testComponentID = res.data?.createComponent?.component?.id
      } else {
        throw new Error('Failed to create component for update tests')
      }
    })

    test('should update component text fields', async () => {
      const res = await gql.send(
        graphql(`
          mutation UpdateComponentText($input: UpdateComponentInput!) {
            updateComponent(input: $input) {
              component {
                id
                name
                desc
              }
            }
          }
        `),
        {
          input: {
            id: testComponentID,
            name: 'Updated Component Name',
            desc: 'Updated Description',
          },
        },
      )
      expect(res.errors).toBeUndefined()
      expect(res.data?.updateComponent?.component).toBeDefined()
      expect(res.data?.updateComponent?.component?.id).toBe(testComponentID)
      expect(res.data?.updateComponent?.component?.name).toBe('Updated Component Name')
      expect(res.data?.updateComponent?.component?.desc).toBe('Updated Description')
    })

    test('should update component materials', async () => {
      const res = await gql.send(
        graphql(`
          mutation UpdateComponentMaterials($input: UpdateComponentInput!) {
            updateComponent(input: $input) {
              component {
                id
                name
              }
            }
          }
        `),
        {
          input: {
            id: testComponentID,
            materials: [{ id: MATERIAL_IDS[1], materialFraction: 0.5 }],
          },
        },
      )
      expect(res.errors).toBeUndefined()
      expect(res.data?.updateComponent?.component).toBeDefined()
      expect(res.data?.updateComponent?.component?.id).toBe(testComponentID)
    })

    test('should add and remove tags', async () => {
      // Add tags
      const addRes = await gql.send(
        graphql(`
          mutation UpdateComponentAddTags($input: UpdateComponentInput!) {
            updateComponent(input: $input) {
              component {
                id
                tags {
                  id
                }
              }
            }
          }
        `),
        {
          input: {
            id: testComponentID,
            addTags: [{ id: TAG_IDS[0], meta: { score: 80 } }],
          },
        },
      )
      expect(addRes.errors).toBeUndefined()
      expect(addRes.data?.updateComponent?.component).toBeDefined()
      expect(addRes.data?.updateComponent?.component?.tags).toHaveLength(1)
      expect(addRes.data?.updateComponent?.component?.tags?.map((t: any) => t.id)).toContain(
        TAG_IDS[0],
      )

      // Remove tags
      const removeRes = await gql.send(
        graphql(`
          mutation UpdateComponentRemoveTags($input: UpdateComponentInput!) {
            updateComponent(input: $input) {
              component {
                id
              }
            }
          }
        `),
        {
          input: {
            id: testComponentID,
            removeTags: [TAG_IDS[0]],
          },
        },
      )
      expect(removeRes.errors).toBeUndefined()
      expect(removeRes.data?.updateComponent?.component).toBeDefined()
      expect(removeRes.data?.updateComponent?.component?.id).toBe(testComponentID)
    })

    test('should update component with change tracking', async () => {
      const res = await gql.send(
        graphql(`
          mutation UpdateComponentWithChange($input: UpdateComponentInput!) {
            updateComponent(input: $input) {
              component {
                id
              }
              change {
                id
                status
              }
            }
          }
        `),
        {
          input: {
            id: testComponentID,
            name: 'Updated via Change',
            change: {
              title: 'Update component',
              status: ChangeStatus.Proposed,
            },
          },
        },
      )
      expect(res.errors).toBeUndefined()
      expect(res.data?.updateComponent?.component).toBeDefined()
      expect(res.data?.updateComponent?.component?.id).toBe(testComponentID)
      expect(res.data?.updateComponent?.change).toBeDefined()
      expect(res.data?.updateComponent?.change?.status).toBe('PROPOSED')
    })
  })

  describe('history tracking', () => {
    let historyComponentID: string

    test('should record history on direct create', async () => {
      const createRes = await gql.send(
        graphql(`
          mutation ComponentHistoryCreate($input: CreateComponentInput!) {
            createComponent(input: $input) {
              component {
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
        { input: { name: 'History Test Component', primaryMaterial: { id: MATERIAL_IDS[0] } } },
      )
      expect(createRes.errors).toBeUndefined()
      const component = createRes.data?.createComponent?.component
      expect(component).toBeDefined()
      historyComponentID = component!.id
      expect(component!.history).toHaveLength(1)
      expect(component!.history[0].user).toBeDefined()
      expect(component!.history[0].original).toBeNull()
      expect(component!.history[0].changes).toBeTruthy()
    })

    test('should record history on direct update', async () => {
      const updateRes = await gql.send(
        graphql(`
          mutation ComponentHistoryUpdate($input: UpdateComponentInput!) {
            updateComponent(input: $input) {
              component {
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
        { input: { id: historyComponentID, name: 'Updated History Component' } },
      )
      expect(updateRes.errors).toBeUndefined()
      const component = updateRes.data?.updateComponent?.component
      expect(component).toBeDefined()
      expect(component!.history).toHaveLength(2)
      const latest = component!.history.at(-1)!
      expect(latest.original).toBeTruthy()
      expect(latest.changes).toBeTruthy()
    })
  })
})
