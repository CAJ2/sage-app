import { ArgsType, Field, ID, InputType, ObjectType } from '@nestjs/graphql'
import { Transform } from 'class-transformer'
import { IsOptional, MaxLength } from 'class-validator'
import { DateTime } from 'luxon'
import { z } from 'zod/v4'

import { ChangeInputWithLang } from '@src/changes/change-ext.model'
import { Change } from '@src/changes/change.model'
import { ImageOrIconSchema } from '@src/common/base.schema'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { translate, TrArraySchema } from '@src/common/i18n'
import {
  CreatedUpdated,
  registerModel,
  TranslatedInput,
  TranslatedOutput,
} from '@src/graphql/base.model'
import { Named } from '@src/graphql/interfaces.model'
import { Paginated, PaginationBasicArgs } from '@src/graphql/paginated'
import { User } from '@src/users/users.model'

import { Category as CategoryEntity } from './category.entity'
import { ItemsPage } from './item.model'

@ObjectType({
  implements: () => [Named],
  description: 'A hierarchical category for classifying product items',
})
export class Category extends CreatedUpdated<CategoryEntity> implements Named {
  @Field(() => ID)
  id!: string

  @Field(() => String)
  @Transform(translate)
  @MaxLength(1024)
  name!: string

  @Field(() => [TranslatedOutput], {
    nullable: true,
    description: 'Translated versions of the name',
  })
  nameTr?: TranslatedOutput[]

  @Field(() => String, { nullable: true, description: 'A short summary description' })
  @Transform(translate)
  @IsOptional()
  @MaxLength(1024)
  descShort?: string

  @Field(() => [TranslatedOutput], {
    nullable: true,
    description: 'Translated versions of the short description',
  })
  descShortTr?: TranslatedOutput[]

  @Field(() => String, { nullable: true })
  @Transform(translate)
  desc?: string

  @Field(() => [TranslatedOutput], {
    nullable: true,
    description: 'Translated versions of the description',
  })
  descTr?: TranslatedOutput[]

  @Field(() => String, { nullable: true })
  @IsOptional()
  imageURL?: string

  @Field(() => CategoriesPage, { description: 'Direct parent categories in the hierarchy' })
  parents!: CategoriesPage & {}

  @Field(() => CategoriesPage, { description: 'Direct child categories in the hierarchy' })
  children!: CategoriesPage & {}

  @Field(() => CategoriesPage, { description: 'All ancestor categories up the hierarchy tree' })
  ancestors!: CategoriesPage & {}

  @Field(() => CategoriesPage, { description: 'All descendant categories down the hierarchy tree' })
  descendants!: CategoriesPage & {}

  @Field(() => ItemsPage, { description: 'Items classified under this category' })
  items!: ItemsPage & {}
}
registerModel('Category', Category)

@ObjectType()
export class CategoryHistory {
  @Field(() => String)
  category_id!: string

  @Field(() => LuxonDateTimeResolver)
  datetime!: DateTime

  @Field(() => User)
  user!: User & {}

  @Field(() => String, { nullable: true })
  original?: string

  @Field(() => String, { nullable: true })
  changes?: string
}

@ObjectType()
export class CategoriesPage extends Paginated(Category) {}

@ArgsType()
export class CategoriesArgs extends PaginationBasicArgs {}

@ArgsType()
export class CategoryItemsArgs extends PaginationBasicArgs {}

@InputType()
export class CreateCategoryInput extends ChangeInputWithLang {
  static schema = ChangeInputWithLang.schema.extend({
    name: z.string().max(1024).optional(),
    nameTr: TrArraySchema,
    descShort: z.string().max(1024).optional(),
    descShortTr: TrArraySchema,
    desc: z.string().max(100_000).optional(),
    descTr: TrArraySchema,
    imageURL: ImageOrIconSchema.optional(),
  })

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => [TranslatedInput], { nullable: true })
  nameTr?: TranslatedInput[]

  @Field(() => String, { nullable: true })
  descShort?: string

  @Field(() => [TranslatedInput], { nullable: true })
  descShortTr?: TranslatedInput[]

  @Field(() => String, { nullable: true })
  desc?: string

  @Field(() => [TranslatedInput], { nullable: true })
  descTr?: TranslatedInput[]

  @Field(() => String, { nullable: true })
  imageURL?: string
}

@InputType()
export class UpdateCategoryInput extends ChangeInputWithLang {
  static schema = ChangeInputWithLang.schema.extend({
    id: z.nanoid(),
    name: z.string().max(1024).optional(),
    nameTr: TrArraySchema,
    descShort: z.string().max(1024).optional(),
    descShortTr: TrArraySchema,
    desc: z.string().max(100_000).optional(),
    descTr: TrArraySchema,
    imageURL: ImageOrIconSchema.optional(),
  })

  @Field(() => ID)
  id!: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => [TranslatedInput], { nullable: true })
  nameTr?: TranslatedInput[]

  @Field(() => String, { nullable: true })
  descShort?: string

  @Field(() => [TranslatedInput], { nullable: true })
  descShortTr?: TranslatedInput[]

  @Field(() => String, { nullable: true })
  desc?: string

  @Field(() => [TranslatedInput], { nullable: true })
  descTr?: TranslatedInput[]

  @Field(() => String, { nullable: true })
  imageURL?: string
}

@ObjectType()
export class CreateCategoryOutput {
  @Field(() => Change, { nullable: true })
  change?: Change & {}

  @Field(() => Category, { nullable: true })
  category?: Category
}

@ObjectType()
export class UpdateCategoryOutput {
  @Field(() => Change, { nullable: true })
  change?: Change & {}

  @Field(() => Category, { nullable: true })
  category?: Category
}
