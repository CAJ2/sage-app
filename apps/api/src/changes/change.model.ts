import { ArgsType, Field, ID, InputType, ObjectType } from '@nestjs/graphql'
import { SourcesPage } from '@src/changes/source.model'
import { IsNanoID } from '@src/common/validator.model'
import { IDCreatedUpdated, InputWithLang } from '@src/graphql/base.model'
import { Paginated, PaginationBasicArgs } from '@src/graphql/paginated'
import { User } from '@src/users/users.model'
import { IsEnum, IsOptional, MaxLength, Validate } from 'class-validator'
import { JSONObjectResolver } from 'graphql-scalars'
import { Change as ChangeEntity, ChangeStatus } from './change.entity'
import { EditModel } from './change.enum'

@ObjectType()
export class Edit {
  @Field(() => String)
  model!: string

  @Field(() => ID, { nullable: true })
  id?: string

  @Field(() => EditModel, { nullable: true })
  original?: typeof EditModel

  @Field(() => EditModel, { nullable: true })
  changes?: typeof EditModel
}

@ObjectType()
export class Change extends IDCreatedUpdated<ChangeEntity> {
  @Field(() => String, { nullable: true })
  @MaxLength(255)
  title?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => ChangeStatus)
  status!: ChangeStatus & {}

  @Field(() => User)
  user!: User

  @Field(() => [Edit])
  edits!: Edit[]

  @Field(() => SourcesPage)
  sources!: SourcesPage & {}

  @Field(() => JSONObjectResolver, { nullable: true })
  metadata?: Record<string, any>
}

@ObjectType()
export class ChangesPage extends Paginated(Change) {}

@ArgsType()
export class ChangesArgs extends PaginationBasicArgs {
  @Field(() => ChangeStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ChangeStatus)
  status?: ChangeStatus

  @Field(() => ID, { nullable: true })
  @IsOptional()
  user_id?: string
}

@ArgsType()
export class ChangeSourcesArgs extends PaginationBasicArgs {}

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

  @Field(() => [ID])
  sources: string[] = []

  @Field(() => JSONObjectResolver, { nullable: true })
  metadata?: Record<string, any>
}

@InputType()
export class UpdateChangeInput {
  @Field(() => ID)
  @Validate(IsNanoID)
  id!: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @MaxLength(1000)
  title?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @MaxLength(100000)
  description?: string

  @Field(() => ChangeStatus, { nullable: true })
  @IsOptional()
  status?: ChangeStatus & {}

  @Field(() => [ID], { nullable: true })
  @IsOptional()
  sources?: string[]

  @Field(() => JSONObjectResolver, { nullable: true })
  @IsOptional()
  metadata?: Record<string, any>
}

export function ChangeInputWithLang() {
  @InputType()
  class ChangeInputWithLangCls extends InputWithLang {
    @Field(() => ID, { nullable: true })
    @IsOptional()
    @Validate(IsNanoID)
    change_id?: string

    @Field(() => CreateChangeInput, { nullable: true })
    change?: CreateChangeInput & {}

    @Field(() => [ID], { nullable: true })
    add_sources?: string[]

    @Field(() => [ID], { nullable: true })
    remove_sources?: string[]
  }
  return ChangeInputWithLangCls
}
