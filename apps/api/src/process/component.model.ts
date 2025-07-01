import {
  ArgsType,
  Field,
  Float,
  ID,
  InputType,
  ObjectType,
} from '@nestjs/graphql'
import { Change, ChangeInputWithLang } from '@src/changes/change.model'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { IsNanoID, ZodValid } from '@src/common/validator.model'
import { translate } from '@src/db/i18n'
import { Region } from '@src/geo/region.model'
import {
  IDCreatedUpdated,
  registerModel,
  TranslatedInput,
} from '@src/graphql/base.model'
import { Named } from '@src/graphql/interfaces.model'
import { Paginated, PaginationBasicArgs } from '@src/graphql/paginated'
import { Transform } from 'class-transformer'
import { IsOptional, MaxLength, Validate } from 'class-validator'
import { JSONObjectResolver } from 'graphql-scalars'
import { DateTime } from 'luxon'
import {
  Component as ComponentEntity,
  ComponentPhysicalSchema,
  ComponentVisualSchema,
} from './component.entity'
import { Material } from './material.model'
import { RecyclingStream, StreamContext, StreamScore } from './stream.model'
import { Tag } from './tag.model'

@ObjectType()
export class ComponentMaterial {
  @Field(() => Material)
  material!: Material & {}

  @Field(() => Float, { nullable: true })
  materialFraction?: number
}

@ObjectType()
export class ComponentRecycle {
  @Field(() => RecyclingStream, { nullable: true })
  stream?: RecyclingStream & {}

  @Field(() => StreamContext, { nullable: true })
  context?: StreamContext & {}
}

@ObjectType({
  implements: () => [Named],
})
export class Component
  extends IDCreatedUpdated<ComponentEntity>
  implements Named
{
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

  @Field(() => Material)
  primaryMaterial!: Material & {}

  @Field(() => [ComponentMaterial])
  materials: ComponentMaterial[] = []

  @Field(() => [Tag])
  tags!: Tag[]

  @Field(() => Region, { nullable: true })
  region?: Region & {}

  @Field(() => [ComponentRecycle], { nullable: true })
  recycle?: ComponentRecycle[]

  @Field(() => StreamScore, { nullable: true })
  recycleScore?: StreamScore

  @Field(() => [ComponentHistory])
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
  @Field(() => ID, { nullable: true })
  withChange?: string

  @Field(() => ID, { nullable: true })
  @IsOptional()
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
  @Field(() => ID)
  @Validate(IsNanoID)
  id!: string

  @Field(() => Float, { nullable: true })
  materialFraction?: number
}

@InputType()
export class ComponentTagsInput {
  @Field(() => ID)
  @Validate(IsNanoID)
  id!: string

  @Field(() => JSONObjectResolver, { nullable: true })
  @IsOptional()
  meta?: Record<string, any>
}

@InputType()
export class ComponentRegionInput {
  @Field(() => ID)
  id!: string
}

@InputType()
export class CreateComponentInput extends ChangeInputWithLang() {
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

  @Field(() => ComponentRegionInput, { nullable: true })
  region?: ComponentRegionInput
}

@InputType()
export class UpdateComponentInput extends ChangeInputWithLang() {
  @Field(() => ID)
  @Validate(IsNanoID)
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
  @ZodValid(ComponentVisualSchema.optional())
  visual?: Record<string, any>

  @Field(() => JSONObjectResolver, { nullable: true })
  @ZodValid(ComponentPhysicalSchema.optional())
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
