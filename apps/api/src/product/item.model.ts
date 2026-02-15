import { ArgsType, Field, ID, InputType, ObjectType } from '@nestjs/graphql'
import { ChangeInputWithLang } from '@src/changes/change-ext.model'
import { Change } from '@src/changes/change.model'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { translate } from '@src/common/i18n'
import { IsNanoID } from '@src/common/validator.model'
import { type JSONObject, ZJSONObject } from '@src/common/z.schema'
import { IDCreatedUpdated, registerModel, TranslatedInput } from '@src/graphql/base.model'
import { Named } from '@src/graphql/interfaces.model'
import { Paginated, PaginationBasicArgs } from '@src/graphql/paginated'
import { TagPage } from '@src/process/tag.model'
import { Transform } from 'class-transformer'
import { IsOptional, MaxLength, Validate } from 'class-validator'
import { JSONObjectResolver } from 'graphql-scalars'
import { DateTime } from 'luxon'
import { z } from 'zod/v4'

import { CategoriesPage } from './category.model'
import { Item as ItemEntity } from './item.entity'
import { VariantsPage } from './variant.model'

@ObjectType({
  implements: () => [Named],
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

  @Field(() => CategoriesPage)
  categories!: CategoriesPage

  @Field(() => TagPage)
  tags!: TagPage

  @Field(() => VariantsPage)
  variants!: VariantsPage & {}

  transform(entity: ItemEntity) {
    this.imageURL = entity.files?.thumbnail
  }
}
registerModel('Item', Item)

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
  static schema = ChangeInputWithLang.schema
    .extend({
      name: z.string().max(100).optional(),
      nameTr: TranslatedInput.schema.array().optional(),
      desc: z.string().max(100_000).optional(),
      descTr: TranslatedInput.schema.array().optional(),
      imageURL: z.string().max(1000).optional(),
      categories: ItemCategoriesInput.schema.array().optional(),
      tags: ItemTagsInput.schema.array().optional(),
    })
    .refine(
      (data) => {
        if (data.name && data.nameTr) return false
        if (!data.name && !data.nameTr) return false
        return true
      },
      {
        error: 'Either name or nameTr must be provided, but not both.',
      },
    )
    .refine(
      (data) => {
        if (data.desc && data.descTr) return false
        return true
      },
      {
        error: 'Either desc or descTr may be provided, but not both.',
      },
    )

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
  @Field(() => ID)
  @Validate(IsNanoID)
  id!: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @MaxLength(1000)
  name?: string

  @Field(() => [TranslatedInput], { nullable: true })
  nameTr?: TranslatedInput[]

  @Field(() => String, { nullable: true })
  @IsOptional()
  @MaxLength(100_000)
  desc?: string

  @Field(() => [TranslatedInput], { nullable: true })
  descTr?: TranslatedInput[]

  @Field(() => String, { nullable: true })
  @IsOptional()
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
