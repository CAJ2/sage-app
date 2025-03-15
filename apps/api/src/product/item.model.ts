import { Field, ObjectType } from '@nestjs/graphql'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { IDCreatedUpdated } from '@src/graphql/base.model'
import { IsUrl, MaxLength } from 'class-validator'
import { DateTime } from 'luxon'
import { Category } from './category.model'
import { Item as ItemEntity } from './item.entity'
import { Variant } from './variant.model'

@ObjectType()
export class Item extends IDCreatedUpdated<ItemEntity> {
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

  @Field(() => [Category])
  categories: Category[] = []

  @Field(() => [Variant])
  variants: Variant[] = []

  @Field(() => [ItemHistory])
  history: ItemHistory[] = []
}

@ObjectType()
export class ItemHistory {
  @Field(() => String)
  item_id!: string

  @Field(() => LuxonDateTimeResolver)
  datetime!: DateTime

  @Field(() => String, { nullable: true })
  original?: string

  @Field(() => String, { nullable: true })
  changes?: string
}
