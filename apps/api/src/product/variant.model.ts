import { ArgsType, Field, ObjectType } from '@nestjs/graphql'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { IDCreatedUpdated } from '@src/graphql/base.model'
import { Paginated, PaginationBasicArgs } from '@src/graphql/paginated'
import { IsOptional, IsUrl, MaxLength } from 'class-validator'
import { DateTime } from 'luxon'
import { Item } from './item.model'
import { Variant as VariantEntity } from './variant.entity'

@ObjectType()
export class VariantTag {
  @Field(() => String)
  tag_name: string = ''
}

@ObjectType()
export class Variant extends IDCreatedUpdated<VariantEntity> {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @MaxLength(1024)
  name?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @MaxLength(1024)
  desc_short?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  desc?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUrl({ protocols: ['https'] })
  image_url?: string

  @Field(() => [Item])
  items: Item[] = []

  @Field(() => [VariantTag])
  tags: VariantTag[] = []

  @Field(() => [VariantHistory])
  history: VariantHistory[] = []
}

@ObjectType()
export class VariantHistory {
  @Field(() => String)
  variant_id!: string

  @Field(() => LuxonDateTimeResolver)
  datetime!: DateTime

  @Field(() => String, { nullable: true })
  original?: string

  @Field(() => String, { nullable: true })
  changes?: string
}

@ObjectType()
export class VariantPage extends Paginated(Variant) {}

@ArgsType()
export class VariantsComponentsArgs extends PaginationBasicArgs {}
