import { ArgsType, Field, ID, InputType, ObjectType } from '@nestjs/graphql'
import { Change, ChangeInputWithLang } from '@src/changes/change.model'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { CreatedUpdated } from '@src/graphql/base.model'
import { Paginated, PaginationBasicArgs } from '@src/graphql/paginated'
import { MaxLength } from 'class-validator'
import { JSONObjectResolver } from 'graphql-scalars'
import { DateTime } from 'luxon'
import { ComponentsPage } from './component.model'
import { Material as MaterialEntity } from './material.entity'
import { ProcessPage } from './process.model'

@ObjectType()
export class Material extends CreatedUpdated<MaterialEntity> {
  @Field(() => ID)
  id!: string

  @Field(() => String, { nullable: true })
  @MaxLength(1024)
  name?: string

  @Field(() => String, { nullable: true })
  desc?: string

  @Field(() => JSONObjectResolver, { nullable: true })
  source?: object

  @Field(() => Boolean)
  technical: boolean = false

  @Field(() => [Material])
  ancestors: Material[] = []

  @Field(() => [Material])
  descendants: Material[] = []

  @Field(() => ComponentsPage)
  primary_components!: ComponentsPage & {}

  @Field(() => ComponentsPage)
  components!: ComponentsPage & {}

  @Field(() => ProcessPage)
  processes!: ProcessPage & {}
}

@ObjectType()
export class MaterialHistory {
  @Field(() => String)
  material_id!: string

  @Field(() => LuxonDateTimeResolver)
  datetime!: DateTime

  @Field(() => String, { nullable: true })
  original?: string

  @Field(() => String, { nullable: true })
  changes?: string
}

@ObjectType()
export class MaterialsPage extends Paginated(Material) {}

@ArgsType()
export class MaterialsArgs extends PaginationBasicArgs {}

@ArgsType()
export class PrimaryComponentsArgs extends PaginationBasicArgs {}

@ArgsType()
export class ComponentsArgs extends PaginationBasicArgs {}

@ArgsType()
export class ProcessesArgs extends PaginationBasicArgs {}

@InputType()
export class CreateMaterialInput extends ChangeInputWithLang() {
  @Field(() => String)
  @MaxLength(1024)
  name!: string

  @Field(() => String, { nullable: true })
  desc?: string

  @Field(() => Boolean)
  technical: boolean = false

  @Field(() => [ID], { nullable: true })
  ancestors?: string[]

  @Field(() => [ID], { nullable: true })
  descendants?: string[]
}

@InputType()
export class UpdateMaterialInput extends ChangeInputWithLang() {
  @Field(() => ID)
  id!: string

  @Field(() => String, { nullable: true })
  @MaxLength(1024)
  name?: string

  @Field(() => String, { nullable: true })
  desc?: string

  @Field(() => Boolean, { nullable: true })
  technical?: boolean

  @Field(() => [ID], { nullable: true })
  ancestors?: string[]

  @Field(() => [ID], { nullable: true })
  descendants?: string[]
}

@ObjectType()
export class CreateMaterialOutput {
  @Field(() => Change, { nullable: true })
  change?: Change & {}

  @Field(() => Material, { nullable: true })
  material?: Material
}

@ObjectType()
export class UpdateMaterialOutput {
  @Field(() => Change, { nullable: true })
  change?: Change & {}

  @Field(() => Material, { nullable: true })
  material?: Material
}
