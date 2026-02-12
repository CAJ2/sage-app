import { Field, ID, InputType } from '@nestjs/graphql'
import { IsNanoID } from '@src/common/validator.model'
import { type JSONObject, ZJSONObject } from '@src/common/z.schema'
import { LangSchema } from '@src/graphql/base.model'
import { IsOptional, MaxLength, Validate } from 'class-validator'
import { JSONObjectResolver } from 'graphql-scalars'
import { z } from 'zod/v4'
import { ChangeStatus } from './change.entity'

export interface ISourceInput {
  id: string
  meta?: JSONObject
}

export interface IChangeInputWithLang {
  changeID?: string
  change?: CreateChangeInput & {}
  addSources?: ISourceInput[]
  removeSources?: string[]
  apply?: boolean
}

export const isUsingChange = (input: IChangeInputWithLang): boolean => {
  return !!input.changeID || !!input.change
}

@InputType()
export class CreateChangeInput {
  static schema = z.object({
    title: z.string().min(1).max(1000).optional(),
    description: z.string().max(100000).optional(),
    status: z.enum(ChangeStatus).optional(),
    sources: z.array(z.string().nanoid()).optional(),
  })

  @Field(() => String, { nullable: true })
  @IsOptional()
  @MaxLength(1000)
  title?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @MaxLength(100000)
  description?: string

  @Field(() => ChangeStatus, { nullable: true })
  status?: ChangeStatus & {}

  @Field(() => [ID], { nullable: true })
  sources?: string[]
}

@InputType()
class SourceInput {
  static schema = z.object({
    id: z.string().nanoid(),
    meta: ZJSONObject.optional(),
  })

  @Field(() => ID)
  @Validate(IsNanoID)
  id!: string

  @Field(() => JSONObjectResolver, { nullable: true })
  @IsOptional()
  meta?: JSONObject
}

@InputType()
export class ChangeInputWithLang {
  static schema = z
    .object({
      changeID: z.nanoid().optional(),
      change: CreateChangeInput.schema.optional(),
      addSources: SourceInput.schema.array().optional(),
      removeSources: z.array(z.nanoid()).optional(),
      apply: z.boolean().optional(),
      lang: LangSchema,
    })
    .refine((data) => !data.changeID !== !data.change, {
      error: 'Either changeID or change must be provided, but not both.',
    })

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @Validate(IsNanoID)
  changeID?: string

  @Field(() => CreateChangeInput, { nullable: true })
  change?: CreateChangeInput & {}

  @Field(() => [SourceInput], { nullable: true })
  addSources?: SourceInput[]

  @Field(() => [ID], { nullable: true })
  removeSources?: string[]

  @Field(() => Boolean, { nullable: true })
  apply?: boolean

  @Field(() => String, { nullable: true })
  lang?: string | string[]
}

@InputType()
export class DeleteInput {
  @Field(() => ID)
  id!: string

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @Validate(IsNanoID)
  changeID?: string

  @Field(() => CreateChangeInput, { nullable: true })
  change?: CreateChangeInput & {}

  @Field(() => [SourceInput], { nullable: true })
  addSources?: SourceInput[]

  @Field(() => [ID], { nullable: true })
  removeSources?: string[]

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  apply?: boolean
}
