import { ArgsType, Field, ID, InputType, ObjectType } from '@nestjs/graphql'
import { Change, ChangeInputWithLang } from '@src/changes/change.model'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { translate } from '@src/db/i18n'
import { Place } from '@src/geo/place.model'
import { Region } from '@src/geo/region.model'
import {
  IDCreatedUpdated,
  registerModel,
  TranslatedInput,
} from '@src/graphql/base.model'
import { Named } from '@src/graphql/interfaces.model'
import { Paginated, PaginationBasicArgs } from '@src/graphql/paginated'
import { Variant } from '@src/product/variant.model'
import { Org } from '@src/users/org.model'
import { User } from '@src/users/users.model'
import { Transform } from 'class-transformer'
import { IsEnum, IsOptional } from 'class-validator'
import { JSONObjectResolver } from 'graphql-scalars'
import { Material } from './material.model'
import { Process as ProcessEntity, ProcessIntent } from './process.entity'

@ObjectType()
export class ProcessEfficiency {
  @Field(() => Number, { nullable: true })
  efficiency?: number

  @Field(() => Number, { nullable: true })
  equivalency?: number

  @Field(() => Number, { nullable: true })
  valueRatio?: number
}

@ObjectType({
  implements: () => [Named],
})
export class Process extends IDCreatedUpdated<ProcessEntity> implements Named {
  @Field(() => String)
  intent!: ProcessIntent

  @Field(() => String, { nullable: true })
  @Transform(translate)
  name?: string

  @Field(() => String, { nullable: true })
  @Transform(translate)
  desc?: string

  @Field(() => ProcessEfficiency, { nullable: true })
  efficiency?: ProcessEfficiency

  @Field(() => Material, { nullable: true })
  material?: Material & {}

  @Field(() => Variant, { nullable: true })
  variant?: Variant & {}

  @Field(() => Org, { nullable: true })
  org?: Org & {}

  @Field(() => Region, { nullable: true })
  region?: Region

  @Field(() => Place, { nullable: true })
  place?: Place

  @Field(() => [ProcessHistory])
  history: ProcessHistory[] = []
}
registerModel('Process', Process)

@ObjectType()
export class ProcessHistory {
  @Field(() => Process)
  process!: Process

  @Field(() => LuxonDateTimeResolver)
  datetime!: Date

  @Field(() => User)
  user!: User & {}

  @Field(() => String, { nullable: true })
  original?: string

  @Field(() => String, { nullable: true })
  changes?: string
}

@ObjectType()
export class ProcessPage extends Paginated(Process) {}

@ArgsType()
export class ProcessArgs extends PaginationBasicArgs {
  @Field(() => String, { nullable: true })
  region?: string

  @Field(() => String, { nullable: true })
  material?: string
}

@InputType()
export class ProcessMaterialInput {
  @Field(() => ID)
  id!: string
}

@InputType()
export class ProcessVariantInput {
  @Field(() => ID)
  id!: string
}

@InputType()
export class ProcessOrgInput {
  @Field(() => ID)
  id!: string
}

@InputType()
export class ProcessRegionInput {
  @Field(() => ID)
  id!: string
}

@InputType()
export class ProcessPlaceInput {
  @Field(() => ID)
  id!: string
}

@InputType()
export class CreateProcessInput extends ChangeInputWithLang() {
  @Field(() => String)
  @IsEnum(ProcessIntent, { message: 'Invalid process intent' })
  intent!: ProcessIntent

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => [TranslatedInput], { nullable: true })
  nameTr?: TranslatedInput[]

  @Field(() => String, { nullable: true })
  desc?: string

  @Field(() => [TranslatedInput], { nullable: true })
  descTr?: TranslatedInput[]

  @Field(() => JSONObjectResolver, { nullable: true })
  instructions?: Record<string, any>

  @Field(() => JSONObjectResolver, { nullable: true })
  efficiency?: Record<string, any>

  @Field(() => JSONObjectResolver, { nullable: true })
  rules?: Record<string, any>

  @Field(() => ProcessMaterialInput, { nullable: true })
  material?: ProcessMaterialInput

  @Field(() => ProcessVariantInput, { nullable: true })
  variant?: ProcessVariantInput

  @Field(() => ProcessOrgInput, { nullable: true })
  org?: ProcessOrgInput

  @Field(() => ProcessRegionInput, { nullable: true })
  region?: ProcessRegionInput

  @Field(() => ProcessPlaceInput, { nullable: true })
  place?: ProcessPlaceInput
}

@InputType()
export class UpdateProcessInput extends ChangeInputWithLang() {
  @Field(() => ID)
  id!: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(ProcessIntent, { message: 'Invalid process intent' })
  intent?: ProcessIntent

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => [TranslatedInput], { nullable: true })
  nameTr?: TranslatedInput[]

  @Field(() => String, { nullable: true })
  desc?: string

  @Field(() => [TranslatedInput], { nullable: true })
  descTr?: TranslatedInput[]

  @Field(() => JSONObjectResolver, { nullable: true })
  instructions?: Record<string, any>

  @Field(() => JSONObjectResolver, { nullable: true })
  efficiency?: Record<string, any>

  @Field(() => JSONObjectResolver, { nullable: true })
  rules?: Record<string, any>

  @Field(() => ProcessMaterialInput, { nullable: true })
  material?: ProcessMaterialInput

  @Field(() => ProcessVariantInput, { nullable: true })
  variant?: ProcessVariantInput

  @Field(() => ProcessOrgInput, { nullable: true })
  org?: ProcessOrgInput

  @Field(() => ProcessRegionInput, { nullable: true })
  region?: ProcessRegionInput

  @Field(() => ProcessPlaceInput, { nullable: true })
  place?: ProcessPlaceInput
}

@ObjectType()
export class CreateProcessOutput {
  @Field(() => Change, { nullable: true })
  change?: Change & {}

  @Field(() => Process, { nullable: true })
  process?: Process
}

@ObjectType()
export class UpdateProcessOutput {
  @Field(() => Change, { nullable: true })
  change?: Change & {}

  @Field(() => Process, { nullable: true })
  process?: Process
}
