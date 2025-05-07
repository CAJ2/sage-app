import { ArgsType, Field, ID, InputType, ObjectType } from '@nestjs/graphql'
import { Change, ChangeInputWithLang } from '@src/changes/change.model'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { IsNanoID } from '@src/common/validator.model'
import { translate } from '@src/db/i18n'
import { IDCreatedUpdated } from '@src/graphql/base.model'
import { Paginated, PaginationBasicArgs } from '@src/graphql/paginated'
import { TagPage } from '@src/process/tag.model'
import { Transform } from 'class-transformer'
import { IsOptional, IsUrl, MaxLength, Validate } from 'class-validator'
import { JSONObjectResolver } from 'graphql-scalars'
import { DateTime } from 'luxon'
import { CategoriesPage } from './category.model'
import { Item as ItemEntity } from './item.entity'
import { VariantsPage } from './variant.model'

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

  @Field(() => CategoriesPage)
  categories!: CategoriesPage

  @Field(() => TagPage)
  tags!: TagPage

  @Field(() => VariantsPage)
  variants!: VariantsPage & {}
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

@ArgsType()
export class ItemTagsArgs extends PaginationBasicArgs {}

@ArgsType()
export class ItemVariantsArgs extends PaginationBasicArgs {}

@InputType()
export class ItemCategoriesInput {
  @Field(() => ID)
  @Validate(IsNanoID)
  id!: string
}

@InputType()
export class ItemTagsInput {
  @Field(() => ID)
  @Validate(IsNanoID)
  id!: string

  @Field(() => JSONObjectResolver, { nullable: true })
  @IsOptional()
  meta?: Record<string, any>
}

@InputType()
export class CreateItemInput extends ChangeInputWithLang() {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @MaxLength(1000)
  name?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @MaxLength(100_000)
  desc?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUrl()
  image_url?: string

  @Field(() => [ItemCategoriesInput], { nullable: true })
  categories?: ItemCategoriesInput[]

  @Field(() => [ItemTagsInput], { nullable: true })
  tags?: ItemTagsInput[]
}

@InputType()
export class UpdateItemInput extends ChangeInputWithLang() {
  @Field(() => ID)
  @Validate(IsNanoID)
  id!: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @MaxLength(1000)
  name?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @MaxLength(100_000)
  desc?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUrl()
  image_url?: string

  @Field(() => [ItemCategoriesInput], { nullable: true })
  add_categories?: ItemCategoriesInput[]

  @Field(() => [ItemCategoriesInput], { nullable: true })
  remove_categories?: ItemCategoriesInput[]

  @Field(() => [ItemTagsInput], { nullable: true })
  add_tags?: ItemTagsInput[]

  @Field(() => [ItemTagsInput], { nullable: true })
  remove_tags?: ItemTagsInput[]
}

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
