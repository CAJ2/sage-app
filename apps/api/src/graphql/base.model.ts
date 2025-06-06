import { Field, ID, InputType, ObjectType } from '@nestjs/graphql'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { IsNanoID } from '@src/common/validator.model'
import { iso639 } from '@src/db/iso639'
import { Validate } from 'class-validator'
import { JSONObjectResolver } from 'graphql-scalars'
import { map } from 'lodash'
import { DateTime } from 'luxon'
import { z } from 'zod/v4'
import type { Loaded } from '@mikro-orm/core'

export const ModelRegistry: Record<string, new () => BaseModel<any>> = {}
export function registerModel<T extends BaseModel<any>>(
  name: string,
  model: new () => T,
): void {
  if (ModelRegistry[name]) {
    throw new Error(`Model ${name} is already registered.`)
  }
  ModelRegistry[name] = model
}

export class BaseModel<T> {
  entity?: Loaded<T, never>
}

@ObjectType()
export class IDCreatedUpdated<T> extends BaseModel<T> {
  @Field(() => ID)
  @Validate(IsNanoID)
  id!: string

  @Field(() => LuxonDateTimeResolver)
  created_at!: DateTime

  @Field(() => LuxonDateTimeResolver)
  updated_at!: DateTime
}

@ObjectType()
export class CreatedUpdated<T> extends BaseModel<T> {
  @Field(() => LuxonDateTimeResolver)
  created_at!: DateTime

  @Field(() => LuxonDateTimeResolver)
  updated_at!: DateTime
}

@ObjectType()
export class ModelSchema {
  @Field(() => JSONObjectResolver, { nullable: true })
  schema?: Record<string, any>

  @Field(() => JSONObjectResolver, { nullable: true })
  uischema?: Record<string, any>
}

@ObjectType()
export class ModelEditSchema {
  @Field(() => ModelSchema, { nullable: true })
  create?: ModelSchema

  @Field(() => ModelSchema, { nullable: true })
  update?: ModelSchema

  @Field(() => ModelSchema, { nullable: true })
  delete?: ModelSchema
}

@InputType()
export class TranslatedInput {
  @Field(() => String)
  lang!: string

  @Field(() => String, { nullable: true })
  text?: string

  @Field(() => Boolean)
  auto: boolean = false
}

export const TranslatedInputSchema = z.object({
  lang: z.union(
    map(iso639, (l) =>
      z
        .literal(l.part1 || l.part2t)
        .meta({ title: `${l.nativeName} (${l.referenceName})` }),
    ),
  ),
  text: z.string().optional(),
  auto: z.boolean().default(false),
})
export const TrArraySchema = z
  .array(TranslatedInputSchema)
  .optional()
  .default([
    {
      lang: 'en',
      text: '',
      auto: false,
    },
  ])

@InputType()
export class InputWithLang {
  @Field(() => String, { nullable: true })
  lang?: string
}
