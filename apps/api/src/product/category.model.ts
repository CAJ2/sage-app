import { ArgsType, Field, ID, InputType, ObjectType } from '@nestjs/graphql'
import { Change, ChangeInputWithLang } from '@src/changes/change.model'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { translate } from '@src/db/i18n'
import { CreatedUpdated, registerModel } from '@src/graphql/base.model'
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

  @Field(() => String, { nullable: true })
  @Transform(translate)
  @IsOptional()
  @MaxLength(1024)
  desc_short?: string

  @Field(() => String, { nullable: true })
  @Transform(translate)
  desc?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  image_url?: string

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
export class CreateCategoryInput extends ChangeInputWithLang() {
  @Field(() => String)
  @MaxLength(1024)
  name!: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @MaxLength(1024)
  desc_short?: string

  @Field(() => String, { nullable: true })
  desc?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  image_url?: string
}

@InputType()
export class UpdateCategoryInput extends ChangeInputWithLang() {
  @Field(() => ID)
  id!: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @MaxLength(1024)
  name?: string

  @Field(() => String, { nullable: true })
  desc?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  image_url?: string
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
