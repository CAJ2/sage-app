import { Field, ID, ObjectType } from '@nestjs/graphql'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { IsNanoID } from '@src/common/validator.model'
import { CreatedUpdated } from '@src/graphql/created-updated.model'
import { IsUrl, MaxLength, Validate } from 'class-validator'
import { DateTime } from 'luxon'
import { Item } from './item.model'

@ObjectType()
export class Category extends CreatedUpdated {
  @Field(() => ID)
  @Validate(IsNanoID)
  id: string = ''

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
