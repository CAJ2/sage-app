import { ArgsType, Field, Float, ID, InputType, ObjectType } from '@nestjs/graphql'
import { Transform } from 'class-transformer'
import { IsOptional, MaxLength } from 'class-validator'
import { JSONObjectResolver } from 'graphql-scalars'
import { DateTime } from 'luxon'
import { z } from 'zod/v4'

import { ChangeInputWithLang } from '@src/changes/change-ext.model'
import { Change } from '@src/changes/change.model'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { translate, TrArraySchema } from '@src/common/i18n'
import { type JSONObject, ZJSONObject } from '@src/common/z.schema'
import { Region } from '@src/geo/region.model'
import { IDCreatedUpdated, registerModel, TranslatedInput } from '@src/graphql/base.model'
import { Named } from '@src/graphql/interfaces.model'
import { Paginated, PaginationBasicArgs } from '@src/graphql/paginated'

import {
  Component as ComponentEntity,
  type ComponentPhysical,
  ComponentPhysicalSchema,
  type ComponentVisual,
  ComponentVisualSchema,
} from './component.entity'
import { Material } from './material.model'
import { RecyclingStream, StreamContext, StreamScore } from './stream.model'
import { Tag } from './tag.model'

@ObjectType({ description: 'The fraction of a specific material within a component' })
export class ComponentMaterial {
  @Field(() => Material)
  material!: Material & {}

  @Field(() => Float, { nullable: true, description: 'Fraction of this material in the component (0–1)' })
  materialFraction?: number
}

@ObjectType({ description: 'A recycling option for a component in a specific recycling stream' })
export class ComponentRecycle {
  @Field(() => RecyclingStream, { nullable: true })
  stream?: RecyclingStream & {}

  @Field(() => StreamContext, { nullable: true })
  context?: StreamContext & {}
}

@ObjectType({
  implements: () => [Named],
  description: 'A physical component of a product variant, made of one or more materials',
})
export class Component extends IDCreatedUpdated<ComponentEntity> implements Named {
  @Field(() => String, { nullable: true })
  @Transform(translate)
  @MaxLength(1024)
  name?: string

  @Field(() => String, { nullable: true })
  @Transform(translate)
  desc?: string

  @Field(() => String, { nullable: true })
  @Transform(({ value }) => value.image)
  imageURL?: string

  @Field(() => Material, { description: 'The primary material this component is made of' })
  primaryMaterial!: Material & {}

  @Field(() => [ComponentMaterial], { description: 'All materials in this component with their fractions' })
  materials: ComponentMaterial[] = []

  @Field(() => [Tag])
  tags!: Tag[]

  @Field(() => Region, { nullable: true, description: 'The geographic region this component\'s recycling data applies to' })
  region?: Region & {}

  @Field(() => [ComponentRecycle], { nullable: true, description: 'Available recycling options for this component by stream' })
  recycle?: ComponentRecycle[]

  @Field(() => StreamScore, { nullable: true, description: 'Aggregated recyclability score for this component' })
  recycleScore?: StreamScore

  @Field(() => [ComponentHistory], { description: 'Audit history of changes to this component' })
  history: ComponentHistory[] = []

  transform(entity: ComponentEntity) {
    this.imageURL = entity.visual?.image
  }
}
registerModel('Component', Component)

@ObjectType()
export class ComponentHistory {
  @Field(() => String)
  componentID!: string

  @Field(() => LuxonDateTimeResolver)
  datetime!: DateTime

  @Field(() => String, { nullable: true })
  original?: string

  @Field(() => String, { nullable: true })
  changes?: string
}

@ObjectType()
export class ComponentsPage extends Paginated(Component) {}

@ArgsType()
export class ComponentsArgs extends PaginationBasicArgs {
  static schema = PaginationBasicArgs.schema.extend({
    withChange: z.nanoid().optional(),
    regionID: z.string().optional(),
  })

  @Field(() => ID, { nullable: true })
  withChange?: string

  @Field(() => ID, { nullable: true })
  regionID?: string
}

@ArgsType()
export class ComponentRecycleArgs {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  regionID?: string
}

@InputType()
export class ComponentMaterialInput {
  static schema = z.object({
    id: z.nanoid(),
    materialFraction: z.number().min(0.001).max(1).optional(),
  })

  @Field(() => ID)
  id!: string

  @Field(() => Float, { nullable: true, description: 'Fraction of this material in the component (0–1)' })
  materialFraction?: number
}

@InputType()
export class ComponentTagsInput {
  static schema = z.object({
    id: z.nanoid(),
    meta: ZJSONObject.optional(),
  })

  @Field(() => ID)
  id!: string

  @Field(() => JSONObjectResolver, { nullable: true })
  meta?: JSONObject
}

@InputType()
export class ComponentRegionInput {
  static schema = z.object({
    id: z.string().startsWith('wof_'),
  })

  @Field(() => ID)
  id!: string
}

@InputType()
export class CreateComponentInput extends ChangeInputWithLang {
  static schema = ChangeInputWithLang.schema.extend({
    name: z.string().max(1024).optional(),
    nameTr: TrArraySchema,
    desc: z.string().max(100_000).optional(),
    descTr: TrArraySchema,
    imageURL: z.string().optional(),
    visual: ComponentVisualSchema.optional(),
    physical: ComponentPhysicalSchema.optional(),
    primaryMaterial: ComponentMaterialInput.schema,
    materials: z.array(ComponentMaterialInput.schema).optional(),
    tags: z.array(ComponentTagsInput.schema).optional(),
    region: ComponentRegionInput.schema.optional(),
  })

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => [TranslatedInput], { nullable: true })
  nameTr?: TranslatedInput[]

  @Field(() => String, { nullable: true })
  desc?: string

  @Field(() => [TranslatedInput], { nullable: true })
  descTr?: TranslatedInput[]

  @Field(() => String, { nullable: true })
  imageURL?: string

  @Field(() => JSONObjectResolver, { nullable: true })
  visual?: ComponentVisual

  @Field(() => JSONObjectResolver, { nullable: true })
  physical?: ComponentPhysical

  @Field(() => ComponentMaterialInput, { nullable: true })
  primaryMaterial?: ComponentMaterialInput

  @Field(() => [ComponentMaterialInput], { nullable: true })
  materials?: ComponentMaterialInput[]

  @Field(() => [ComponentTagsInput], { nullable: true })
  tags?: ComponentTagsInput[]

  @Field(() => ComponentRegionInput, { nullable: true })
  region?: ComponentRegionInput
}

@InputType()
export class UpdateComponentInput extends ChangeInputWithLang {
  static schema = ChangeInputWithLang.schema.extend({
    id: z.nanoid(),
    name: z.string().max(1024).optional(),
    nameTr: TrArraySchema,
    desc: z.string().max(100_000).optional(),
    descTr: TrArraySchema,
    imageURL: z.string().optional(),
    visual: ComponentVisualSchema.optional(),
    physical: ComponentPhysicalSchema.optional(),
    primaryMaterial: ComponentMaterialInput.schema.optional(),
    materials: z.array(ComponentMaterialInput.schema).optional(),
    addMaterials: z.array(ComponentMaterialInput.schema).optional(),
    removeMaterials: z.array(z.nanoid()).optional(),
    tags: z.array(ComponentTagsInput.schema).optional(),
    addTags: z.array(ComponentTagsInput.schema).optional(),
    removeTags: z.array(z.nanoid()).optional(),
    region: ComponentRegionInput.schema.optional(),
  })

  @Field(() => ID)
  id!: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => [TranslatedInput], { nullable: true })
  nameTr?: TranslatedInput[]

  @Field(() => String, { nullable: true })
  desc?: string

  @Field(() => [TranslatedInput], { nullable: true })
  descTr?: TranslatedInput[]

  @Field(() => String, { nullable: true })
  imageURL?: string

  @Field(() => JSONObjectResolver, { nullable: true })
  visual?: Record<string, any>

  @Field(() => JSONObjectResolver, { nullable: true })
  physical?: Record<string, any>

  @Field(() => ComponentMaterialInput, { nullable: true })
  primaryMaterial?: ComponentMaterialInput

  @Field(() => [ComponentMaterialInput], { nullable: true })
  materials?: ComponentMaterialInput[]

  @Field(() => [ComponentTagsInput], { nullable: true })
  tags?: ComponentTagsInput[]

  @Field(() => [ComponentTagsInput], { nullable: true })
  addTags?: ComponentTagsInput[]

  @Field(() => [ID], { nullable: true })
  removeTags?: string[]

  @Field(() => ComponentRegionInput, { nullable: true })
  region?: ComponentRegionInput
}

@ObjectType()
export class CreateComponentOutput {
  @Field(() => Change, { nullable: true })
  change?: Change & {}

  @Field(() => Component, { nullable: true })
  component?: Component
}

@ObjectType()
export class UpdateComponentOutput {
  @Field(() => Change, { nullable: true })
  change?: Change & {}

  @Field(() => Component, { nullable: true })
  component?: Component
}
