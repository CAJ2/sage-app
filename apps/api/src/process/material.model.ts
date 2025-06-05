import { ArgsType, Field, ID, InputType, ObjectType } from '@nestjs/graphql'
import { Change, ChangeInputWithLang } from '@src/changes/change.model'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { translate } from '@src/db/i18n'
import { CreatedUpdated, TranslatedInput } from '@src/graphql/base.model'
import { Named } from '@src/graphql/interfaces.model'
import { Paginated, PaginationBasicArgs } from '@src/graphql/paginated'
import { Transform } from 'class-transformer'
import { IsOptional, MaxLength } from 'class-validator'
import { DateTime } from 'luxon'
import { z } from 'zod/v4'
import { ComponentsPage } from './component.model'
import { Material as MaterialEntity } from './material.entity'
import { ProcessPage } from './process.model'

@ObjectType({
  implements: () => [Named],
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

  @Field(() => Boolean)
  technical: boolean = false

  @Field(() => MaterialsPage)
  parents!: MaterialsPage & {}

  @Field(() => MaterialsPage)
  children!: MaterialsPage & {}

  @Field(() => MaterialsPage)
  ancestors!: MaterialsPage & {}

  @Field(() => MaterialsPage)
  descendants!: MaterialsPage & {}

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

export const MaterialIDSchema = z.nanoid().meta({
  id: 'Material',
  name: 'Material ID',
})

@InputType()
export class CreateMaterialInput extends ChangeInputWithLang() {
  @Field(() => String)
  @MaxLength(1024)
  name!: string

  @Field(() => [TranslatedInput], { nullable: true })
  name_tr?: TranslatedInput[]

  @Field(() => String, { nullable: true })
  desc?: string

  @Field(() => [TranslatedInput], { nullable: true })
  desc_tr?: TranslatedInput[]

  @Field(() => Boolean)
  technical: boolean = false

  @Field(() => [ID], { nullable: true })
  parents?: string[]

  @Field(() => [ID], { nullable: true })
  children?: string[]
}

@InputType()
export class UpdateMaterialInput extends ChangeInputWithLang() {
  @Field(() => ID)
  id!: string

  @Field(() => String, { nullable: true })
  @MaxLength(1024)
  name?: string

  @Field(() => [TranslatedInput], { nullable: true })
  name_tr?: TranslatedInput[]

  @Field(() => String, { nullable: true })
  desc?: string

  @Field(() => [TranslatedInput], { nullable: true })
  desc_tr?: TranslatedInput[]

  @Field(() => Boolean, { nullable: true })
  technical?: boolean

  @Field(() => [ID], { nullable: true })
  parents?: string[]

  @Field(() => [ID], { nullable: true })
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
