import { z } from 'zod/v4'

import { SourceType } from './source.entity'

export const SourceIDSchema = z.string().meta({
  id: 'Source',
  title: 'Source ID',
})

export const CreateSourceInputSchema = z.strictObject({
  type: z.enum(SourceType),
  location: z.string().max(2048).optional(),
  content: z.record(z.string(), z.json()).optional(),
  contentURL: z.url().optional(),
  metadata: z.record(z.string(), z.json()).optional(),
})
export const CreateSourceInputJSONSchema = z.toJSONSchema(CreateSourceInputSchema)

export const UpdateSourceInputSchema = z.strictObject({
  id: SourceIDSchema,
  type: z.enum(SourceType).optional(),
  location: z.string().max(2048).optional(),
  content: z.record(z.string(), z.json()).optional(),
  contentURL: z.url().optional(),
  metadata: z.record(z.string(), z.json()).optional(),
})
export const UpdateSourceInputJSONSchema = z.toJSONSchema(UpdateSourceInputSchema)
