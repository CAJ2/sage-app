import { ArgsType, Field, ID, InputType, ObjectType } from '@nestjs/graphql'
import { Transform, Type } from 'class-transformer'
import { IsOptional, IsUrl, MaxLength, Validate } from 'class-validator'
import { JSONObjectResolver } from 'graphql-scalars'
import { DateTime } from 'luxon'
import { z } from 'zod'

import { ChangeInputWithLang } from '@src/changes/change-ext.model'
import { Change } from '@src/changes/change.model'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { translate } from '@src/common/i18n'
import { IsNanoID } from '@src/common/validator.model'
import { type JSONObject } from '@src/common/z.schema'
import {
  BaseModel,
  IDCreatedUpdated,
  registerModel,
  TranslatedInput,
} from '@src/graphql/base.model'
import { Named } from '@src/graphql/interfaces.model'
import { Paginated, PaginationBasicArgs } from '@src/graphql/paginated'
import { Component } from '@src/process/component.model'
import { StreamScore } from '@src/process/stream.model'
import { TagPage } from '@src/process/tag.model'
import { Org } from '@src/users/org.model'
import { User } from '@src/users/users.model'

import { ItemsPage } from './item.model'
import {
  VariantComponentUnitSchema,
  Variant as VariantEntity,
  VariantsComponents,
  VariantsOrgs,
} from './variant.entity'

@ObjectType({
  implements: () => [Named],
  description: 'A specific variant or SKU of a product item, composed of physical components',
})
export class Variant extends IDCreatedUpdated<VariantEntity> implements Named {
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
  imageURL?: string

  @Field(() => ItemsPage, { description: 'Product items this variant belongs to' })
  items!: ItemsPage

  @Field(() => VariantOrgsPage, {
    description: 'Organizations associated with this variant (e.g. manufacturer, importer)',
  })
  orgs!: VariantOrgsPage & {}

  @Field(() => TagPage, { description: 'Metadata tags applied to this variant' })
  tags!: TagPage

  @Field(() => StreamScore, {
    nullable: true,
    description: 'Aggregated recyclability score for this variant',
  })
  recycleScore?: StreamScore

  @Field(() => VariantComponentsPage, {
    description: 'Physical components that make up this variant',
  })
  components!: VariantComponentsPage & {}

  @Field(() => [VariantHistory], { description: 'Audit history of changes to this variant' })
  history: VariantHistory[] = []
}
registerModel('Variant', Variant)

@ObjectType()
export class VariantHistory extends BaseModel<any> {
  @Field(() => Variant)
  variant!: Variant

  @Field(() => LuxonDateTimeResolver)
  datetime!: DateTime

  @Field(() => User)
  user!: User & {}

  @Field(() => Variant, { nullable: true })
  original?: Variant

  @Field(() => Variant, { nullable: true })
  changes?: Variant
}

@ObjectType({
  description:
    'An organization associated with a variant and its role (e.g. manufacturer, importer)',
})
export class VariantOrg extends BaseModel<VariantsOrgs> {
  @Field(() => Org)
  @Type(() => Org)
  org!: Org & {}

  @Field(() => String, {
    nullable: true,
    description: "The organization's role for this variant (e.g. manufacturer, importer)",
  })
  role?: string
}

@ObjectType({ description: 'A physical component within a variant, with its quantity' })
export class VariantComponent extends BaseModel<VariantsComponents> {
  @Field(() => Component)
  @Type(() => Component)
  component!: Component & {}

  @Field(() => Number, { nullable: true, description: 'Quantity of this component in the variant' })
  quantity?: number

  @Field(() => String, {
    nullable: true,
    description: 'Unit of measurement for the component quantity',
  })
  unit?: z.infer<typeof VariantComponentUnitSchema>
}

@ObjectType()
export class VariantsPage extends Paginated(Variant) {}

@ObjectType()
export class VariantOrgsPage extends Paginated(VariantOrg) {}

@ObjectType()
export class VariantComponentsPage extends Paginated(VariantComponent) {}

@ArgsType()
export class VariantsArgs extends PaginationBasicArgs {}

@ArgsType()
export class VariantComponentsArgs extends PaginationBasicArgs {
  orderBy(): string[] {
    return ['component']
  }
}

@ArgsType()
export class VariantOrgsArgs extends PaginationBasicArgs {
  orderBy(): string[] {
    return ['org']
  }
}

@ArgsType()
export class VariantTagsArgs extends PaginationBasicArgs {}

@ArgsType()
export class VariantItemsArgs extends PaginationBasicArgs {}

@ArgsType()
export class VariantRecycleArgs {
  @Field(() => ID, { nullable: true })
  regionID?: string
}

@InputType()
export class VariantItemsInput {
  @Field(() => ID)
  id!: string
}

@InputType()
export class VariantOrgsInput {
  @Field(() => ID)
  id!: string
}

@InputType()
export class VariantTagsInput {
  @Field(() => ID)
  @Validate(IsNanoID)
  id!: string

  @Field(() => JSONObjectResolver, { nullable: true })
  meta?: JSONObject
}

@InputType()
export class VariantRegionsInput {
  @Field(() => ID)
  id!: string
}

@InputType()
export class VariantComponentsInput {
  @Field(() => ID)
  id!: string

  @Field(() => Number, { nullable: true, description: 'Quantity of this component in the variant' })
  quantity?: number

  @Field(() => String, {
    nullable: true,
    description: 'Unit of measurement for the component quantity',
  })
  unit?: z.infer<typeof VariantComponentUnitSchema>
}

@InputType()
export class CreateVariantInput extends ChangeInputWithLang {
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

  @Field(() => [VariantItemsInput], { nullable: true })
  items?: VariantItemsInput[]

  @Field(() => VariantRegionsInput, { nullable: true })
  region?: VariantRegionsInput

  @Field(() => [VariantRegionsInput], { nullable: true })
  regions?: VariantRegionsInput[]

  @Field(() => String, {
    nullable: true,
    description: 'Manufacturer or product code for this variant',
  })
  code?: string

  @Field(() => [VariantOrgsInput], { nullable: true })
  orgs?: VariantOrgsInput[]

  @Field(() => [VariantTagsInput], { nullable: true })
  tags?: VariantTagsInput[]

  @Field(() => [VariantComponentsInput], { nullable: true })
  components?: VariantComponentsInput[]
}

@InputType()
export class UpdateVariantInput extends ChangeInputWithLang {
  @Field(() => ID)
  id!: string

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

  @Field(() => [VariantItemsInput], { nullable: true })
  items?: VariantItemsInput[]

  @Field(() => [VariantItemsInput], { nullable: true })
  addItems?: VariantItemsInput[]

  @Field(() => [ID], { nullable: true })
  removeItems?: string[]

  @Field(() => VariantRegionsInput, { nullable: true })
  region?: VariantRegionsInput

  @Field(() => [VariantRegionsInput], { nullable: true })
  addRegions?: VariantRegionsInput[]

  @Field(() => [ID], { nullable: true })
  removeRegions?: string[]

  @Field(() => String, { nullable: true })
  code?: string

  @Field(() => [VariantOrgsInput], { nullable: true })
  orgs?: VariantOrgsInput[]

  @Field(() => [VariantOrgsInput], { nullable: true })
  addOrgs?: VariantOrgsInput[]

  @Field(() => [ID], { nullable: true })
  removeOrgs?: string[]

  @Field(() => [VariantTagsInput], { nullable: true })
  tags?: VariantTagsInput[]

  @Field(() => [VariantTagsInput], { nullable: true })
  addTags?: VariantTagsInput[]

  @Field(() => [ID], { nullable: true })
  removeTags?: string[]

  @Field(() => [VariantComponentsInput], { nullable: true })
  components?: VariantComponentsInput[]

  @Field(() => [VariantComponentsInput], { nullable: true })
  addComponents?: VariantComponentsInput[]

  @Field(() => [ID], { nullable: true })
  removeComponents?: string[]
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
