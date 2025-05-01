import { ArgsType, Field, ID, InputType, ObjectType } from '@nestjs/graphql'
import { Change, ChangeInputWithLang } from '@src/changes/change.model'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { translate } from '@src/db/i18n'
import { CreatedUpdated } from '@src/graphql/base.model'
import { Paginated, PaginationBasicArgs } from '@src/graphql/paginated'
import { User } from '@src/users/users.model'
import { Transform } from 'class-transformer'
import { IsOptional, IsUrl, MaxLength } from 'class-validator'
import { DateTime } from 'luxon'
import { Category as CategoryEntity } from './category.entity'
import { Item } from './item.model'

@ObjectType()
export class Category extends CreatedUpdated<CategoryEntity> {
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
  @IsUrl({ protocols: ['https', 'icon'] })
  image_url?: string

  @Field(() => CategoriesPage)
  ancestors!: CategoriesPage & {}

  @Field(() => CategoriesPage)
  descendants!: CategoriesPage & {}

  @Field(() => [Item])
  items: Item[] = []
}

@ObjectType()
export class CategoryHistory {
  @Field(() => String)
  category_id!: string

  @Field(() => LuxonDateTimeResolver)
  datetime!: DateTime

  @Field(() => User)
  user!: User

  @Field(() => String, { nullable: true })
  original?: string

  @Field(() => String, { nullable: true })
  changes?: string
}

@ObjectType()
export class CategoriesPage extends Paginated(Category) {}

@ArgsType()
export class CategoriesArgs extends PaginationBasicArgs {}

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
  @IsUrl({ protocols: ['https', 'icon'] })
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
  @IsUrl({ protocols: ['https', 'icon'] })
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
