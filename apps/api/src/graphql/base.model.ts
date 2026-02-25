import type { Loaded } from '@mikro-orm/core'
import { Field, ID, InputType, ObjectType } from '@nestjs/graphql'
import { Validate } from 'class-validator'
import { JSONObjectResolver } from 'graphql-scalars'
import { DateTime } from 'luxon'
import { z } from 'zod/v4'

import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { IsNanoID } from '@src/common/validator.model'

export const ModelRegistry: Record<string, new () => BaseModel<any>> = {}
export function registerModel<T extends BaseModel<any>>(name: string, model: new () => T): void {
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
  createdAt!: DateTime

  @Field(() => LuxonDateTimeResolver)
  updatedAt!: DateTime
}

@ObjectType()
export class CreatedUpdated<T> extends BaseModel<T> {
  @Field(() => LuxonDateTimeResolver)
  createdAt!: DateTime

  @Field(() => LuxonDateTimeResolver)
  updatedAt!: DateTime
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

@ObjectType({ description: 'A translated text value for a specific language' })
export class TranslatedOutput {
  @Field(() => String, { description: 'BCP 47 language code (e.g. "en", "fr-CA")' })
  lang!: string

  @Field(() => String, { nullable: true })
  text?: string

  @Field(() => Boolean, { description: 'Whether this translation was generated automatically' })
  auto: boolean = false
}

@InputType({ description: 'A translated text value for a specific language' })
export class TranslatedInput {
  @Field(() => String, { description: 'BCP 47 language code (e.g. "en", "fr-CA")' })
  lang!: string

  @Field(() => String, { nullable: true })
  text?: string

  @Field(() => Boolean, { description: 'Whether this translation was generated automatically' })
  auto: boolean = false
}

export const LangSchema = z.union([z.string(), z.array(z.string())]).optional()

@InputType()
export class InputWithLang {
  @Field(() => String, { nullable: true })
  lang?: string | string[]
}

@ObjectType()
export class DeleteOutput {
  @Field(() => Boolean)
  success!: boolean

  @Field(() => String, { nullable: true })
  id?: string
}
