import { Field, ObjectType } from '@nestjs/graphql'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { IDCreatedUpdated } from '@src/graphql/base.model'
import { IsUrl, MaxLength } from 'class-validator'
import { DateTime } from 'luxon'
import { Category as CategoryEntity } from './category.entity'
import { Item } from './item.model'

@ObjectType()
export class Category extends IDCreatedUpdated<CategoryEntity> {
  @Field(() => String, { nullable: true })
  @MaxLength(1024)
  name?: string

  @Field(() => String, { nullable: true })
  @MaxLength(1024)
  desc_short?: string

  @Field(() => String, { nullable: true })
  desc?: string

  @Field(() => String, { nullable: true })
  @IsUrl()
  image_url?: string

  @Field(() => [Item])
  items: Item[] = []

  @Field(() => [CategoryHistory])
  history: CategoryHistory[] = []
}

@ObjectType()
export class CategoryHistory {
  @Field(() => String)
  category_id!: string

  @Field(() => LuxonDateTimeResolver)
  datetime!: DateTime

  @Field(() => String, { nullable: true })
  original?: string

  @Field(() => String, { nullable: true })
  changes?: string
}
