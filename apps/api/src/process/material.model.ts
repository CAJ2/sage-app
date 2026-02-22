import { ArgsType, Field, ID, InputType, ObjectType } from '@nestjs/graphql'
import { Transform } from 'class-transformer'
import { IsOptional, MaxLength } from 'class-validator'
import { DateTime } from 'luxon'
import { z } from 'zod/v4'

import { ChangeInputWithLang } from '@src/changes/change-ext.model'
import { Change } from '@src/changes/change.model'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { translate } from '@src/common/i18n'
import { CreatedUpdated, registerModel, TranslatedInput } from '@src/graphql/base.model'
import { Named } from '@src/graphql/interfaces.model'
import { Paginated, PaginationBasicArgs } from '@src/graphql/paginated'

import { ComponentsPage } from './component.model'
import { Material as MaterialEntity } from './material.entity'
import { ProcessPage } from './process.model'

@ObjectType({
  implements: () => [Named],
  description: 'A raw or processed material that physical components are composed of',
})
export class Material extends CreatedUpdated<MaterialEntity> implements Named {
  @Field(() => ID)
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

  @Field(() => Boolean, {
    description: 'If true, this is an internal technical classification not shown to end-users',
  })
  technical: boolean = false

  @Field(() => String, {
    nullable: true,
    description: 'The physical form or shape of the material (e.g. film, rigid, fibre)',
  })
  shape?: string

  @Field(() => MaterialsPage, { description: 'Direct parent materials in the hierarchy' })
  parents!: MaterialsPage & {}

  @Field(() => MaterialsPage, { description: 'Direct child materials in the hierarchy' })
  children!: MaterialsPage & {}

  @Field(() => MaterialsPage, { description: 'All ancestor materials up the hierarchy' })
  ancestors!: MaterialsPage & {}

  @Field(() => MaterialsPage, { description: 'All descendant materials down the hierarchy' })
  descendants!: MaterialsPage & {}

  @Field(() => ComponentsPage, { description: 'Components that primarily use this material' })
  primaryComponents!: ComponentsPage & {}

  @Field(() => ComponentsPage, { description: 'All components that include this material' })
  components!: ComponentsPage & {}

  @Field(() => ProcessPage, { description: 'Recycling or disposal processes for this material' })
  processes!: ProcessPage & {}
}
registerModel('Material', Material)

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

export const MaterialIDSchema = z.string().meta({
  id: 'Material',
  name: 'Material ID',
})

@InputType()
export class CreateMaterialInput extends ChangeInputWithLang {
  @Field(() => String)
  @MaxLength(1024)
  name!: string

  @Field(() => [TranslatedInput], { nullable: true })
  nameTr?: TranslatedInput[]

  @Field(() => String, { nullable: true })
  desc?: string

  @Field(() => [TranslatedInput], { nullable: true })
  descTr?: TranslatedInput[]

  @Field(() => Boolean, {
    description: 'If true, this is an internal technical classification not shown to end-users',
  })
  technical: boolean = false

  @Field(() => [ID], { nullable: true, description: 'IDs of parent materials in the hierarchy' })
  parents?: string[]

  @Field(() => [ID], { nullable: true, description: 'IDs of child materials in the hierarchy' })
  children?: string[]
}

@InputType()
export class UpdateMaterialInput extends ChangeInputWithLang {
  @Field(() => ID)
  id!: string

  @Field(() => String, { nullable: true })
  @MaxLength(1024)
  name?: string

  @Field(() => [TranslatedInput], { nullable: true })
  nameTr?: TranslatedInput[]

  @Field(() => String, { nullable: true })
  desc?: string

  @Field(() => [TranslatedInput], { nullable: true })
  descTr?: TranslatedInput[]

  @Field(() => Boolean, {
    nullable: true,
    description: 'If true, this is an internal technical classification not shown to end-users',
  })
  technical?: boolean

  @Field(() => [ID], { nullable: true, description: 'IDs of parent materials in the hierarchy' })
  parents?: string[]

  @Field(() => [ID], { nullable: true, description: 'IDs of child materials in the hierarchy' })
  children?: string[]
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
