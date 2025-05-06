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
import { IsNanoID } from '@src/common/validator.model'
import { translate } from '@src/db/i18n'
import { Region } from '@src/geo/region.model'
import { IDCreatedUpdated } from '@src/graphql/base.model'
import { Paginated, PaginationBasicArgs } from '@src/graphql/paginated'
import { Transform } from 'class-transformer'
import { IsOptional, MaxLength, Validate } from 'class-validator'
import { JSONObjectResolver } from 'graphql-scalars'
import { DateTime } from 'luxon'
import { Component as ComponentEntity } from './component.entity'
import { Material } from './material.model'
import { Tag } from './tag.model'

@ObjectType()
export class RecyclingStream {
  @Field(() => String, { nullable: true })
  @Transform(translate)
  @MaxLength(1024)
  name?: string

  @Field(() => String, { nullable: true })
  @Transform(translate)
  desc?: string
}

@ObjectType()
export class ComponentMaterial {
  @Field(() => Material)
  material!: Material & {}

  @Field(() => Float, { nullable: true })
  material_fraction?: number
}

@ObjectType()
export class Component extends IDCreatedUpdated<ComponentEntity> {
  @Field(() => String, { nullable: true })
  @Transform(translate)
  @MaxLength(1024)
  name?: string

  @Field(() => String, { nullable: true })
  @Transform(translate)
  desc?: string

  @Field(() => String, { nullable: true })
  @Transform(({ value }) => value.image)
  image_url?: string

  @Field(() => Material)
  primary_material!: Material & {}

  @Field(() => [ComponentMaterial])
  materials: ComponentMaterial[] = []

  @Field(() => [Tag])
  tags!: Tag[]

  @Field(() => Region, { nullable: true })
  region?: Region & {}

  @Field(() => [ComponentHistory])
  history: ComponentHistory[] = []
}

@ObjectType()
export class ComponentHistory {
  @Field(() => String)
  component_id!: string

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
export class ComponentsArgs extends PaginationBasicArgs {}

@InputType()
export class ComponentMaterialInput {
  @Field(() => ID)
  @Validate(IsNanoID)
  id!: string

  @Field(() => Float, { nullable: true })
  material_fraction?: number
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
  @Validate(IsNanoID)
  id!: string
}

@InputType()
export class CreateComponentInput extends ChangeInputWithLang() {
  @Field(() => String)
  @Transform(translate)
  @MaxLength(1024)
  name!: string

  @Field(() => String, { nullable: true })
  @Transform(translate)
  @IsOptional()
  @MaxLength(100_000)
  desc?: string

  @Field(() => String, { nullable: true })
  image_url?: string

  @Field(() => ComponentMaterialInput, { nullable: true })
  primary_material?: ComponentMaterialInput

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
  @Transform(translate)
  @IsOptional()
  @MaxLength(1024)
  name?: string

  @Field(() => String, { nullable: true })
  @Transform(translate)
  @IsOptional()
  @MaxLength(100_000)
  desc?: string

  @Field(() => String, { nullable: true })
  image_url?: string

  @Field(() => ComponentMaterialInput, { nullable: true })
  primary_material?: ComponentMaterialInput

  @Field(() => [ComponentMaterialInput], { nullable: true })
  materials?: ComponentMaterialInput[]

  @Field(() => [ComponentTagsInput], { nullable: true })
  add_tags?: ComponentTagsInput[]

  @Field(() => [ComponentTagsInput], { nullable: true })
  remove_tags?: ComponentTagsInput[]

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
