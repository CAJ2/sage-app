import { ArgsType, Field, ID, InputType, ObjectType } from '@nestjs/graphql'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { CreatedUpdated, InputWithLang } from '@src/graphql/base.model'
import { Paginated, PaginationBasicArgs } from '@src/graphql/paginated'
import { User } from '@src/users/users.model'
import { IsOptional, IsUrl, MaxLength } from 'class-validator'
import { DateTime } from 'luxon'
import { Category as CategoryEntity } from './category.entity'
import { Item } from './item.model'

@ObjectType()
export class Category extends CreatedUpdated<CategoryEntity> {
  @Field(() => ID)
  id!: string

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
export class CreateCategoryInput extends InputWithLang {
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
