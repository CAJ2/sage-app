import { ArgsType, Field, ID, InputType, ObjectType } from '@nestjs/graphql'
import { Transform } from 'class-transformer'
import { IsOptional, MaxLength } from 'class-validator'
import { JSONObjectResolver } from 'graphql-scalars'
import { DateTime } from 'luxon'
import { z } from 'zod/v4'

import { ChangeInputWithLang } from '@src/changes/change-ext.model'
import { Change } from '@src/changes/change.model'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { translate } from '@src/common/i18n'
import { type JSONObject, ZJSONObject } from '@src/common/z.schema'
import {
  BaseModel,
  IDCreatedUpdated,
  registerModel,
  TranslatedInput,
} from '@src/graphql/base.model'
import { Named } from '@src/graphql/interfaces.model'
import { Paginated, PaginationBasicArgs } from '@src/graphql/paginated'
import { TagPage } from '@src/process/tag.model'
import { User } from '@src/users/users.model'

import { CategoriesPage } from './category.model'
import { Item as ItemEntity } from './item.entity'
import { VariantsPage } from './variant.model'

@ObjectType({
  implements: () => [Named],
  description: 'A product or consumable item that can be categorized and have multiple variants',
})
export class Item extends IDCreatedUpdated<ItemEntity> implements Named {
  @Field(() => String, { nullable: true })
  @Transform(translate)
  @IsOptional()
  @MaxLength(1024)
  name?: string

  @Field(() => String, { nullable: true })
  @Transform(translate)
  desc?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  imageURL?: string

  @Field(() => CategoriesPage, { description: 'Categories this item belongs to' })
  categories!: CategoriesPage

  @Field(() => TagPage, { description: 'Metadata tags applied to this item' })
  tags!: TagPage

  @Field(() => VariantsPage, {
    description: 'Product variants of this item (e.g. specific SKUs or models)',
  })
  variants!: VariantsPage & {}

  @Field(() => [ItemHistory], { description: 'Audit history of changes to this item' })
  history: ItemHistory[] = []

  transform(entity: ItemEntity) {
    this.imageURL = entity.files?.thumbnail
  }
}
registerModel('Item', Item)

@ObjectType()
export class ItemHistory extends BaseModel<any> {
  @Field(() => String)
  item_id!: string

  @Field(() => LuxonDateTimeResolver)
  datetime!: DateTime

  @Field(() => User)
  user!: User & {}

  @Field(() => JSONObjectResolver, { nullable: true })
  original?: JSONObject

  @Field(() => JSONObjectResolver, { nullable: true })
  changes?: JSONObject
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
  static schema = z.object({
    id: z.nanoid(),
  })

  @Field(() => ID)
  id!: string
}

@InputType()
export class ItemTagsInput {
  static schema = z.object({
    id: z.nanoid(),
    meta: ZJSONObject.optional(),
  })

  @Field(() => ID)
  id!: string

  @Field(() => JSONObjectResolver, { nullable: true })
  meta?: JSONObject
}

@InputType()
export class CreateItemInput extends ChangeInputWithLang {
  static schema = ChangeInputWithLang.schema.extend({
    name: z.string().max(100).optional(),
    nameTr: TranslatedInput.schema.array().optional(),
    desc: z.string().max(100_000).optional(),
    descTr: TranslatedInput.schema.array().optional(),
    imageURL: z.string().max(1000).optional(),
    categories: ItemCategoriesInput.schema.array().optional(),
    tags: ItemTagsInput.schema.array().optional(),
  })

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => [TranslatedInput], { nullable: true })
  nameTr?: TranslatedInput[]

  @Field(() => String, { nullable: true })
  desc?: string

  @Field(() => [TranslatedInput], { nullable: true })
  descTr?: TranslatedInput[]

  @Field(() => String, { nullable: true })
  imageURL?: string

  @Field(() => [ItemCategoriesInput], { nullable: true })
  categories?: ItemCategoriesInput[]

  @Field(() => [ItemTagsInput], { nullable: true })
  tags?: ItemTagsInput[]
}

@InputType()
export class UpdateItemInput extends ChangeInputWithLang {
  static schema = ChangeInputWithLang.schema.extend({
    id: z.nanoid(),
    name: z.string().max(100).optional(),
    nameTr: TranslatedInput.schema.array().optional(),
    desc: z.string().max(100_000).optional(),
    descTr: TranslatedInput.schema.array().optional(),
    imageURL: z.string().max(1000).optional(),
    categories: ItemCategoriesInput.schema.array().optional(),
    addCategories: ItemCategoriesInput.schema.array().optional(),
    removeCategories: z.nanoid().array().optional(),
    tags: ItemTagsInput.schema.array().optional(),
    addTags: ItemTagsInput.schema.array().optional(),
    removeTags: z.nanoid().array().optional(),
  })

  @Field(() => ID)
  id!: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => [TranslatedInput], { nullable: true })
  nameTr?: TranslatedInput[]

  @Field(() => String, { nullable: true })
  desc?: string

  @Field(() => [TranslatedInput], { nullable: true })
  descTr?: TranslatedInput[]

  @Field(() => String, { nullable: true })
  imageURL?: string

  @Field(() => [ItemCategoriesInput], { nullable: true })
  categories?: ItemCategoriesInput[]

  @Field(() => [ItemCategoriesInput], { nullable: true })
  addCategories?: ItemCategoriesInput[]

  @Field(() => [ID], { nullable: true })
  removeCategories?: string[]

  @Field(() => [ItemTagsInput], { nullable: true })
  tags?: ItemTagsInput[]

  @Field(() => [ItemTagsInput], { nullable: true })
  addTags?: ItemTagsInput[]

  @Field(() => [ID], { nullable: true })
  removeTags?: string[]
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
