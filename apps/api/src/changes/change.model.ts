import { ArgsType, Field, ID, InputType, ObjectType } from '@nestjs/graphql'
import { Transform } from 'class-transformer'
import { JSONObjectResolver } from 'graphql-scalars'
import { z } from 'zod/v4'

import { ChangeEdits, Change as ChangeEntity, ChangeStatus } from '@src/changes/change.entity'
import { EditModel, EditModelType } from '@src/changes/change.enum'
import { SourcesPage } from '@src/changes/source.model'
import { transformUnion } from '@src/common/transform'
import { BaseModel, IDCreatedUpdated } from '@src/graphql/base.model'
import { OrderDirection, Paginated, PaginationBasicArgs } from '@src/graphql/paginated'
import { User } from '@src/users/users.model'

@ObjectType({ description: 'A tracked edit to a single entity within a change' })
export class Edit extends BaseModel<ChangeEdits> {
  @Field(() => String, {
    description: 'The type name of the entity being edited (e.g. Item, Component)',
  })
  entityName!: string

  @Field(() => ID, { nullable: true })
  id?: string

  @Field(() => EditModel, {
    nullable: true,
    description: 'The state of the entity before this edit',
  })
  @Transform(transformUnion('entityName'))
  original?: typeof EditModel

  @Field(() => EditModel, {
    nullable: true,
    description: 'The proposed state of the entity after this edit',
  })
  @Transform(transformUnion('entityName'))
  changes?: typeof EditModel

  @Field(() => JSONObjectResolver, {
    nullable: true,
    description: 'Raw field values for creating a new entity',
  })
  createChanges?: Record<string, any>

  @Field(() => JSONObjectResolver, {
    nullable: true,
    description: 'Raw field values for updating an existing entity',
  })
  updateChanges?: Record<string, any>

  transform(entity: ChangeEdits) {
    this.id = entity.entityID
  }
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

  transform(entity: any) {
    this.id = entity.id
  }
}

@ObjectType()
export class ChangeEditsPage extends Paginated(Edit) {}

@ObjectType({ description: 'A proposed or merged set of edits to one or more data models' })
export class Change extends IDCreatedUpdated<ChangeEntity> {
  @Field(() => String, { nullable: true })
  title?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => ChangeStatus)
  status!: ChangeStatus & {}

  @Field(() => User, { description: 'The user who created this change' })
  user!: User & {}

  @Field(() => ChangeEditsPage, {
    description: 'The individual entity edits included in this change',
  })
  edits!: ChangeEditsPage

  @Field(() => SourcesPage, { description: 'Source references supporting this change' })
  sources!: SourcesPage & {}
}

@ObjectType()
export class ChangesPage extends Paginated(Change) {}

@ArgsType()
export class ChangesArgs extends PaginationBasicArgs {
  static schema = PaginationBasicArgs.schema.extend({
    status: z.enum(ChangeStatus).optional(),
    userID: z.string().optional(),
  })

  @Field(() => ChangeStatus, { nullable: true })
  status?: ChangeStatus

  @Field(() => ID, { nullable: true })
  userID?: string

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
  id!: string

  @Field(() => String, { nullable: true })
  title?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => ChangeStatus, { nullable: true })
  status?: ChangeStatus & {}

  @Field(() => [ID], { nullable: true })
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
