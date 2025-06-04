import { RegionIDSchema } from '@src/geo/region.model'
import { TranslatedInputSchema } from '@src/graphql/base.model'
import { ComponentIDSchema } from '@src/process/component.schema'
import { TagDefinitionIDSchema } from '@src/process/tag.model'
import { OrgIDSchema } from '@src/users/org.schema'
import { z } from 'zod/v4'
import { ItemIDSchema } from './item.schema'
import { VariantComponentUnitSchema } from './variant.entity'

export const VariantIDSchema = z.nanoid().meta({
  id: 'Variant',
  name: 'Variant ID',
})

export const VariantItemsInputSchema = z.strictObject({
  id: ItemIDSchema,
})

export const VariantOrgsInputSchema = z.strictObject({
  id: OrgIDSchema,
})

export const VariantTagsInputSchema = z.strictObject({
  id: TagDefinitionIDSchema,
})

export const VariantRegionsInputSchema = z.strictObject({
  id: RegionIDSchema,
})

export const VariantComponentsInputSchema = z.strictObject({
  id: ComponentIDSchema,
  quantity: z.number().min(0).optional(),
  unit: VariantComponentUnitSchema.optional(),
})

export const CreateVariantInputSchema = z.strictObject({
  name: z.string().max(1024).optional(),
  name_tr: z.array(TranslatedInputSchema).optional(),
  desc: z.string().max(100_000).optional(),
  desc_tr: z.array(TranslatedInputSchema).optional(),
  items: z.array(VariantItemsInputSchema).optional(),
  region_id: RegionIDSchema.optional(),
  regions: z.array(VariantRegionsInputSchema).optional(),
  code: z.string().max(1024).optional(),
  orgs: z.array(VariantOrgsInputSchema).optional(),
  tags: z.array(VariantTagsInputSchema).optional(),
  components: z.array(VariantComponentsInputSchema).optional(),
})

export const UpdateVariantInputSchema = z.strictObject({
  id: VariantIDSchema,
  name: z.string().max(1024).optional(),
  name_tr: z.array(TranslatedInputSchema).optional(),
  desc: z.string().max(100_000).optional(),
  desc_tr: z.array(TranslatedInputSchema).optional(),
  add_items: z.array(VariantItemsInputSchema).optional(),
  remove_items: z.array(VariantItemsInputSchema).optional(),
  region_id: RegionIDSchema.optional(),
  add_regions: z.array(VariantRegionsInputSchema).optional(),
  remove_regions: z.array(VariantRegionsInputSchema).optional(),
  code: z.string().max(1024).optional(),
  add_orgs: z.array(VariantOrgsInputSchema).optional(),
  remove_orgs: z.array(VariantOrgsInputSchema).optional(),
  add_tags: z.array(VariantTagsInputSchema).optional(),
  remove_tags: z.array(VariantTagsInputSchema).optional(),
  add_components: z.array(VariantComponentsInputSchema).optional(),
  remove_components: z.array(VariantComponentsInputSchema).optional(),
})
