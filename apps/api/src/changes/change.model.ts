import {
  ArgsType,
  createUnionType,
  Field,
  ID,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql'
import { SourcesPage } from '@src/changes/source.model'
import { IsNanoID } from '@src/common/validator.model'
import { Place } from '@src/geo/place.model'
import { Region } from '@src/geo/region.model'
import { IDCreatedUpdated } from '@src/graphql/base.model'
import { Paginated, PaginationBasicArgs } from '@src/graphql/paginated'
import { Component } from '@src/process/component.model'
import { Material } from '@src/process/material.model'
import { Process } from '@src/process/process.model'
import { Category } from '@src/product/category.model'
import { Item } from '@src/product/item.model'
import { Variant } from '@src/product/variant.model'
import { User } from '@src/users/users.model'
import { IsEnum, IsOptional, MaxLength, Validate } from 'class-validator'
import { JSONObjectResolver } from 'graphql-scalars'
import { Change as ChangeEntity, ChangeStatus } from './change.entity'

registerEnumType(ChangeStatus, {
  name: 'ChangeStatus',
  description: 'Status of a change',
})

export const EditModel = createUnionType({
  name: 'EditModel',
  types: () =>
    [
      Place,
      Region,
      Component,
      Material,
      Process,
      Category,
      Item,
      Variant,
    ] as const,
})

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
  status!: ChangeStatus

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
  status?: ChangeStatus

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
  status?: ChangeStatus

  @Field(() => [ID], { nullable: true })
  @IsOptional()
  sources?: string[]

  @Field(() => JSONObjectResolver, { nullable: true })
  @IsOptional()
  metadata?: Record<string, any>
}
