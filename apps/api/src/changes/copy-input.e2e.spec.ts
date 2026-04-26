import { MikroORM } from '@mikro-orm/postgresql'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AppTestModule } from '@test/app-test.module'
import { graphql } from '@test/gql'
import { GraphQLTestClient } from '@test/graphql.utils'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import { CATEGORY_IDS, TestCategorySeeder } from '@src/db/seeds/TestCategorySeeder'
import { TestMaterialSeeder } from '@src/db/seeds/TestMaterialSeeder'
import { PROCESS_IDS, TestProcessSeeder } from '@src/db/seeds/TestProcessSeeder'
import { TestVariantSeeder, VARIANT_IDS } from '@src/db/seeds/TestVariantSeeder'
import { UserSeeder } from '@src/db/seeds/UserSeeder'
import { clearDatabase } from '@src/db/test.utils'

const DirectEditQuery = graphql(`
  query DirectEditCopyInputTest($id: ID!, $entityName: String!) {
    directEdit(id: $id, entityName: $entityName) {
      entityName
      id
      updateInput
      copyInput
    }
  }
`)

const CreateVariantMutation = graphql(`
  mutation CopyInputCreateVariant($input: CreateVariantInput!) {
    createVariant(input: $input) {
      variant {
        id
        name
      }
    }
  }
`)

const CreateCategoryMutation = graphql(`
  mutation CopyInputCreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      category {
        id
        name
      }
    }
  }
`)

const UpdateProcessMutation = graphql(`
  mutation CopyInputUpdateProcess($input: UpdateProcessInput!) {
    updateProcess(input: $input) {
      change {
        id
        edits(first: 10) {
          nodes {
            id
            entityName
            updateInput
            copyInput
          }
        }
      }
    }
  }
`)

const CreateProcessMutation = graphql(`
  mutation CopyInputCreateProcess($input: CreateProcessInput!) {
    createProcess(input: $input) {
      process {
        id
        name
      }
    }
  }
`)

describe('copyInput End-to-End', () => {
  let app: INestApplication
  let gql: GraphQLTestClient

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
      UserSeeder,
      TestMaterialSeeder,
      TestCategorySeeder,
      TestVariantSeeder,
      TestProcessSeeder,
    )

    await gql.signIn('admin', 'password')
  })

  afterAll(async () => {
    await app.close()
  })

  test('should duplicate a Variant using copyInput from directEdit', async () => {
    // 1. Get copyInput for an existing Variant
    const directEditRes = await gql.send(DirectEditQuery, {
      id: VARIANT_IDS[0],
      entityName: 'Variant',
    })
    expect(directEditRes.errors).toBeUndefined()
    const copyInput = directEditRes.data?.directEdit?.copyInput
    expect(copyInput).toBeDefined()
    expect(copyInput.id).toBeUndefined()
    const originalName = directEditRes.data?.directEdit?.updateInput?.name

    // 2. Use copyInput to create a new Variant (duplicate)
    const createRes = await gql.send(CreateVariantMutation, {
      input: copyInput,
    })

    expect(createRes.errors).toBeUndefined()
    const createdVariant = createRes.data?.createVariant?.variant
    expect(createdVariant?.id).toBeDefined()
    expect(createdVariant?.id).not.toBe(VARIANT_IDS[0])
    expect(createdVariant?.name).toBe(originalName)
  })

  test('should duplicate a Category using copyInput from directEdit', async () => {
    // 1. Get copyInput for an existing Category
    const directEditRes = await gql.send(DirectEditQuery, {
      id: CATEGORY_IDS[0],
      entityName: 'Category',
    })
    expect(directEditRes.errors).toBeUndefined()
    const copyInput = directEditRes.data?.directEdit?.copyInput
    expect(copyInput).toBeDefined()
    const originalName = directEditRes.data?.directEdit?.updateInput?.name

    // 2. Use copyInput to create a new Category (duplicate)
    const createRes = await gql.send(CreateCategoryMutation, {
      input: copyInput,
    })

    expect(createRes.errors).toBeUndefined()
    const createdCategory = createRes.data?.createCategory?.category
    expect(createdCategory?.id).toBeDefined()
    expect(createdCategory?.id).not.toBe(CATEGORY_IDS[0])
    expect(createdCategory?.name).toBe(originalName)
  })

  test('should duplicate a Process using copyInput from ChangeEdit', async () => {
    // 1. Create a ChangeEdit for a Process by updating it in change mode
    const proposedName = 'Proposed New Process Name'
    const updateRes = await gql.send(UpdateProcessMutation, {
      input: {
        id: PROCESS_IDS[0],
        name: proposedName,
        change: { title: 'Test Change' },
      },
    })
    expect(updateRes.errors).toBeUndefined()
    const changeID = updateRes.data?.updateProcess?.change?.id
    expect(changeID).toBeDefined()

    // Query the Change to get the Edit node with copyInput
    const changeRes = await gql.send(
      graphql(`
        query GetChangeEditsForCopyTest($id: ID!) {
          change(id: $id) {
            edits(first: 10) {
              nodes {
                id
                entityName
                copyInput
              }
            }
          }
        }
      `),
      { id: changeID! },
    )

    const editNode = changeRes.data?.change?.edits?.nodes?.find(
      (e: any) => e.entityName === 'Process',
    )
    expect(editNode?.copyInput).toBeDefined()
    const copyInput = editNode?.copyInput

    // 2. Use copyInput to create a new Process (duplicate from edit)
    const createRes = await gql.send(CreateProcessMutation, {
      input: copyInput,
    })

    expect(createRes.errors).toBeUndefined()
    const createdProcess = createRes.data?.createProcess?.process
    expect(createdProcess?.id).toBeDefined()
    expect(createdProcess?.id).not.toBe(PROCESS_IDS[0])
    expect(createdProcess?.name).toBe(proposedName)
  })
})
