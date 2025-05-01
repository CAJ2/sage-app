import { ArgsType, Field, ID, InputType, ObjectType } from '@nestjs/graphql'
import { Change, ChangeInputWithLang } from '@src/changes/change.model'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { IsNanoID } from '@src/common/validator.model'
import { translate } from '@src/db/i18n'
import { IDCreatedUpdated } from '@src/graphql/base.model'
import { Paginated, PaginationBasicArgs } from '@src/graphql/paginated'
import { Transform } from 'class-transformer'
import {
  IsOptional,
  IsPositive,
  IsUrl,
  MaxLength,
  Validate,
} from 'class-validator'
import { JSONObjectResolver } from 'graphql-scalars'
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
  @Transform(translate)
  @IsOptional()
  @MaxLength(1024)
  name?: string

  @Field(() => String, { nullable: true })
  @Transform(translate)
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
export class VariantsPage extends Paginated(Variant) {}

@ArgsType()
export class VariantsArgs extends PaginationBasicArgs {}

@ArgsType()
export class VariantComponentsArgs extends PaginationBasicArgs {}

@InputType()
export class VariantOrgsInput {
  @Field(() => ID)
  @Validate(IsNanoID)
  id!: string
}

@InputType()
export class VariantTagsInput {
  @Field(() => ID)
  @Validate(IsNanoID)
  id!: string

  @Field(() => JSONObjectResolver, { nullable: true })
  @IsOptional()
  meta?: Record<string, any>
}

@InputType()
export class VariantComponentsInput {
  @Field(() => ID)
  @Validate(IsNanoID)
  id!: string

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsPositive()
  quantity?: number

  @Field(() => String, { nullable: true })
  @IsOptional()
  @MaxLength(10)
  unit?: string
}

@InputType()
export class CreateVariantInput extends ChangeInputWithLang() {
  @Field(() => String)
  @MaxLength(1000)
  name!: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @MaxLength(100_000)
  desc?: string

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @Validate(IsNanoID)
  item_id?: string

  @Field(() => ID, { nullable: true })
  @IsOptional()
  region_id?: string

  @Field(() => [VariantOrgsInput], { nullable: true })
  @IsOptional()
  orgs?: VariantOrgsInput[]

  @Field(() => [VariantTagsInput], { nullable: true })
  @IsOptional()
  tags?: VariantTagsInput[]

  @Field(() => [VariantComponentsInput], { nullable: true })
  @IsOptional()
  components?: VariantComponentsInput[]
}

@InputType()
export class UpdateVariantInput extends ChangeInputWithLang() {
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

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @Validate(IsNanoID)
  item_id?: string

  @Field(() => ID, { nullable: true })
  @IsOptional()
  region_id?: string

  @Field(() => [VariantOrgsInput], { nullable: true })
  @IsOptional()
  add_orgs?: VariantOrgsInput[]

  @Field(() => [VariantOrgsInput], { nullable: true })
  @IsOptional()
  remove_orgs?: VariantOrgsInput[]

  @Field(() => [VariantTagsInput], { nullable: true })
  @IsOptional()
  add_tags?: VariantTagsInput[]

  @Field(() => [VariantTagsInput], { nullable: true })
  @IsOptional()
  remove_tags?: VariantTagsInput[]

  @Field(() => [VariantComponentsInput], { nullable: true })
  @IsOptional()
  add_components?: VariantComponentsInput[]

  @Field(() => [VariantComponentsInput], { nullable: true })
  @IsOptional()
  remove_components?: VariantComponentsInput[]
}

@ObjectType()
export class CreateVariantOutput {
  @Field(() => Change, { nullable: true })
  change?: Change & {}

  @Field(() => Variant, { nullable: true })
  variant?: Variant & {}
}

@ObjectType()
export class UpdateVariantOutput {
  @Field(() => Change, { nullable: true })
  change?: Change & {}

  @Field(() => Variant, { nullable: true })
  variant?: Variant & {}
}
