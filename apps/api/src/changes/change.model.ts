import { ArgsType, Field, ID, InputType, ObjectType } from '@nestjs/graphql'
import { SourcesPage } from '@src/changes/source.model'
import { transformUnion } from '@src/common/transform'
import { IsNanoID } from '@src/common/validator.model'
import { IDCreatedUpdated } from '@src/graphql/base.model'
import {
  OrderDirection,
  Paginated,
  PaginationBasicArgs,
} from '@src/graphql/paginated'
import { User } from '@src/users/users.model'
import { Transform } from 'class-transformer'
import { IsEnum, IsOptional, MaxLength, Validate } from 'class-validator'
import { JSONObjectResolver } from 'graphql-scalars'
import { Change as ChangeEntity, ChangeStatus } from './change.entity'
import { EditModel, EditModelType } from './change.enum'

@ObjectType()
export class Edit {
  @Field(() => String)
  entityName!: string

  @Field(() => ID, { nullable: true })
  id?: string

  @Field(() => EditModel, { nullable: true })
  @Transform(transformUnion('entityName'))
  original?: typeof EditModel

  @Field(() => EditModel, { nullable: true })
  @Transform(transformUnion('entityName'))
  changes?: typeof EditModel

  @Field(() => JSONObjectResolver, { nullable: true })
  createChanges?: Record<string, any>

  @Field(() => JSONObjectResolver, { nullable: true })
  updateChanges?: Record<string, any>
}

@ObjectType()
export class DirectEdit {
  @Field(() => String)
  entityName!: string

  @Field(() => ID, { nullable: true })
  id?: string

  @Field(() => JSONObjectResolver, { nullable: true })
  createModel?: Record<string, any>

  @Field(() => JSONObjectResolver, { nullable: true })
  updateModel?: Record<string, any>

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
  userID?: string

  validate(): void {
    super.validate()
  }

  orderBy(): string[] {
    return ['id']
  }

  orderDir(): OrderDirection[] {
    return [OrderDirection.ASC]
  }
}

@ArgsType()
export class ChangeSourcesArgs extends PaginationBasicArgs {}

@ArgsType()
export class ChangeEditsArgs extends PaginationBasicArgs {
  @Field(() => ID, { nullable: true })
  id?: string

  @Field(() => EditModelType, { nullable: true })
  type?: EditModelType
}

@ArgsType()
export class DirectEditArgs {
  @Field(() => ID, { nullable: true })
  id?: string

  @Field(() => String, { nullable: true })
  entityName?: string
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

@ObjectType()
export class DiscardEditOutput {
  @Field(() => Boolean, { nullable: true })
  success?: boolean

  @Field(() => ID, { nullable: true })
  id?: string
}

export interface MergeInput {
  apply?: boolean
}
