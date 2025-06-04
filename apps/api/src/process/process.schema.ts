import { PlaceIDSchema } from '@src/geo/place.schema'
import { RegionIDSchema } from '@src/geo/region.model'
import { TranslatedInputSchema } from '@src/graphql/base.model'
import { VariantIDSchema } from '@src/product/variant.schema'
import { OrgIDSchema } from '@src/users/org.schema'
import { z } from 'zod/v4'
import { MaterialIDSchema } from './material.model'
import { ProcessIntent } from './process.entity'

export const ProcessIDSchema = z.nanoid().meta({
  id: 'Process',
  name: 'Process ID',
})

export const CreateProcessInputSchema = z.strictObject({
  intent: z.enum(ProcessIntent),
  name: z.string().max(1024),
  name_tr: z.array(TranslatedInputSchema).optional(),
  desc: z.string().max(100_000).optional(),
  desc_tr: z.array(TranslatedInputSchema).optional(),
  material: MaterialIDSchema.optional(),
  variant: VariantIDSchema.optional(),
  org: OrgIDSchema.optional(),
  region: RegionIDSchema.optional(),
  place: PlaceIDSchema.optional(),
})

export const UpdateProcessInputSchema = z.strictObject({
  id: ProcessIDSchema,
  intent: z.enum(ProcessIntent).optional(),
  name: z.string().max(1024).optional(),
  name_tr: z.array(TranslatedInputSchema).optional(),
  desc: z.string().max(100_000).optional(),
  desc_tr: z.array(TranslatedInputSchema).optional(),
  material: MaterialIDSchema.optional(),
  variant: VariantIDSchema.optional(),
  org: OrgIDSchema.optional(),
  region: RegionIDSchema.optional(),
  place: PlaceIDSchema.optional(),
})
