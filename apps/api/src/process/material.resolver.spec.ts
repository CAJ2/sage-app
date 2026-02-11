import { MikroORM } from '@mikro-orm/postgresql'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { BaseSeeder } from '@src/db/seeds/BaseSeeder'
import {
  MATERIAL_IDS,
  TestMaterialSeeder,
} from '@src/db/seeds/TestMaterialSeeder'
import { UserSeeder } from '@src/db/seeds/UserSeeder'
import { clearDatabase } from '@src/db/test.utils'
import { AppTestModule } from '@test/app-test.module'
import { graphql } from '@test/gql'
import { GraphQLTestClient } from '@test/graphql.utils'

describe('MaterialResolver (integration)', () => {
  let app: INestApplication
  let gql: GraphQLTestClient
  let materialID: string
  let rootMaterialID: string

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

    materialID = MATERIAL_IDS[0]

    // Get the root material
    const rootMaterial = await orm.em.findOne('Material', { parent: null })
    rootMaterialID = (rootMaterial as any)?.id
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
      { id: materialID },
    )
    expect(res.data?.material).toBeTruthy()
    expect(res.data?.material?.id).toBe(materialID)
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
    expect(res.data?.materialRoot?.id).toBe(rootMaterialID)
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
      { id: materialID, first: 10 },
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
      { id: rootMaterialID, first: 10 },
    )
    expect(res.data?.material?.children).toBeTruthy()
    expect(Array.isArray(res.data?.material?.children.nodes)).toBe(true)
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
      { id: materialID, first: 10 },
    )
    expect(res.data?.material?.ancestors).toBeTruthy()
    expect(Array.isArray(res.data?.material?.ancestors.nodes)).toBe(true)
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
      { id: rootMaterialID, first: 10 },
    )
    expect(res.data?.material?.descendants).toBeTruthy()
    expect(Array.isArray(res.data?.material?.descendants.nodes)).toBe(true)
  })

  test('should query material components with pagination', async () => {
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
      { id: materialID, first: 10 },
    )
    expect(res.data?.material?.components).toBeTruthy()
    expect(Array.isArray(res.data?.material?.components.nodes)).toBe(true)
  })

  test('should query material processes with pagination', async () => {
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
      { id: materialID, first: 10 },
    )
    expect(res.data?.material?.processes).toBeTruthy()
    expect(Array.isArray(res.data?.material?.processes.nodes)).toBe(true)
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
