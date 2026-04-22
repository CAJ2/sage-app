import { BaseEntity, EntityName } from '@mikro-orm/postgresql'
import { z } from 'zod/v4'

import { EditModelType } from '@src/changes/change.enum'
import { BadRequestErr } from '@src/common/exceptions'
import { Component as ComponentEntity, ComponentsMaterials } from '@src/process/component.entity'
import { Component as ComponentModel } from '@src/process/component.model'
import { ComponentIDSchema, ComponentMaterialInputSchema } from '@src/process/component.schema'
import { Material as MaterialEntity } from '@src/process/material.entity'
import { MaterialIDSchema } from '@src/process/material.model'
import { Process as ProcessEntity } from '@src/process/process.entity'
import { Process as ProcessModel } from '@src/process/process.model'
import { ProcessIDSchema } from '@src/process/process.schema'
import {
  Program as ProgramEntity,
  ProgramsOrgs,
  ProgramsProcesses,
} from '@src/process/program.entity'
import { Program as ProgramModel } from '@src/process/program.model'
import { ProgramOrgsInputSchema } from '@src/process/program.schema'
import { Category as CategoryEntity } from '@src/product/category.entity'
import { Category as CategoryModel } from '@src/product/category.model'
import { CategoryIDSchema } from '@src/product/category.schema'
import { Item as ItemEntity, ItemsCategories } from '@src/product/item.entity'
import { Item as ItemModel } from '@src/product/item.model'
import { ItemIDSchema } from '@src/product/item.schema'
import {
  Variant as VariantEntity,
  VariantsComponents,
  VariantsItems,
  VariantsOrgs,
} from '@src/product/variant.entity'
import { Variant as VariantModel } from '@src/product/variant.model'
import { VariantComponentsInputSchema } from '@src/product/variant.schema'
import { Org as OrgEntity } from '@src/users/org.entity'
import { Org as OrgModel } from '@src/users/org.model'
import { OrgIDSchema } from '@src/users/org.schema'

type EditEntity = BaseEntity & { id: string }
type EntityClass<T extends EditEntity = EditEntity> = new () => T
type RefEditModel =
  | CategoryModel
  | ItemModel
  | VariantModel
  | ComponentModel
  | ProcessModel
  | ProgramModel
  | OrgModel
type ModelClass<T extends RefEditModel = RefEditModel> = new () => T

type RefEditCardinality = 'many' | 'one'

export type RefEditDefinition<
  TRoot extends EditEntity = EditEntity,
  TTarget extends EditEntity = EditEntity,
  TPivot extends object = object,
> = {
  model: EditModelType
  refModel: EditModelType
  refField: string
  entity: EntityClass<TRoot>
  outputModel: ModelClass
  targetEntity: EntityClass<TTarget>
  targetIDSchema: z.ZodType<string>
  cardinality: RefEditCardinality
  pivotEntity: EntityName<TPivot>
  pivotCollection: string
  populate: string[]
  addInputSchema?: z.ZodObject<any>
}

const VariantComponentAddInputSchema = VariantComponentsInputSchema.omit({ id: true })
const ProgramOrgAddInputSchema = ProgramOrgsInputSchema.omit({ id: true })
const ComponentMaterialAddInputSchema = ComponentMaterialInputSchema.omit({ id: true })

export const REF_EDIT_DEFINITIONS: RefEditDefinition[] = [
  {
    model: EditModelType.Item,
    refModel: EditModelType.Category,
    refField: 'categories',
    entity: ItemEntity,
    outputModel: ItemModel,
    targetEntity: CategoryEntity,
    targetIDSchema: CategoryIDSchema,
    cardinality: 'many',
    pivotEntity: ItemsCategories,
    pivotCollection: 'itemCategories',
    populate: ['itemCategories'],
  },
  {
    model: EditModelType.Variant,
    refModel: EditModelType.Item,
    refField: 'items',
    entity: VariantEntity,
    outputModel: VariantModel,
    targetEntity: ItemEntity,
    targetIDSchema: ItemIDSchema,
    cardinality: 'many',
    pivotEntity: VariantsItems,
    pivotCollection: 'variantItems',
    populate: ['variantItems'],
  },
  {
    model: EditModelType.Variant,
    refModel: EditModelType.Org,
    refField: 'orgs',
    entity: VariantEntity,
    outputModel: VariantModel,
    targetEntity: OrgEntity,
    targetIDSchema: OrgIDSchema,
    cardinality: 'many',
    pivotEntity: VariantsOrgs,
    pivotCollection: 'variantOrgs',
    populate: ['variantOrgs'],
  },
  {
    model: EditModelType.Variant,
    refModel: EditModelType.Component,
    refField: 'components',
    entity: VariantEntity,
    outputModel: VariantModel,
    targetEntity: ComponentEntity,
    targetIDSchema: ComponentIDSchema,
    cardinality: 'many',
    pivotEntity: VariantsComponents,
    pivotCollection: 'variantComponents',
    populate: ['variantComponents'],
    addInputSchema: VariantComponentAddInputSchema,
  },
  {
    model: EditModelType.Component,
    refModel: EditModelType.Material,
    refField: 'materials',
    entity: ComponentEntity,
    outputModel: ComponentModel,
    targetEntity: MaterialEntity,
    targetIDSchema: MaterialIDSchema,
    cardinality: 'many',
    pivotEntity: ComponentsMaterials,
    pivotCollection: 'componentMaterials',
    populate: ['componentMaterials'],
    addInputSchema: ComponentMaterialAddInputSchema,
  },
  {
    model: EditModelType.Program,
    refModel: EditModelType.Org,
    refField: 'orgs',
    entity: ProgramEntity,
    outputModel: ProgramModel,
    targetEntity: OrgEntity,
    targetIDSchema: OrgIDSchema,
    cardinality: 'many',
    pivotEntity: ProgramsOrgs,
    pivotCollection: 'programOrgs',
    populate: ['programOrgs'],
    addInputSchema: ProgramOrgAddInputSchema,
  },
  {
    model: EditModelType.Program,
    refModel: EditModelType.Process,
    refField: 'processes',
    entity: ProgramEntity,
    outputModel: ProgramModel,
    targetEntity: ProcessEntity,
    targetIDSchema: ProcessIDSchema,
    cardinality: 'many',
    pivotEntity: ProgramsProcesses,
    pivotCollection: 'programProcesses',
    populate: ['programProcesses'],
  },
]

export function resolveRefEditDefinition(
  model: EditModelType,
  refModel: EditModelType,
  refField?: string,
): RefEditDefinition {
  const pairMatches = REF_EDIT_DEFINITIONS.filter(
    (definition) => definition.model === model && definition.refModel === refModel,
  )

  if (pairMatches.length === 0) {
    throw BadRequestErr(`Unsupported reference from ${model} to ${refModel}`)
  }

  if (!refField) {
    if (pairMatches.length === 1) {
      return pairMatches[0]
    }
    throw BadRequestErr(
      `Reference from ${model} to ${refModel} is ambiguous. Specify refField: ${pairMatches
        .map((definition) => definition.refField)
        .join(', ')}`,
    )
  }

  const fieldMatch = pairMatches.find((definition) => definition.refField === refField)
  if (!fieldMatch) {
    throw BadRequestErr(`Unsupported reference field ${refField} from ${model} to ${refModel}`)
  }
  return fieldMatch
}

export function isPluralRefEditDefinition(definition: RefEditDefinition): boolean {
  return definition.cardinality === 'many'
}
