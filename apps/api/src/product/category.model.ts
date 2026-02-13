import { ArgsType, Field, ID, InputType, ObjectType } from '@nestjs/graphql'
import { ChangeInputWithLang } from '@src/changes/change-ext.model'
import { Change } from '@src/changes/change.model'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { translate } from '@src/common/i18n'
import {
  CreatedUpdated,
  registerModel,
  TranslatedInput,
  TranslatedOutput,
} from '@src/graphql/base.model'
import { Named } from '@src/graphql/interfaces.model'
import { Paginated, PaginationBasicArgs } from '@src/graphql/paginated'
import { User } from '@src/users/users.model'
import { Transform } from 'class-transformer'
import { IsOptional, MaxLength } from 'class-validator'
import { DateTime } from 'luxon'
import { Category as CategoryEntity } from './category.entity'
import { ItemsPage } from './item.model'

@ObjectType({
  implements: () => [Named],
})
export class Category extends CreatedUpdated<CategoryEntity> implements Named {
  @Field(() => ID)
  id!: string

  @Field(() => String)
  @Transform(translate)
  @MaxLength(1024)
  name!: string

  @Field(() => [TranslatedOutput], { nullable: true })
  nameTr?: TranslatedOutput[]

  @Field(() => String, { nullable: true })
  @Transform(translate)
  @IsOptional()
  @MaxLength(1024)
  descShort?: string

  @Field(() => [TranslatedOutput], { nullable: true })
  descShortTr?: TranslatedOutput[]

  @Field(() => String, { nullable: true })
  @Transform(translate)
  desc?: string

  @Field(() => [TranslatedOutput], { nullable: true })
  descTr?: TranslatedOutput[]

  @Field(() => String, { nullable: true })
  @IsOptional()
  imageURL?: string

  @Field(() => CategoriesPage)
  parents!: CategoriesPage & {}

  @Field(() => CategoriesPage)
  children!: CategoriesPage & {}

  @Field(() => CategoriesPage)
  ancestors!: CategoriesPage & {}

  @Field(() => CategoriesPage)
  descendants!: CategoriesPage & {}

  @Field(() => ItemsPage)
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
  @Field(() => String, { nullable: true })
  @IsOptional()
  @MaxLength(1024)
  name?: string

  @Field(() => [TranslatedInput], { nullable: true })
  nameTr?: TranslatedInput[]

  @Field(() => String, { nullable: true })
  @IsOptional()
  @MaxLength(1024)
  descShort?: string

  @Field(() => [TranslatedInput], { nullable: true })
  descShortTr?: TranslatedInput[]

  @Field(() => String, { nullable: true })
  @IsOptional()
  desc?: string

  @Field(() => [TranslatedInput], { nullable: true })
  descTr?: TranslatedInput[]

  @Field(() => String, { nullable: true })
  @IsOptional()
  imageURL?: string
}

@InputType()
export class UpdateCategoryInput extends ChangeInputWithLang {
  @Field(() => ID)
  id!: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @MaxLength(1024)
  name?: string

  @Field(() => [TranslatedInput], { nullable: true })
  nameTr?: TranslatedInput[]

  @Field(() => String, { nullable: true })
  @IsOptional()
  @MaxLength(1024)
  descShort?: string

  @Field(() => [TranslatedInput], { nullable: true })
  descShortTr?: TranslatedInput[]

  @Field(() => String, { nullable: true })
  @IsOptional()
  desc?: string

  @Field(() => [TranslatedInput], { nullable: true })
  descTr?: TranslatedInput[]

  @Field(() => String, { nullable: true })
  @IsOptional()
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
