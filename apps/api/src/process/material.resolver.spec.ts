import { MikroORM } from '@mikro-orm/postgresql'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AppTestModule } from '@test/app-test.module'
import { graphql } from '@test/gql'
import { GraphQLTestClient } from '@test/graphql.utils'
import _ from 'lodash'

import { BaseSeeder } from '@src/db/seeds/BaseSeeder'
import { MATERIAL_IDS, TestMaterialSeeder } from '@src/db/seeds/TestMaterialSeeder'
import { UserSeeder } from '@src/db/seeds/UserSeeder'
import { clearDatabase } from '@src/db/test.utils'

import { MATERIAL_ROOT } from './material.entity'

describe('MaterialResolver (integration)', () => {
  let app: INestApplication
  let gql: GraphQLTestClient
  let plasticID: string

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

    plasticID = MATERIAL_IDS[0]
  })

  afterAll(async () => {
    await app.close()
  })

  test('should query materials with pagination', async () => {
    const res = await gql.send(
      graphql(`
        query MaterialResolverListMaterials($first: Int) {
          materials(first: $first) {
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
    expect(res.data?.materials.nodes?.length).toBeGreaterThan(0)
    expect(res.data?.materials.totalCount).toBeGreaterThan(0)
  })

  test('should query a single material', async () => {
    const res = await gql.send(
      graphql(`
        query MaterialResolverGetMaterial($id: ID!) {
          material(id: $id) {
            id
            name
          }
        }
      `),
      { id: plasticID },
    )
    expect(res.data?.material).toBeTruthy()
    expect(res.data?.material?.id).toBe(plasticID)
  })

  test('should query the root material', async () => {
    const res = await gql.send(
      graphql(`
        query MaterialResolverGetMaterialRoot {
          materialRoot {
            id
            name
          }
        }
      `),
    )
    expect(res.data?.materialRoot).toBeTruthy()
    expect(res.data?.materialRoot?.id).toBe(MATERIAL_ROOT)
  })

  test('should query material parents with pagination', async () => {
    const res = await gql.send(
      graphql(`
        query MaterialResolverGetMaterialParents($id: ID!, $first: Int) {
          material(id: $id) {
            id
            parents(first: $first) {
              nodes {
                id
                name
              }
              totalCount
            }
          }
        }
      `),
      { id: plasticID, first: 10 },
    )
    expect(res.data?.material?.parents).toBeTruthy()
    expect(Array.isArray(res.data?.material?.parents.nodes)).toBe(true)
  })

  test('should query material children with pagination', async () => {
    const res = await gql.send(
      graphql(`
        query MaterialResolverGetMaterialChildren($id: ID!, $first: Int) {
          material(id: $id) {
            id
            children(first: $first) {
              nodes {
                id
                name
              }
              totalCount
            }
          }
        }
      `),
      { id: MATERIAL_ROOT, first: 10 },
    )
    expect(res.data?.material?.children).toBeTruthy()
    expect(res.data?.material?.children.nodes?.length).toBeGreaterThan(0)
    _.each(res.data?.material?.children.nodes, (child) => {
      expect(child.id).toBeTruthy()
      expect(['Metal', 'Plastic']).toContain(child.name)
    })
  })

  test('should query material ancestors with pagination', async () => {
    const res = await gql.send(
      graphql(`
        query MaterialResolverGetMaterialAncestors($id: ID!, $first: Int) {
          material(id: $id) {
            id
            ancestors(first: $first) {
              nodes {
                id
                name
              }
              totalCount
            }
          }
        }
      `),
      // Polyethylene
      { id: MATERIAL_IDS[2], first: 10 },
    )
    expect(res.data?.material?.ancestors).toBeTruthy()
    expect(res.data?.material?.ancestors.nodes?.length).toBeGreaterThan(0)
    _.each(res.data?.material?.ancestors.nodes, (ancestor) => {
      expect(ancestor.id).toBeTruthy()
      expect(['Plastic']).toContain(ancestor.name)
    })
  })

  test('should query material descendants with pagination', async () => {
    const res = await gql.send(
      graphql(`
        query MaterialResolverGetMaterialDescendants($id: ID!, $first: Int) {
          material(id: $id) {
            id
            descendants(first: $first) {
              nodes {
                id
                name
              }
              totalCount
            }
          }
        }
      `),
      { id: MATERIAL_ROOT, first: 10 },
    )
    expect(res.data?.material?.descendants).toBeTruthy()
    expect(res.data?.material?.descendants.nodes?.length).toBeGreaterThan(0)
  })

  test('should query material components with pagination', async () => {
    // First create a component associated with the material
    await gql.send(
      graphql(`
        mutation MaterialResolverCreateTestComponent(
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
          name: 'Test Plastic Component',
          apply: true,
          primaryMaterial: {
            id: plasticID,
            materialFraction: 1.0,
          },
          materials: [
            {
              id: plasticID,
              materialFraction: 1.0,
            },
          ],
        },
      },
    )

    const res = await gql.send(
      graphql(`
        query MaterialResolverGetMaterialComponents($id: ID!, $first: Int) {
          material(id: $id) {
            id
            components(first: $first) {
              nodes {
                id
                name
              }
              totalCount
            }
          }
        }
      `),
      { id: plasticID, first: 10 },
    )
    expect(res.data?.material?.components).toBeTruthy()
    expect(res.data?.material?.components.nodes?.length).toBeGreaterThan(0)
  })

  test('should query material processes with pagination', async () => {
    // First create a process associated with the material
    await gql.send(
      graphql(`
        mutation MaterialResolverCreateTestProcess(
          $input: CreateProcessInput!
        ) {
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
          name: 'Test Plastic Recycling Process',
          intent: 'RECYCLE',
          apply: true,
          material: {
            id: plasticID,
          },
        },
      },
    )

    const res = await gql.send(
      graphql(`
        query MaterialResolverGetMaterialProcesses($id: ID!, $first: Int) {
          material(id: $id) {
            id
            processes(first: $first) {
              nodes {
                id
                name
              }
              totalCount
            }
          }
        }
      `),
      { id: plasticID, first: 10 },
    )
    expect(res.data?.material?.processes).toBeTruthy()
    expect(res.data?.material?.processes.nodes?.length).toBeGreaterThan(0)
  })

  test('should return error for non-existent material', async () => {
    const res = await gql.send(
      graphql(`
        query MaterialResolverGetNonExistentMaterial($id: ID!) {
          material(id: $id) {
            id
          }
        }
      `),
      { id: 'non-existent-id' },
    )
    expect(res.errors).toBeTruthy()
    expect(res.errors?.[0].message).toContain('Material not found')
  })
})
