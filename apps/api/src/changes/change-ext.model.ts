import { Field, ID, InputType } from '@nestjs/graphql'
import { IsOptional, MaxLength, Validate } from 'class-validator'
import { JSONObjectResolver } from 'graphql-scalars'

import { IsNanoID } from '@src/common/validator.model'
import { type JSONObject } from '@src/common/z.schema'

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
  @Field(() => ID)
  @Validate(IsNanoID)
  id!: string

  @Field(() => JSONObjectResolver, { nullable: true })
  @IsOptional()
  meta?: JSONObject
}

@InputType()
export class ChangeInputWithLang {
  @Field(() => ID, { nullable: true, description: 'ID of an existing change to add this edit to' })
  @IsOptional()
  @Validate(IsNanoID)
  changeID?: string

  @Field(() => CreateChangeInput, {
    nullable: true,
    description: 'Details for a new change to create for this edit',
  })
  change?: CreateChangeInput & {}

  @Field(() => [SourceInput], {
    nullable: true,
    description: 'Sources to associate with this change',
  })
  addSources?: SourceInput[]

  @Field(() => [ID], { nullable: true, description: 'IDs of sources to remove from this change' })
  removeSources?: string[]

  @Field(() => Boolean, {
    nullable: true,
    description: 'If true, immediately apply (merge) the change after creation',
  })
  apply?: boolean

  @Field(() => String, {
    nullable: true,
    description: 'Language code for text input fields (BCP 47, e.g. "en")',
  })
  lang?: string | string[]
}

@InputType()
export class DeleteInput {
  @Field(() => ID)
  id!: string

  @Field(() => ID, { nullable: true })
  changeID?: string

  @Field(() => CreateChangeInput, { nullable: true })
  change?: CreateChangeInput & {}

  @Field(() => [SourceInput], { nullable: true })
  addSources?: SourceInput[]

  @Field(() => [ID], { nullable: true })
  removeSources?: string[]

  @Field(() => Boolean, { nullable: true })
  apply?: boolean
}
