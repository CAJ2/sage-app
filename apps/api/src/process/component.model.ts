import { ArgsType, Field, Float, InputType, ObjectType } from '@nestjs/graphql'
import { Change, ChangeInputWithLang } from '@src/changes/change.model'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { translate } from '@src/db/i18n'
import { IDCreatedUpdated } from '@src/graphql/base.model'
import { Paginated, PaginationBasicArgs } from '@src/graphql/paginated'
import { Transform } from 'class-transformer'
import { MaxLength } from 'class-validator'
import { JSONObjectResolver } from 'graphql-scalars'
import { DateTime } from 'luxon'
import { Component as ComponentEntity } from './component.entity'
import { Material } from './material.model'

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

  @Field(() => JSONObjectResolver, { nullable: true })
  source?: object

  @Field(() => String, { nullable: true })
  residential_stream?: string

  @Field(() => String, { nullable: true })
  local_stream?: string

  @Field(() => String, { nullable: true })
  commercial_stream?: string

  @Field(() => Boolean)
  hazardous: boolean = false

  @Field(() => String, { nullable: true })
  hazardous_info?: string

  @Field(() => Material)
  primary_material!: Material & {}

  @Field(() => [ComponentMaterial])
  materials: ComponentMaterial[] = []

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
export class CreateComponentInput extends ChangeInputWithLang() {}

@InputType()
export class UpdateComponentInput extends ChangeInputWithLang() {}

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
