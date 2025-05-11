import { ArgsType, Field, ID, InputType, ObjectType } from '@nestjs/graphql'
import { Change, ChangeInputWithLang } from '@src/changes/change.model'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { IsNanoID } from '@src/common/validator.model'
import { translate } from '@src/db/i18n'
import { IDCreatedUpdated, TranslatedInput } from '@src/graphql/base.model'
import { Paginated, PaginationBasicArgs } from '@src/graphql/paginated'
import { ComponentsPage } from '@src/process/component.model'
import { TagPage } from '@src/process/tag.model'
import { OrgsPage } from '@src/users/org.model'
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
import { ItemsPage } from './item.model'
import { Variant as VariantEntity } from './variant.entity'

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

  @Field(() => ItemsPage)
  items!: ItemsPage

  @Field(() => OrgsPage)
  orgs!: OrgsPage

  @Field(() => TagPage)
  tags!: TagPage

  @Field(() => ComponentsPage)
  components!: ComponentsPage & {}
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

@ArgsType()
export class VariantOrgsArgs extends PaginationBasicArgs {}

@ArgsType()
export class VariantTagsArgs extends PaginationBasicArgs {}

@ArgsType()
export class VariantItemsArgs extends PaginationBasicArgs {}

@InputType()
export class VariantItemsInput {
  @Field(() => ID)
  @Validate(IsNanoID)
  id!: string
}

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
export class VariantRegionsInput {
  @Field(() => ID)
  @Validate(IsNanoID)
  id!: string
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
  @Field(() => String, { nullable: true })
  @IsOptional()
  @MaxLength(1000)
  name?: string

  @Field(() => [TranslatedInput], { nullable: true })
  @IsOptional()
  name_tr?: TranslatedInput[]

  @Field(() => String, { nullable: true })
  @IsOptional()
  @MaxLength(100_000)
  desc?: string

  @Field(() => [TranslatedInput], { nullable: true })
  @IsOptional()
  desc_tr?: TranslatedInput[]

  @Field(() => [VariantItemsInput], { nullable: true })
  @IsOptional()
  items?: VariantItemsInput[]

  @Field(() => ID, { nullable: true })
  @IsOptional()
  region_id?: string

  @Field(() => [VariantRegionsInput], { nullable: true })
  @IsOptional()
  regions?: VariantRegionsInput[]

  @Field(() => String, { nullable: true })
  @IsOptional()
  @MaxLength(128)
  code?: string

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

  @Field(() => [TranslatedInput], { nullable: true })
  @IsOptional()
  name_tr?: TranslatedInput[]

  @Field(() => String, { nullable: true })
  @IsOptional()
  @MaxLength(100_000)
  desc?: string

  @Field(() => [TranslatedInput], { nullable: true })
  @IsOptional()
  desc_tr?: TranslatedInput[]

  @Field(() => [VariantItemsInput], { nullable: true })
  @IsOptional()
  add_items?: VariantItemsInput[]

  @Field(() => [VariantItemsInput], { nullable: true })
  @IsOptional()
  remove_items?: VariantItemsInput[]

  @Field(() => ID, { nullable: true })
  @IsOptional()
  region_id?: string

  @Field(() => [VariantRegionsInput], { nullable: true })
  @IsOptional()
  add_regions?: VariantRegionsInput[]

  @Field(() => [VariantRegionsInput], { nullable: true })
  @IsOptional()
  remove_regions?: VariantRegionsInput[]

  @Field(() => String, { nullable: true })
  @IsOptional()
  @MaxLength(128)
  code?: string

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
