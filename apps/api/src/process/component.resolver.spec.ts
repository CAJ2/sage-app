import { MikroORM } from '@mikro-orm/postgresql'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { BaseSeeder } from '@src/db/seeds/BaseSeeder'
import { MATERIAL_IDS, TestMaterialSeeder } from '@src/db/seeds/TestMaterialSeeder'
import { COMPONENT_IDS, TestVariantSeeder } from '@src/db/seeds/TestVariantSeeder'
import { UserSeeder } from '@src/db/seeds/UserSeeder'
import { clearDatabase } from '@src/db/test.utils'
import { AppTestModule } from '@test/app-test.module'
import { graphql } from '@test/gql'
import { GraphQLTestClient } from '@test/graphql.utils'

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
    await orm.seeder.seed(BaseSeeder, UserSeeder, TestMaterialSeeder, TestVariantSeeder)

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
    expect(res.data?.component).toBeTruthy()
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
    expect(res.data?.componentSchema).toBeTruthy()
    expect(res.data?.componentSchema?.create).toBeTruthy()
    expect(res.data?.componentSchema?.update).toBeTruthy()
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
    expect(res.data?.component).toBeTruthy()
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
    expect(res.data?.component).toBeTruthy()
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
    expect(res.data?.createComponent?.component).toBeTruthy()
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
    expect(res.data?.updateComponent?.component?.id).toBe(componentID)
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
})
