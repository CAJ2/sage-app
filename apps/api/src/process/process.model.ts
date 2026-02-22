import { ArgsType, Field, ID, InputType, ObjectType } from '@nestjs/graphql'
import { Transform } from 'class-transformer'
import { IsEnum, IsOptional } from 'class-validator'
import { JSONObjectResolver } from 'graphql-scalars'
import { z } from 'zod/v4'

import { ChangeInputWithLang } from '@src/changes/change-ext.model'
import { Change } from '@src/changes/change.model'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { translate, TrArraySchema } from '@src/common/i18n'
import { type JSONObject } from '@src/common/z.schema'
import { Place } from '@src/geo/place.model'
import { Region } from '@src/geo/region.model'
import { IDCreatedUpdated, registerModel, TranslatedInput } from '@src/graphql/base.model'
import { Named } from '@src/graphql/interfaces.model'
import { Paginated, PaginationBasicArgs } from '@src/graphql/paginated'
import { Variant } from '@src/product/variant.model'
import { Org } from '@src/users/org.model'
import { User } from '@src/users/users.model'

import { Material } from './material.model'
import {
  ProcessEfficiencySchema,
  Process as ProcessEntity,
  ProcessInstructionsSchema,
  ProcessIntent,
  ProcessRulesSchema,
} from './process.entity'

@ObjectType({ description: 'Efficiency metrics for a recycling or recovery process' })
export class ProcessEfficiency {
  @Field(() => Number, { nullable: true, description: 'Recycling or recovery efficiency ratio (0–1)' })
  efficiency?: number

  @Field(() => Number, { nullable: true, description: 'Material equivalency ratio for this process' })
  equivalency?: number

  @Field(() => Number, { nullable: true, description: 'Value recovery ratio relative to virgin material' })
  valueRatio?: number
}

@ObjectType({
  implements: () => [Named],
  description: 'A recycling, reuse, or disposal process for a product variant or material',
})
export class Process extends IDCreatedUpdated<ProcessEntity> implements Named {
  @Field(() => String, { description: 'The type of circular economy process (e.g. RECYCLE, REUSE, REPAIR)' })
  intent!: ProcessIntent

  @Field(() => String, { nullable: true })
  @Transform(translate)
  name?: string

  @Field(() => String, { nullable: true })
  @Transform(translate)
  desc?: string

  @Field(() => ProcessEfficiency, { nullable: true, description: 'Efficiency metrics for this process' })
  efficiency?: ProcessEfficiency

  @Field(() => Material, { nullable: true, description: 'The material this process handles' })
  material?: Material & {}

  @Field(() => Variant, { nullable: true, description: 'The product variant this process applies to' })
  variant?: Variant & {}

  @Field(() => Org, { nullable: true, description: 'The organization that offers or operates this process' })
  org?: Org & {}

  @Field(() => Region, { nullable: true, description: 'The geographic region where this process is available' })
  region?: Region

  @Field(() => Place, { nullable: true, description: 'The physical location where this process is carried out' })
  place?: Place

  @Field(() => [ProcessHistory], { description: 'Audit history of changes to this process' })
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
  static schema = PaginationBasicArgs.schema.extend({
    region: z.string().optional(),
    material: z.nanoid().optional(),
  })

  @Field(() => String, { nullable: true })
  region?: string

  @Field(() => String, { nullable: true })
  material?: string
}

@InputType()
export class ProcessMaterialInput {
  static schema = z.object({
    id: z.nanoid(),
  })

  @Field(() => ID)
  id!: string
}

@InputType()
export class ProcessVariantInput {
  static schema = z.object({
    id: z.nanoid(),
  })

  @Field(() => ID)
  id!: string
}

@InputType()
export class ProcessOrgInput {
  static schema = z.object({
    id: z.nanoid(),
  })

  @Field(() => ID)
  id!: string
}

@InputType()
export class ProcessRegionInput {
  static schema = z.object({
    id: z.string(),
  })

  @Field(() => ID)
  id!: string
}

@InputType()
export class ProcessPlaceInput {
  static schema = z.object({
    id: z.string(),
  })

  @Field(() => ID)
  id!: string
}

@InputType()
export class CreateProcessInput extends ChangeInputWithLang {
  static schema = ChangeInputWithLang.schema.extend({
    intent: z.enum(ProcessIntent),
    name: z.string().max(1000).optional(),
    nameTr: TrArraySchema,
    desc: z.string().max(100_000).optional(),
    descTr: TrArraySchema,
    instructions: ProcessInstructionsSchema,
    efficiency: ProcessEfficiencySchema.optional(),
    rules: ProcessRulesSchema.optional(),
    material: ProcessMaterialInput.schema.optional(),
    variant: ProcessVariantInput.schema.optional(),
    org: ProcessOrgInput.schema.optional(),
    region: ProcessRegionInput.schema.optional(),
    place: ProcessPlaceInput.schema.optional(),
  })

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
  instructions?: JSONObject

  @Field(() => JSONObjectResolver, { nullable: true })
  efficiency?: JSONObject

  @Field(() => JSONObjectResolver, { nullable: true })
  rules?: JSONObject

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
export class UpdateProcessInput extends ChangeInputWithLang {
  static schema = ChangeInputWithLang.schema.extend({
    id: z.nanoid(),
    intent: z.enum(ProcessIntent).optional(),
    name: z.string().max(1000).optional(),
    nameTr: TrArraySchema,
    desc: z.string().max(100_000).optional(),
    descTr: TrArraySchema,
    instructions: ProcessInstructionsSchema.optional(),
    efficiency: ProcessEfficiencySchema.optional(),
    rules: ProcessRulesSchema.optional(),
    material: ProcessMaterialInput.schema.optional(),
    variant: ProcessVariantInput.schema.optional(),
    org: ProcessOrgInput.schema.optional(),
    region: ProcessRegionInput.schema.optional(),
    place: ProcessPlaceInput.schema.optional(),
  })

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
  instructions?: JSONObject

  @Field(() => JSONObjectResolver, { nullable: true })
  efficiency?: JSONObject

  @Field(() => JSONObjectResolver, { nullable: true })
  rules?: JSONObject

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
