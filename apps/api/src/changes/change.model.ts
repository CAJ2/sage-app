import { ArgsType, Field, ID, InputType, ObjectType } from '@nestjs/graphql'
import { Transform } from 'class-transformer'
import { JSONObjectResolver } from 'graphql-scalars'
import { z } from 'zod/v4'

import { SourcesPage } from '@src/changes/source.model'
import { transformUnion } from '@src/common/transform'
import { BaseModel, IDCreatedUpdated } from '@src/graphql/base.model'
import { OrderDirection, Paginated, PaginationBasicArgs } from '@src/graphql/paginated'
import { User } from '@src/users/users.model'

import { ChangeEdits, Change as ChangeEntity, ChangeStatus } from './change.entity'
import { EditModel, EditModelType } from './change.enum'

@ObjectType()
export class Edit extends BaseModel<ChangeEdits> {
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
  static schema = z.object({
    id: z.nanoid(),
    title: z.string().max(1000).optional(),
    description: z.string().max(100_000).optional(),
    status: z.enum(ChangeStatus).optional(),
    sources: z.array(z.nanoid()).optional(),
  })

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
