import { Field, ID, InputType, ObjectType } from '@nestjs/graphql'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { IsNanoID } from '@src/common/validator.model'
import { IsOptional, MaxLength, Validate } from 'class-validator'
import { JSONObjectResolver } from 'graphql-scalars'
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

@ObjectType()
export class TranslatedOutput {
  @Field(() => String)
  lang!: string

  @Field(() => String, { nullable: true })
  text?: string

  @Field(() => Boolean)
  auto: boolean = false
}

@InputType()
export class TranslatedInput {
  @Field(() => String)
  lang!: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @MaxLength(100_000)
  text?: string

  @Field(() => Boolean)
  auto: boolean = false
}

export const TranslatedInputSchema = z.object({
  lang: z
    .string()
    .regex(/^[a-z]{2,3}(-[A-Z]{2,8}(-[^-]{2,8})?)?$/)
    .meta({
      id: 'lang',
      title: 'Language Code',
    }),
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
export const ImageOrIconSchema = z
  .url({ protocol: /^(https|iconify):\/\// })
  .optional()
  .default('')

@InputType()
export class InputWithLang {
  @Field(() => String, { nullable: true })
  lang?: string
}
