import type { BaseEntity, Loaded, Ref } from '@mikro-orm/core'
import { Field, ID, InputType, ObjectType } from '@nestjs/graphql'
import { Validate } from 'class-validator'
import { JSONObjectResolver } from 'graphql-scalars'
import { DateTime } from 'luxon'
import { z } from 'zod/v4'

import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { type UISchemaElement } from '@src/common/ui.schema'
import { IsNanoID } from '@src/common/validator.model'

export const ModelRegistry: Record<string, new () => BaseModel> = {}
export function registerModel<T extends BaseModel>(name: string, model: new () => T): void {
  if (ModelRegistry[name]) {
    throw new Error(`Model ${name} is already registered.`)
  }
  ModelRegistry[name] = model
}

export class BaseModel {}

export type ModelRef<M extends BaseModel, E extends BaseEntity> = M | Loaded<E, any> | Ref<E>

@ObjectType()
export class IDCreatedUpdated extends BaseModel {
  @Field(() => ID)
  @Validate(IsNanoID)
  id!: string

  @Field(() => LuxonDateTimeResolver)
  createdAt!: DateTime

  @Field(() => LuxonDateTimeResolver)
  updatedAt!: DateTime
}

@ObjectType()
export class CreatedUpdated extends BaseModel {
  @Field(() => LuxonDateTimeResolver)
  createdAt!: DateTime

  @Field(() => LuxonDateTimeResolver)
  updatedAt!: DateTime
}

@ObjectType()
export class ModelSchema {
  @Field(() => JSONObjectResolver, { nullable: true })
  schema?: z.core.JSONSchema.BaseSchema

  @Field(() => JSONObjectResolver, { nullable: true })
  uischema?: UISchemaElement
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
