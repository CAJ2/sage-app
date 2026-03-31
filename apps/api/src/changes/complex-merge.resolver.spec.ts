import { MikroORM } from '@mikro-orm/postgresql'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AppTestModule } from '@test/app-test.module'
import { graphql } from '@test/gql'
import { ChangeStatus } from '@test/gql/types.generated'
import { GraphQLTestClient } from '@test/graphql.utils'
import { assertNoErrors } from '@test/helpers/gql'

import { BaseSeeder } from '@src/db/seeds/BaseSeeder'
import { MATERIAL_IDS, TestMaterialSeeder } from '@src/db/seeds/TestMaterialSeeder'
import {
  ORG_IDS,
  PROCESS_IDS,
  REGION_IDS,
  TestProcessSeeder,
} from '@src/db/seeds/TestProcessSeeder'
import { TestTagSeeder } from '@src/db/seeds/TestTagSeeder'
import {
  COMPONENT_IDS,
  ITEM_IDS,
  TestVariantSeeder,
  VARIANT_IDS,
} from '@src/db/seeds/TestVariantSeeder'
import { UserSeeder } from '@src/db/seeds/UserSeeder'
import { clearDatabase } from '@src/db/test.utils'
import { Component, ComponentsMaterials } from '@src/process/component.entity'
import { Process } from '@src/process/process.entity'
import {
  Variant,
  VariantsComponents,
  VariantsItems,
  VariantsOrgs,
} from '@src/product/variant.entity'

describe('Complex Merge Resolver (integration)', () => {
  let app: INestApplication
  let gql: GraphQLTestClient
  let orm: MikroORM

  const approveAndMerge = async (changeID: string) => {
    const approveRes = await gql.send(
      graphql(`
        mutation ComplexMergeApprove($input: UpdateChangeInput!) {
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
    assertNoErrors(approveRes)
    expect(approveRes.data?.updateChange?.change?.status).toBe('APPROVED')

    const mergeRes = await gql.send(
      graphql(`
        mutation ComplexMergeMerge($id: ID!) {
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
    assertNoErrors(mergeRes)
    expect(mergeRes.data?.mergeChange?.change?.status).toBe('MERGED')
  }

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppTestModule],
    }).compile()

    app = module.createNestApplication()
    await app.init()

    gql = new GraphQLTestClient(app)
    orm = module.get<MikroORM>(MikroORM)

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
  })

  afterAll(async () => {
    await app.close()
  })

  // Sequence A:
  // 1) Seed a change from an existing variant.
  // 2) Apply multiple updates in the same change to variant/component/process with set/add/remove churn.
  // 3) Exercise pivot refs with metadata (variant-components quantity/unit, component-material fractions).
  // 4) Exercise single refs (process material/variant/org/region, variant region).
  // 5) Merge and assert final relation state reflects latest staged values.
  test('Sequence A: multi-entity updates with pivot metadata + single-reference reassignment', async () => {
    const changeSeedRes = await gql.send(
      graphql(`
        mutation ComplexMergeASeedChange($input: UpdateVariantInput!) {
          updateVariant(input: $input) {
            change {
              id
              status
            }
            variant {
              id
            }
          }
        }
      `),
      {
        input: {
          id: VARIANT_IDS[0],
          name: 'Complex Merge A Seed',
          change: { title: 'Complex merge sequence A', status: ChangeStatus.Draft },
        },
      },
    )
    assertNoErrors(changeSeedRes)
    const changeID = changeSeedRes.data?.updateVariant?.change?.id
    expect(changeID).toBeDefined()

    const updateVariantSetRes = await gql.send(
      graphql(`
        mutation ComplexMergeAUpdateVariantSet($input: UpdateVariantInput!) {
          updateVariant(input: $input) {
            variant {
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
          id: VARIANT_IDS[0],
          items: [{ id: ITEM_IDS[0] }, { id: ITEM_IDS[1] }],
          components: [
            { id: COMPONENT_IDS[0], quantity: 1.5, unit: 'g' },
            { id: COMPONENT_IDS[1], quantity: 2.25, unit: 'ml' },
          ],
          region: { id: REGION_IDS[1] },
          changeID,
        },
      },
    )
    assertNoErrors(updateVariantSetRes)

    const updateVariantChurnRes = await gql.send(
      graphql(`
        mutation ComplexMergeAUpdateVariantChurn($input: UpdateVariantInput!) {
          updateVariant(input: $input) {
            variant {
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
          id: VARIANT_IDS[0],
          addItems: [{ id: ITEM_IDS[0] }],
          removeItems: [ITEM_IDS[1]],
          addComponents: [{ id: COMPONENT_IDS[0], quantity: 3.75, unit: 'g' }],
          removeComponents: [COMPONENT_IDS[1]],
          changeID,
        },
      },
    )
    assertNoErrors(updateVariantChurnRes)

    const updateComponentSetRes = await gql.send(
      graphql(`
        mutation ComplexMergeAUpdateComponentSet($input: UpdateComponentInput!) {
          updateComponent(input: $input) {
            component {
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
          id: COMPONENT_IDS[0],
          materials: [
            { id: MATERIAL_IDS[0], materialFraction: 0.7 },
            { id: MATERIAL_IDS[1], materialFraction: 0.3 },
          ],
          region: { id: REGION_IDS[0] },
          changeID,
        },
      },
    )
    assertNoErrors(updateComponentSetRes)

    const updateComponentRewriteRes = await gql.send(
      graphql(`
        mutation ComplexMergeAUpdateComponentRewrite($input: UpdateComponentInput!) {
          updateComponent(input: $input) {
            component {
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
          id: COMPONENT_IDS[0],
          materials: [
            { id: MATERIAL_IDS[1], materialFraction: 0.55 },
            { id: MATERIAL_IDS[2], materialFraction: 0.45 },
          ],
          region: { id: REGION_IDS[1] },
          changeID,
        },
      },
    )
    assertNoErrors(updateComponentRewriteRes)

    const updateProcessInterimRes = await gql.send(
      graphql(`
        mutation ComplexMergeAUpdateProcessInterim($input: UpdateProcessInput!) {
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
          id: PROCESS_IDS[0],
          name: 'Complex Merge A Process Interim',
          material: { id: MATERIAL_IDS[0] },
          variant: { id: VARIANT_IDS[0] },
          org: { id: ORG_IDS[0] },
          region: { id: REGION_IDS[0] },
          changeID,
        },
      },
    )
    assertNoErrors(updateProcessInterimRes)

    const updateProcessFinalRes = await gql.send(
      graphql(`
        mutation ComplexMergeAUpdateProcessFinal($input: UpdateProcessInput!) {
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
          id: PROCESS_IDS[0],
          name: 'Complex Merge A Process Final',
          material: { id: MATERIAL_IDS[3] },
          variant: { id: VARIANT_IDS[0] },
          org: { id: ORG_IDS[1] },
          region: { id: REGION_IDS[1] },
          changeID,
        },
      },
    )
    assertNoErrors(updateProcessFinalRes)

    await approveAndMerge(changeID!)

    const variantGraphRes = await gql.send(
      graphql(`
        query ComplexMergeAGetVariant($id: ID!) {
          variant(id: $id) {
            id
            items(first: 20) {
              nodes {
                id
              }
            }
            components(first: 20) {
              nodes {
                component {
                  id
                }
                quantity
                unit
              }
            }
            regions(first: 10) {
              nodes {
                id
              }
            }
          }
        }
      `),
      { id: VARIANT_IDS[0] },
    )
    assertNoErrors(variantGraphRes)
    const graphItemIDs = variantGraphRes.data?.variant?.items?.nodes?.map((n) => n.id) ?? []
    expect(graphItemIDs).toContain(ITEM_IDS[0])
    expect(graphItemIDs).not.toContain(ITEM_IDS[1])
    const graphComponents = variantGraphRes.data?.variant?.components?.nodes ?? []
    expect(graphComponents).toHaveLength(1)
    expect(graphComponents[0].component.id).toBe(COMPONENT_IDS[0])
    expect(Number(graphComponents[0].quantity)).toBeCloseTo(3.75, 5)
    expect(graphComponents[0].unit).toBe('g')
    const graphRegionIDs = variantGraphRes.data?.variant?.regions?.nodes?.map((r) => r.id) ?? []
    expect(graphRegionIDs).toContain(REGION_IDS[1])

    const em = orm.em.fork()

    const variantEntity = await em.findOne(Variant, { id: VARIANT_IDS[0] } as any, {
      populate: ['region'],
    })
    expect(variantEntity?.region?.id).toBe(REGION_IDS[1])

    const variantItemRows = await em.find(VariantsItems, { variant: VARIANT_IDS[0] } as any, {
      populate: ['item'],
    })
    expect(variantItemRows.map((row) => row.item.id)).toEqual(expect.arrayContaining([ITEM_IDS[0]]))
    expect(variantItemRows.map((row) => row.item.id)).not.toContain(ITEM_IDS[1])

    const variantComponentRows = await em.find(
      VariantsComponents,
      { variant: VARIANT_IDS[0] } as any,
      {
        populate: ['component'],
      },
    )
    expect(variantComponentRows).toHaveLength(1)
    expect(variantComponentRows[0].component.id).toBe(COMPONENT_IDS[0])
    expect(Number(variantComponentRows[0].quantity)).toBeCloseTo(3.75, 5)
    expect(variantComponentRows[0].unit).toBe('g')

    const componentMaterialRows = await em.find(
      ComponentsMaterials,
      { component: COMPONENT_IDS[0] } as any,
      { populate: ['material'] },
    )
    expect(componentMaterialRows).toHaveLength(2)
    const fractions = new Map(
      componentMaterialRows.map((row) => [row.material.id, Number(row.materialFraction)]),
    )
    expect(fractions.get(MATERIAL_IDS[1])).toBeCloseTo(0.55, 5)
    expect(fractions.get(MATERIAL_IDS[2])).toBeCloseTo(0.45, 5)

    const processEntity = await em.findOne(Process, { id: PROCESS_IDS[0] } as any, {
      populate: ['material', 'variant', 'org', 'region'],
    })
    expect(processEntity).toBeDefined()
    expect(processEntity?.name?.en).toBe('Complex Merge A Process Final')
    expect(processEntity?.material?.id).toBe(MATERIAL_IDS[3])
    expect(processEntity?.variant?.id).toBe(VARIANT_IDS[0])
    expect(processEntity?.org?.id).toBe(ORG_IDS[1])
    expect(processEntity?.region?.id).toBe(REGION_IDS[1])
  })

  // Sequence B:
  // 1) Seed a change from another existing variant.
  // 2) Perform repeated update passes with set/add/remove for variant and component relations.
  // 3) Reassign single refs on process and region refs on variant/component.
  // 4) Merge and verify precision: removed rows gone, expected rows/metadata retained, no stale refs.
  test('Sequence B: another dense multi-update flow validating set/add/remove precision', async () => {
    const changeSeedRes = await gql.send(
      graphql(`
        mutation ComplexMergeBSeedChange($input: UpdateVariantInput!) {
          updateVariant(input: $input) {
            change {
              id
              status
            }
            variant {
              id
            }
          }
        }
      `),
      {
        input: {
          id: VARIANT_IDS[1],
          name: 'Complex Merge B Seed',
          change: { title: 'Complex merge sequence B', status: ChangeStatus.Draft },
        },
      },
    )
    assertNoErrors(changeSeedRes)
    const changeID = changeSeedRes.data?.updateVariant?.change?.id
    expect(changeID).toBeDefined()

    const updateVariantSetRes = await gql.send(
      graphql(`
        mutation ComplexMergeBUpdateVariantSet($input: UpdateVariantInput!) {
          updateVariant(input: $input) {
            variant {
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
          id: VARIANT_IDS[1],
          items: [{ id: ITEM_IDS[0] }, { id: ITEM_IDS[1] }],
          components: [
            { id: COMPONENT_IDS[0], quantity: 1, unit: 'g' },
            { id: COMPONENT_IDS[1], quantity: 2, unit: 'ml' },
          ],
          region: { id: REGION_IDS[0] },
          changeID,
        },
      },
    )
    assertNoErrors(updateVariantSetRes)

    const updateVariantChurnRes = await gql.send(
      graphql(`
        mutation ComplexMergeBUpdateVariantChurn($input: UpdateVariantInput!) {
          updateVariant(input: $input) {
            variant {
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
          id: VARIANT_IDS[1],
          addItems: [{ id: ITEM_IDS[0] }],
          removeItems: [ITEM_IDS[1]],
          addComponents: [{ id: COMPONENT_IDS[1], quantity: 4.2, unit: 'ml' }],
          removeComponents: [COMPONENT_IDS[0]],
          region: { id: REGION_IDS[1] },
          changeID,
        },
      },
    )
    assertNoErrors(updateVariantChurnRes)

    const updateComponentSetRes = await gql.send(
      graphql(`
        mutation ComplexMergeBUpdateComponentSet($input: UpdateComponentInput!) {
          updateComponent(input: $input) {
            component {
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
          id: COMPONENT_IDS[1],
          materials: [
            { id: MATERIAL_IDS[0], materialFraction: 0.4 },
            { id: MATERIAL_IDS[1], materialFraction: 0.6 },
          ],
          region: { id: REGION_IDS[0] },
          changeID,
        },
      },
    )
    assertNoErrors(updateComponentSetRes)

    const updateComponentFinalRes = await gql.send(
      graphql(`
        mutation ComplexMergeBUpdateComponentFinal($input: UpdateComponentInput!) {
          updateComponent(input: $input) {
            component {
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
          id: COMPONENT_IDS[1],
          materials: [
            { id: MATERIAL_IDS[1], materialFraction: 0.25 },
            { id: MATERIAL_IDS[2], materialFraction: 0.75 },
          ],
          region: { id: REGION_IDS[1] },
          changeID,
        },
      },
    )
    assertNoErrors(updateComponentFinalRes)

    const updateProcessInterimRes = await gql.send(
      graphql(`
        mutation ComplexMergeBUpdateProcessInterim($input: UpdateProcessInput!) {
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
          id: PROCESS_IDS[1],
          name: 'Complex Merge B Process Interim',
          material: { id: MATERIAL_IDS[0] },
          variant: { id: VARIANT_IDS[1] },
          org: { id: ORG_IDS[0] },
          region: { id: REGION_IDS[0] },
          changeID,
        },
      },
    )
    assertNoErrors(updateProcessInterimRes)

    const updateProcessFinalRes = await gql.send(
      graphql(`
        mutation ComplexMergeBUpdateProcessFinal($input: UpdateProcessInput!) {
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
          id: PROCESS_IDS[1],
          name: 'Complex Merge B Process Final',
          material: { id: MATERIAL_IDS[4] },
          variant: { id: VARIANT_IDS[1] },
          org: { id: ORG_IDS[1] },
          region: { id: REGION_IDS[1] },
          changeID,
        },
      },
    )
    assertNoErrors(updateProcessFinalRes)

    await approveAndMerge(changeID!)

    const variantGraphRes = await gql.send(
      graphql(`
        query ComplexMergeBGetVariant($id: ID!) {
          variant(id: $id) {
            id
            items(first: 20) {
              nodes {
                id
              }
            }
            components(first: 20) {
              nodes {
                component {
                  id
                }
                quantity
                unit
              }
            }
            regions(first: 10) {
              nodes {
                id
              }
            }
          }
        }
      `),
      { id: VARIANT_IDS[1] },
    )
    assertNoErrors(variantGraphRes)
    const graphItemIDs = variantGraphRes.data?.variant?.items?.nodes?.map((n) => n.id) ?? []
    expect(graphItemIDs).toContain(ITEM_IDS[0])
    expect(graphItemIDs).not.toContain(ITEM_IDS[1])
    const graphComponents = variantGraphRes.data?.variant?.components?.nodes ?? []
    expect(graphComponents).toHaveLength(1)
    expect(graphComponents[0].component.id).toBe(COMPONENT_IDS[1])
    expect(Number(graphComponents[0].quantity)).toBeCloseTo(4.2, 5)
    expect(graphComponents[0].unit).toBe('ml')
    const graphRegionIDs = variantGraphRes.data?.variant?.regions?.nodes?.map((r) => r.id) ?? []
    expect(graphRegionIDs).toContain(REGION_IDS[1])

    const em = orm.em.fork()

    const variantEntity = await em.findOne(Variant, { id: VARIANT_IDS[1] } as any, {
      populate: ['region'],
    })
    expect(variantEntity?.region?.id).toBe(REGION_IDS[1])

    const variantItemRows = await em.find(VariantsItems, { variant: VARIANT_IDS[1] } as any, {
      populate: ['item'],
    })
    expect(variantItemRows.map((row) => row.item.id)).toEqual([ITEM_IDS[0]])

    const variantComponentRows = await em.find(
      VariantsComponents,
      { variant: VARIANT_IDS[1] } as any,
      {
        populate: ['component'],
      },
    )
    expect(variantComponentRows).toHaveLength(1)
    expect(variantComponentRows[0].component.id).toBe(COMPONENT_IDS[1])
    expect(Number(variantComponentRows[0].quantity)).toBeCloseTo(4.2, 5)
    expect(variantComponentRows[0].unit).toBe('ml')

    const componentMaterialRows = await em.find(
      ComponentsMaterials,
      { component: COMPONENT_IDS[1] } as any,
      { populate: ['material'] },
    )
    expect(componentMaterialRows).toHaveLength(2)
    const fractions = new Map(
      componentMaterialRows.map((row) => [row.material.id, Number(row.materialFraction)]),
    )
    expect(fractions.get(MATERIAL_IDS[1])).toBeCloseTo(0.25, 5)
    expect(fractions.get(MATERIAL_IDS[2])).toBeCloseTo(0.75, 5)

    const componentEntity = await em.findOne(Component, { id: COMPONENT_IDS[1] } as any, {
      populate: ['region'],
    })
    expect(componentEntity?.region?.id).toBe(REGION_IDS[1])

    const processEntity = await em.findOne(Process, { id: PROCESS_IDS[1] } as any, {
      populate: ['material', 'variant', 'org', 'region'],
    })
    expect(processEntity).toBeDefined()
    expect(processEntity?.name?.en).toBe('Complex Merge B Process Final')
    expect(processEntity?.material?.id).toBe(MATERIAL_IDS[4])
    expect(processEntity?.variant?.id).toBe(VARIANT_IDS[1])
    expect(processEntity?.org?.id).toBe(ORG_IDS[1])
    expect(processEntity?.region?.id).toBe(REGION_IDS[1])
  })

  // Sequence C:
  // 1) Create item/component/variant/org inside a new change.
  // 2) Update both existing and newly created entities to reference those change-created entities.
  // 3) Cover pivot refs (variant-items, variant-components, variant-orgs, component-materials) and single refs.
  // 4) Merge and verify cross-edit references resolve correctly with persisted pivot payload fields.
  test('Sequence C: CREATE edits then UPDATE edits reference those created entities before merge', async () => {
    const createItemRes = await gql.send(
      graphql(`
        mutation ComplexMergeCCreateItem($input: CreateItemInput!) {
          createItem(input: $input) {
            item {
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
          name: 'Complex Merge C Item',
          change: { title: 'Complex merge sequence C', status: ChangeStatus.Draft },
        },
      },
    )
    assertNoErrors(createItemRes)
    const changeID = createItemRes.data?.createItem?.change?.id as string | undefined
    const createdItemID = createItemRes.data?.createItem?.item?.id as string | undefined
    expect(changeID).toBeDefined()
    expect(createdItemID).toBeDefined()

    const createComponentRes = await gql.send(
      graphql(`
        mutation ComplexMergeCCreateComponent($input: CreateComponentInput!) {
          createComponent(input: $input) {
            component {
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
          name: 'Complex Merge C Component',
          primaryMaterial: { id: MATERIAL_IDS[0] },
          changeID,
        },
      },
    )
    assertNoErrors(createComponentRes)
    let createdComponentID = createComponentRes.data?.createComponent?.component?.id as
      | string
      | undefined
    if (!createdComponentID) {
      const em = orm.em.fork()
      const found = await em.findOne(Component, {
        name: { en: 'Complex Merge E Component' },
      } as any)
      createdComponentID = found?.id
    }
    expect(createdComponentID).toBeDefined()
    expect(createComponentRes.data?.createComponent?.change?.id).toBe(changeID)

    const createVariantRes = await gql.send(
      graphql(`
        mutation ComplexMergeCCreateVariant($input: CreateVariantInput!) {
          createVariant(input: $input) {
            variant {
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
          name: 'Complex Merge C Variant',
          changeID,
        },
      },
    )
    assertNoErrors(createVariantRes)
    const createdVariantID = createVariantRes.data?.createVariant?.variant?.id as string | undefined
    expect(createdVariantID).toBeDefined()
    expect(createVariantRes.data?.createVariant?.change?.id).toBe(changeID)

    const createOrgRes = await gql.send(
      graphql(`
        mutation ComplexMergeCCreateOrg($input: CreateOrgInput!) {
          createOrg(input: $input) {
            org {
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
          name: 'Complex Merge C Org',
          slug: 'complex-merge-c-org',
          changeID,
        },
      },
    )
    assertNoErrors(createOrgRes)
    const createdOrgID = createOrgRes.data?.createOrg?.org?.id as string | undefined
    expect(createdOrgID).toBeDefined()
    expect(createOrgRes.data?.createOrg?.change?.id).toBe(changeID)

    const updateCreatedVariantRes = await gql.send(
      graphql(`
        mutation ComplexMergeCUpdateCreatedVariantRefs($input: UpdateVariantInput!) {
          updateVariant(input: $input) {
            variant {
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
          id: createdVariantID!,
          items: [{ id: createdItemID! }],
          components: [{ id: createdComponentID!, quantity: 4.4, unit: 'ml' }],
          addOrgs: [{ id: createdOrgID! }],
          region: { id: REGION_IDS[0] },
          changeID,
        },
      },
    )
    assertNoErrors(updateCreatedVariantRes)
    expect(updateCreatedVariantRes.data?.updateVariant?.change?.id).toBe(changeID)

    const updateVariantRes = await gql.send(
      graphql(`
        mutation ComplexMergeCUpdateVariantRefs($input: UpdateVariantInput!) {
          updateVariant(input: $input) {
            variant {
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
          id: VARIANT_IDS[1],
          items: [{ id: createdItemID! }],
          components: [{ id: createdComponentID!, quantity: 9.5, unit: 'g' }],
          region: { id: REGION_IDS[0] },
          changeID,
        },
      },
    )
    assertNoErrors(updateVariantRes)
    expect(updateVariantRes.data?.updateVariant?.change?.id).toBe(changeID)

    const updateProcessRes = await gql.send(
      graphql(`
        mutation ComplexMergeCUpdateProcessRefs($input: UpdateProcessInput!) {
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
          id: PROCESS_IDS[0],
          name: 'Complex Merge C Process',
          material: { id: MATERIAL_IDS[2] },
          variant: { id: VARIANT_IDS[1] },
          org: { id: ORG_IDS[0] },
          region: { id: REGION_IDS[0] },
          changeID,
        },
      },
    )
    assertNoErrors(updateProcessRes)
    expect(updateProcessRes.data?.updateProcess?.change?.id).toBe(changeID)

    const updateCreatedComponentRes = await gql.send(
      graphql(`
        mutation ComplexMergeCUpdateCreatedComponent($input: UpdateComponentInput!) {
          updateComponent(input: $input) {
            component {
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
          id: createdComponentID!,
          materials: [
            { id: MATERIAL_IDS[1], materialFraction: 0.2 },
            { id: MATERIAL_IDS[3], materialFraction: 0.8 },
          ],
          region: { id: REGION_IDS[0] },
          changeID,
        },
      },
    )
    assertNoErrors(updateCreatedComponentRes)
    expect(updateCreatedComponentRes.data?.updateComponent?.change?.id).toBe(changeID)

    await approveAndMerge(changeID!)

    const em = orm.em.fork()

    const processEntity = await em.findOne(Process, { id: PROCESS_IDS[0] } as any, {
      populate: ['material', 'variant', 'org', 'region'],
    })
    expect(processEntity?.name?.en).toBe('Complex Merge C Process')
    expect(processEntity?.material?.id).toBe(MATERIAL_IDS[2])
    expect(processEntity?.variant?.id).toBe(VARIANT_IDS[1])
    expect(processEntity?.org?.id).toBe(ORG_IDS[0])
    expect(processEntity?.region?.id).toBe(REGION_IDS[0])

    const variantItemRows = await em.find(VariantsItems, { variant: VARIANT_IDS[1] } as any, {
      populate: ['item'],
    })
    expect(variantItemRows.map((row) => row.item.id)).toContain(createdItemID)

    const variantComponentRows = await em.find(
      VariantsComponents,
      { variant: VARIANT_IDS[1] } as any,
      { populate: ['component'] },
    )
    const createdComponentLink = variantComponentRows.find(
      (row) => row.component.id === createdComponentID,
    )
    expect(createdComponentLink).toBeDefined()
    expect(Number(createdComponentLink?.quantity)).toBeCloseTo(9.5, 5)
    expect(createdComponentLink?.unit).toBe('g')

    const createdVariantItemRows = await em.find(
      VariantsItems,
      { variant: createdVariantID! } as any,
      { populate: ['item'] },
    )
    expect(createdVariantItemRows.map((row) => row.item.id)).toContain(createdItemID)

    const createdVariantComponentRows = await em.find(
      VariantsComponents,
      { variant: createdVariantID! } as any,
      { populate: ['component'] },
    )
    const createdVariantComponentLink = createdVariantComponentRows.find(
      (row) => row.component.id === createdComponentID,
    )
    expect(createdVariantComponentLink).toBeDefined()
    expect(Number(createdVariantComponentLink?.quantity)).toBeCloseTo(4.4, 5)
    expect(createdVariantComponentLink?.unit).toBe('ml')

    const createdVariantOrgRows = await em.find(
      VariantsOrgs,
      { variant: createdVariantID! } as any,
      {
        populate: ['org'],
      },
    )
    expect(createdVariantOrgRows.map((row) => row.org.id)).toContain(createdOrgID)

    const componentMaterialRows = await em.find(
      ComponentsMaterials,
      { component: createdComponentID! } as any,
      { populate: ['material'] },
    )
    expect(componentMaterialRows).toHaveLength(2)
    const fractions = new Map(
      componentMaterialRows.map((row) => [row.material.id, Number(row.materialFraction)]),
    )
    expect(fractions.get(MATERIAL_IDS[1])).toBeCloseTo(0.2, 5)
    expect(fractions.get(MATERIAL_IDS[3])).toBeCloseTo(0.8, 5)
  })

  // Sequence D:
  // 1) Start with multiple CREATE edits (variant/org/item/component).
  // 2) Apply UPDATE edits that cross-reference these created entities from both existing and created records.
  // 3) Churn pivot rows with metadata updates (variant-components quantity/unit, component-material fractions).
  // 4) Merge and assert created-to-created and existing-to-created relations are applied atomically.
  test('Sequence D: multiple CREATE edits with cross-entity UPDATE references and pivot metadata churn', async () => {
    const createVariantRes = await gql.send(
      graphql(`
        mutation ComplexMergeDCreateVariant($input: CreateVariantInput!) {
          createVariant(input: $input) {
            variant {
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
          name: 'Complex Merge D Variant',
          change: { title: 'Complex merge sequence D', status: ChangeStatus.Draft },
        },
      },
    )
    assertNoErrors(createVariantRes)
    const changeID = createVariantRes.data?.createVariant?.change?.id as string | undefined
    const createdVariantID = createVariantRes.data?.createVariant?.variant?.id as string | undefined
    expect(changeID).toBeDefined()
    expect(createdVariantID).toBeDefined()

    const createOrgRes = await gql.send(
      graphql(`
        mutation ComplexMergeDCreateOrg($input: CreateOrgInput!) {
          createOrg(input: $input) {
            org {
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
          name: 'Complex Merge D Org',
          slug: 'complex-merge-d-org',
          changeID,
        },
      },
    )
    assertNoErrors(createOrgRes)
    const createdOrgID = createOrgRes.data?.createOrg?.org?.id as string | undefined
    expect(createdOrgID).toBeDefined()
    expect(createOrgRes.data?.createOrg?.change?.id).toBe(changeID)

    const createItemRes = await gql.send(
      graphql(`
        mutation ComplexMergeDCreateItem($input: CreateItemInput!) {
          createItem(input: $input) {
            item {
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
          name: 'Complex Merge D Item',
          changeID,
        },
      },
    )
    assertNoErrors(createItemRes)
    const createdItemID = createItemRes.data?.createItem?.item?.id as string | undefined
    expect(createdItemID).toBeDefined()
    expect(createItemRes.data?.createItem?.change?.id).toBe(changeID)

    const createComponentRes = await gql.send(
      graphql(`
        mutation ComplexMergeDCreateComponent($input: CreateComponentInput!) {
          createComponent(input: $input) {
            component {
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
          name: 'Complex Merge D Component',
          primaryMaterial: { id: MATERIAL_IDS[0] },
          changeID,
        },
      },
    )
    assertNoErrors(createComponentRes)
    const createdComponentID = createComponentRes.data?.createComponent?.component?.id as
      | string
      | undefined
    expect(createdComponentID).toBeDefined()
    expect(createComponentRes.data?.createComponent?.change?.id).toBe(changeID)

    const updateCreatedVariantRes = await gql.send(
      graphql(`
        mutation ComplexMergeDUpdateCreatedVariant($input: UpdateVariantInput!) {
          updateVariant(input: $input) {
            variant {
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
          id: createdVariantID!,
          items: [{ id: createdItemID! }],
          components: [{ id: createdComponentID!, quantity: 1.25, unit: 'ml' }],
          addOrgs: [{ id: createdOrgID! }],
          region: { id: REGION_IDS[1] },
          changeID,
        },
      },
    )
    assertNoErrors(updateCreatedVariantRes)
    expect(updateCreatedVariantRes.data?.updateVariant?.change?.id).toBe(changeID)

    const updateProcessRes = await gql.send(
      graphql(`
        mutation ComplexMergeDUpdateProcessRefs($input: UpdateProcessInput!) {
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
          id: PROCESS_IDS[1],
          name: 'Complex Merge D Process',
          material: { id: MATERIAL_IDS[4] },
          variant: { id: VARIANT_IDS[0] },
          org: { id: ORG_IDS[1] },
          region: { id: REGION_IDS[1] },
          changeID,
        },
      },
    )
    assertNoErrors(updateProcessRes)
    expect(updateProcessRes.data?.updateProcess?.change?.id).toBe(changeID)

    const updateVariantSetRes = await gql.send(
      graphql(`
        mutation ComplexMergeDUpdateVariantSetRefs($input: UpdateVariantInput!) {
          updateVariant(input: $input) {
            variant {
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
          id: VARIANT_IDS[0],
          items: [{ id: createdItemID! }, { id: ITEM_IDS[0] }],
          components: [
            { id: createdComponentID!, quantity: 2.5, unit: 'g' },
            { id: COMPONENT_IDS[0], quantity: 1.5, unit: 'ml' },
          ],
          region: { id: REGION_IDS[0] },
          changeID,
        },
      },
    )
    assertNoErrors(updateVariantSetRes)
    expect(updateVariantSetRes.data?.updateVariant?.change?.id).toBe(changeID)

    const updateVariantChurnRes = await gql.send(
      graphql(`
        mutation ComplexMergeDUpdateVariantChurnRefs($input: UpdateVariantInput!) {
          updateVariant(input: $input) {
            variant {
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
          id: VARIANT_IDS[0],
          removeItems: [ITEM_IDS[0]],
          addItems: [{ id: createdItemID! }],
          removeComponents: [COMPONENT_IDS[0]],
          addComponents: [{ id: createdComponentID!, quantity: 6.6, unit: 'g' }],
          region: { id: REGION_IDS[1] },
          changeID,
        },
      },
    )
    assertNoErrors(updateVariantChurnRes)
    expect(updateVariantChurnRes.data?.updateVariant?.change?.id).toBe(changeID)

    const updateCreatedComponentRes = await gql.send(
      graphql(`
        mutation ComplexMergeDUpdateCreatedComponent($input: UpdateComponentInput!) {
          updateComponent(input: $input) {
            component {
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
          id: createdComponentID!,
          materials: [
            { id: MATERIAL_IDS[2], materialFraction: 0.35 },
            { id: MATERIAL_IDS[3], materialFraction: 0.65 },
          ],
          region: { id: REGION_IDS[1] },
          changeID,
        },
      },
    )
    assertNoErrors(updateCreatedComponentRes)
    expect(updateCreatedComponentRes.data?.updateComponent?.change?.id).toBe(changeID)

    await approveAndMerge(changeID!)

    const em = orm.em.fork()

    const processEntity = await em.findOne(Process, { id: PROCESS_IDS[1] } as any, {
      populate: ['material', 'variant', 'org', 'region'],
    })
    expect(processEntity?.name?.en).toBe('Complex Merge D Process')
    expect(processEntity?.material?.id).toBe(MATERIAL_IDS[4])
    expect(processEntity?.variant?.id).toBe(VARIANT_IDS[0])
    expect(processEntity?.org?.id).toBe(ORG_IDS[1])
    expect(processEntity?.region?.id).toBe(REGION_IDS[1])

    const variantItemRows = await em.find(VariantsItems, { variant: VARIANT_IDS[0] } as any, {
      populate: ['item'],
    })
    expect(variantItemRows.map((row) => row.item.id)).toContain(createdItemID)
    expect(variantItemRows.map((row) => row.item.id)).not.toContain(ITEM_IDS[0])

    const variantComponentRows = await em.find(
      VariantsComponents,
      { variant: VARIANT_IDS[0] } as any,
      { populate: ['component'] },
    )
    const createdComponentLink = variantComponentRows.find(
      (row) => row.component.id === createdComponentID,
    )
    expect(createdComponentLink).toBeDefined()
    expect(Number(createdComponentLink?.quantity)).toBeCloseTo(6.6, 5)
    expect(createdComponentLink?.unit).toBe('g')
    expect(variantComponentRows.some((row) => row.component.id === COMPONENT_IDS[0])).toBe(false)

    const componentMaterialRows = await em.find(
      ComponentsMaterials,
      { component: createdComponentID! } as any,
      { populate: ['material'] },
    )
    expect(componentMaterialRows).toHaveLength(2)
    const fractions = new Map(
      componentMaterialRows.map((row) => [row.material.id, Number(row.materialFraction)]),
    )
    expect(fractions.get(MATERIAL_IDS[2])).toBeCloseTo(0.35, 5)
    expect(fractions.get(MATERIAL_IDS[3])).toBeCloseTo(0.65, 5)

    const createdVariantItemRows = await em.find(
      VariantsItems,
      { variant: createdVariantID! } as any,
      { populate: ['item'] },
    )
    expect(createdVariantItemRows.map((row) => row.item.id)).toContain(createdItemID)

    const createdVariantComponentRows = await em.find(
      VariantsComponents,
      { variant: createdVariantID! } as any,
      { populate: ['component'] },
    )
    const createdVariantComponentLink = createdVariantComponentRows.find(
      (row) => row.component.id === createdComponentID,
    )
    expect(createdVariantComponentLink).toBeDefined()
    expect(Number(createdVariantComponentLink?.quantity)).toBeCloseTo(1.25, 5)
    expect(createdVariantComponentLink?.unit).toBe('ml')

    const createdVariantOrgRows = await em.find(
      VariantsOrgs,
      { variant: createdVariantID! } as any,
      {
        populate: ['org'],
      },
    )
    expect(createdVariantOrgRows.map((row) => row.org.id)).toContain(createdOrgID)
  })

  // Sequence E:
  // 1) Baseline an existing process to reference a variant that has multiple pivot links.
  // 2) In a change, stage delete for that variant.
  // 3) Merge and verify cleanup: parent row deleted, pivot rows removed, and process variant ref cleared.
  test('Sequence E: delete edit removes refs cleanly (including pivot refs) across multiple entities', async () => {
    const baselineProcessRes = await gql.send(
      graphql(`
        mutation ComplexMergeESetBaselineProcess($input: UpdateProcessInput!) {
          updateProcess(input: $input) {
            process {
              id
            }
          }
        }
      `),
      {
        input: {
          id: PROCESS_IDS[0],
          name: 'Complex Merge E Baseline',
          material: { id: MATERIAL_IDS[0] },
          variant: { id: VARIANT_IDS[4] },
          org: { id: ORG_IDS[0] },
          region: { id: REGION_IDS[0] },
        },
      },
    )
    assertNoErrors(baselineProcessRes)

    const preEm = orm.em.fork()
    const preVariantItems = await preEm.find(VariantsItems, { variant: VARIANT_IDS[4] } as any)
    const preVariantComponents = await preEm.find(VariantsComponents, {
      variant: VARIANT_IDS[4],
    } as any)
    expect(preVariantItems.length).toBeGreaterThan(0)
    expect(preVariantComponents.length).toBeGreaterThan(0)
    const preProcess = await preEm.findOne(Process, { id: PROCESS_IDS[0] } as any, {
      populate: ['variant'],
    })
    expect(preProcess?.variant?.id).toBe(VARIANT_IDS[4])

    const seedChangeRes = await gql.send(
      graphql(`
        mutation ComplexMergeESeedChange($input: UpdateVariantInput!) {
          updateVariant(input: $input) {
            change {
              id
            }
            variant {
              id
            }
          }
        }
      `),
      {
        input: {
          id: VARIANT_IDS[4],
          name: 'Complex Merge E Seed',
          change: { title: 'Complex merge sequence E', status: ChangeStatus.Draft },
        },
      },
    )
    assertNoErrors(seedChangeRes)
    const changeID = seedChangeRes.data?.updateVariant?.change?.id as string | undefined
    expect(changeID).toBeDefined()

    const deleteVariantRes = await gql.send(
      graphql(`
        mutation ComplexMergeEDeleteVariant($input: DeleteInput!) {
          deleteVariant(input: $input) {
            success
            id
          }
        }
      `),
      {
        input: {
          id: VARIANT_IDS[4],
          changeID,
        },
      },
    )
    assertNoErrors(deleteVariantRes)
    expect(deleteVariantRes.data?.deleteVariant?.success).toBe(true)
    expect(deleteVariantRes.data?.deleteVariant?.id).toBe(VARIANT_IDS[4])

    await approveAndMerge(changeID!)

    const em = orm.em.fork()
    const deletedVariant = await em.findOne(Variant, { id: VARIANT_IDS[4] } as any)
    expect(deletedVariant).toBeNull()

    const processAfterMerge = await em.findOne(Process, { id: PROCESS_IDS[0] } as any, {
      populate: ['variant', 'org', 'material', 'region'],
    })
    expect(processAfterMerge?.name?.en).toBe('Complex Merge E Baseline')
    expect(processAfterMerge?.variant).toBeNull()

    const pivotItemRows = await em.find(VariantsItems, { variant: VARIANT_IDS[4] } as any)
    expect(pivotItemRows).toHaveLength(0)
    const pivotComponentRows = await em.find(VariantsComponents, { variant: VARIANT_IDS[4] } as any)
    expect(pivotComponentRows).toHaveLength(0)
    const pivotOrgRows = await em.find(VariantsOrgs, { variant: VARIANT_IDS[4] } as any)
    expect(pivotOrgRows).toHaveLength(0)
  })

  // Sequence F:
  // 1) In a single change, stage an update that points process.variant to a target variant.
  // 2) Attempt to stage delete for that same target variant in the same change.
  // 3) Verify delete is rejected due to an intra-change reference conflict.
  test('Sequence F: delete with change fails when another edit in same change references target', async () => {
    const updateProcessRes = await gql.send(
      graphql(`
        mutation ComplexMergeFUpdateProcessToTarget($input: UpdateProcessInput!) {
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
          id: PROCESS_IDS[1],
          name: 'Complex Merge F Process',
          material: { id: MATERIAL_IDS[1] },
          variant: { id: VARIANT_IDS[2] },
          org: { id: ORG_IDS[1] },
          region: { id: REGION_IDS[1] },
          change: { title: 'Complex merge sequence F', status: ChangeStatus.Draft },
        },
      },
    )
    assertNoErrors(updateProcessRes)
    const changeID = updateProcessRes.data?.updateProcess?.change?.id as string | undefined
    expect(changeID).toBeDefined()

    const deleteVariantRes = await gql.send(
      graphql(`
        mutation ComplexMergeFDeleteVariant($input: DeleteInput!) {
          deleteVariant(input: $input) {
            success
            id
          }
        }
      `),
      {
        input: {
          id: VARIANT_IDS[2],
          changeID,
        },
      },
    )
    expect(deleteVariantRes.errors).toBeDefined()
    expect(deleteVariantRes.errors?.[0]?.extensions?.code).toBe('BAD_REQUEST')
    expect(deleteVariantRes.errors?.[0]?.message).toContain('Cannot delete Variant')
    expect(deleteVariantRes.errors?.[0]?.message).toContain('references it')
  })

  // Sequence G:
  // 1) Stage delete for a variant inside a change.
  // 2) Attempt update and create mutations in that same change that reference the pending-delete variant.
  // 3) Verify both mutations fail with pending-deletion guard errors.
  test('Sequence G: create/update in change fails when referencing entity pending deletion', async () => {
    const seedChangeRes = await gql.send(
      graphql(`
        mutation ComplexMergeGSeedChange($input: UpdateVariantInput!) {
          updateVariant(input: $input) {
            change {
              id
            }
            variant {
              id
            }
          }
        }
      `),
      {
        input: {
          id: VARIANT_IDS[3],
          name: 'Complex Merge G Seed',
          change: { title: 'Complex merge sequence G', status: ChangeStatus.Draft },
        },
      },
    )
    assertNoErrors(seedChangeRes)
    const changeID = seedChangeRes.data?.updateVariant?.change?.id as string | undefined
    expect(changeID).toBeDefined()

    const deleteVariantRes = await gql.send(
      graphql(`
        mutation ComplexMergeGDeleteVariant($input: DeleteInput!) {
          deleteVariant(input: $input) {
            success
            id
          }
        }
      `),
      {
        input: {
          id: VARIANT_IDS[3],
          changeID,
        },
      },
    )
    assertNoErrors(deleteVariantRes)
    expect(deleteVariantRes.data?.deleteVariant?.success).toBe(true)

    const updateProcessRes = await gql.send(
      graphql(`
        mutation ComplexMergeGUpdateProcessToDeleted($input: UpdateProcessInput!) {
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
          id: PROCESS_IDS[2],
          name: 'Complex Merge G Process',
          material: { id: MATERIAL_IDS[2] },
          variant: { id: VARIANT_IDS[3] },
          org: { id: ORG_IDS[0] },
          region: { id: REGION_IDS[0] },
          changeID,
        },
      },
    )
    expect(updateProcessRes.errors).toBeDefined()
    expect(updateProcessRes.errors?.[0]?.extensions?.code).toBe('BAD_REQUEST')
    expect(updateProcessRes.errors?.[0]?.message).toContain('pending deletion')

    const createProcessRes = await gql.send(
      graphql(`
        mutation ComplexMergeGCreateProcessToDeleted($input: CreateProcessInput!) {
          createProcess(input: $input) {
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
          name: 'Complex Merge G New Process',
          intent: 'RECYCLE',
          material: { id: MATERIAL_IDS[2] },
          variant: { id: VARIANT_IDS[3] },
          org: { id: ORG_IDS[1] },
          region: { id: REGION_IDS[1] },
          changeID,
        },
      },
    )
    expect(createProcessRes.errors).toBeDefined()
    expect(createProcessRes.errors?.[0]?.extensions?.code).toBe('BAD_REQUEST')
    expect(createProcessRes.errors?.[0]?.message).toContain('pending deletion')
  })
})
