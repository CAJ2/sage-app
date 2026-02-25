import { ArgsType, Field, ID, InputType, ObjectType } from '@nestjs/graphql'
import { Transform } from 'class-transformer'
import { IsOptional, MaxLength } from 'class-validator'
import { DateTime } from 'luxon'

import { ChangeInputWithLang } from '@src/changes/change-ext.model'
import { Change } from '@src/changes/change.model'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { translate } from '@src/common/i18n'
import {
  BaseModel,
  CreatedUpdated,
  registerModel,
  TranslatedInput,
  TranslatedOutput,
} from '@src/graphql/base.model'
import { Named } from '@src/graphql/interfaces.model'
import { Paginated, PaginationBasicArgs } from '@src/graphql/paginated'
import { Category as CategoryEntity } from '@src/product/category.entity'
import { ItemsPage } from '@src/product/item.model'
import { User } from '@src/users/users.model'

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

  @Field(() => [CategoryHistory], { description: 'Audit history of changes to this category' })
  history: CategoryHistory[] = []
}
registerModel('Category', Category)

@ObjectType()
export class CategoryHistory extends BaseModel<any> {
  @Field(() => Category)
  category!: Category

  @Field(() => LuxonDateTimeResolver)
  datetime!: DateTime

  @Field(() => User)
  user!: User & {}

  @Field(() => Category, { nullable: true })
  original?: Category

  @Field(() => Category, { nullable: true })
  changes?: Category
}

@ObjectType()
export class CategoriesPage extends Paginated(Category) {}

@ArgsType()
export class CategoriesArgs extends PaginationBasicArgs {}

@ArgsType()
export class CategoryItemsArgs extends PaginationBasicArgs {}

@InputType()
export class CreateCategoryInput extends ChangeInputWithLang {
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
