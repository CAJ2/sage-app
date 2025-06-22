import { ArgsType, Field, ID, InputType, ObjectType } from '@nestjs/graphql'
import { SourcesPage } from '@src/changes/source.model'
import { transformUnion } from '@src/common/transform'
import { IsNanoID } from '@src/common/validator.model'
import { IDCreatedUpdated, InputWithLang } from '@src/graphql/base.model'
import { Paginated, PaginationBasicArgs } from '@src/graphql/paginated'
import { User } from '@src/users/users.model'
import { Transform } from 'class-transformer'
import { IsEnum, IsOptional, MaxLength, Validate } from 'class-validator'
import { JSONObjectResolver } from 'graphql-scalars'
import { Change as ChangeEntity, ChangeStatus } from './change.entity'
import { EditModel } from './change.enum'

@ObjectType()
export class Edit {
  @Field(() => String)
  entity_name!: string

  @Field(() => ID, { nullable: true })
  id?: string

  @Field(() => EditModel, { nullable: true })
  @Transform(transformUnion('entity_name'))
  original?: typeof EditModel

  @Field(() => EditModel, { nullable: true })
  @Transform(transformUnion('entity_name'))
  changes?: typeof EditModel

  @Field(() => JSONObjectResolver, { nullable: true })
  changes_create?: Record<string, any>

  @Field(() => JSONObjectResolver, { nullable: true })
  changes_update?: Record<string, any>
}

@ObjectType()
export class DirectEdit {
  @Field(() => String)
  entity_name!: string

  @Field(() => ID, { nullable: true })
  id?: string

  @Field(() => JSONObjectResolver, { nullable: true })
  model_create?: Record<string, any>

  @Field(() => JSONObjectResolver, { nullable: true })
  model_update?: Record<string, any>

  // Not exposed in GraphQL
  original?: typeof EditModel
  changes?: typeof EditModel
}

@ObjectType()
export class ChangeEditsPage extends Paginated(Edit) {}

@ObjectType()
export class Change extends IDCreatedUpdated<ChangeEntity> {
  @Field(() => String, { nullable: true })
  title?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => ChangeStatus)
  status!: ChangeStatus & {}

  @Field(() => User)
  user!: User & {}

  @Field(() => ChangeEditsPage)
  edits!: ChangeEditsPage

  @Field(() => SourcesPage)
  sources!: SourcesPage & {}
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

@ArgsType()
export class ChangeEditsArgs {
  @Field(() => ID, { nullable: true })
  id?: string
}

@ArgsType()
export class DirectEditArgs {
  @Field(() => ID, { nullable: true })
  id?: string

  @Field(() => String, { nullable: true })
  entity_name?: string
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
}

@ObjectType()
export class CreateChangeOutput {
  @Field(() => Change, { nullable: true })
  change?: Change
}

@ObjectType()
export class UpdateChangeOutput {
  @Field(() => Change, { nullable: true })
  change?: Change
}

@ObjectType()
export class DeleteChangeOutput {
  @Field(() => Boolean, { nullable: true })
  success?: boolean
}

@ObjectType()
export class MergeChangeOutput {
  @Field(() => Change, { nullable: true })
  change?: Change
}

export interface MergeInput {
  apply?: boolean
}

export interface ISourceInput {
  id: string
  meta?: Record<string, any>
}

export interface IChangeInputWithLang {
  change_id?: string
  change?: CreateChangeInput & {}
  add_sources?: ISourceInput[]
  remove_sources?: string[]
  apply?: boolean
  useChange(): boolean
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

export function ChangeInputWithLang() {
  @InputType()
  class ChangeInputWithLangCls extends InputWithLang {
    @Field(() => ID, { nullable: true })
    @IsOptional()
    @Validate(IsNanoID)
    change_id?: string

    @Field(() => CreateChangeInput, { nullable: true })
    change?: CreateChangeInput & {}

    @Field(() => [SourceInput], { nullable: true })
    add_sources?: SourceInput[]

    @Field(() => [ID], { nullable: true })
    remove_sources?: string[]

    @Field(() => Boolean, { nullable: true })
    apply?: boolean

    useChange(): boolean {
      return !!this.change_id || !!this.change
    }
  }
  return ChangeInputWithLangCls
}
