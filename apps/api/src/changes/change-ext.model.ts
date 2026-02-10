import { Field, ID, InputType } from '@nestjs/graphql'
import { IsNanoID } from '@src/common/validator.model'
import { IsOptional, MaxLength, Validate } from 'class-validator'
import { JSONObjectResolver } from 'graphql-scalars'
import { ChangeStatus } from './change.entity'

export interface ISourceInput {
  id: string
  meta?: Record<string, any>
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
  meta?: Record<string, any>
}

@InputType()
export class ChangeInputWithLang {
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
  lang?: string
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
