import { ArgsType, Field, InputType, ObjectType } from '@nestjs/graphql'
import { Change, ChangeInputWithLang } from '@src/changes/change.model'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { translate } from '@src/db/i18n'
import { IDCreatedUpdated } from '@src/graphql/base.model'
import { Paginated, PaginationBasicArgs } from '@src/graphql/paginated'
import { Transform } from 'class-transformer'
import { IsUrl, MaxLength } from 'class-validator'
import { DateTime } from 'luxon'
import { Category } from './category.model'
import { Item as ItemEntity } from './item.entity'
import { Variant } from './variant.model'

@ObjectType()
export class Item extends IDCreatedUpdated<ItemEntity> {
  @Field(() => String, { nullable: true })
  @Transform(translate)
  @MaxLength(1024)
  name?: string

  @Field(() => String, { nullable: true })
  @Transform(translate)
  desc?: string

  @Field(() => String, { nullable: true })
  @IsUrl()
  image_url?: string

  @Field(() => [Category])
  categories: Category[] = []

  @Field(() => [Variant])
  variants: Variant[] = []
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

@ObjectType()
export class ItemsPage extends Paginated(Item) {}

@ArgsType()
export class ItemsArgs extends PaginationBasicArgs {}

@ArgsType()
export class ItemCategoriesArgs extends PaginationBasicArgs {}

@InputType()
export class CreateItemInput extends ChangeInputWithLang() {}

@InputType()
export class UpdateItemInput extends ChangeInputWithLang() {}

@ObjectType()
export class CreateItemOutput {
  @Field(() => Change, { nullable: true })
  change?: Change & {}

  @Field(() => Item, { nullable: true })
  item?: Item
}

@ObjectType()
export class UpdateItemOutput {
  @Field(() => Change, { nullable: true })
  change?: Change & {}

  @Field(() => Item, { nullable: true })
  item?: Item
}
