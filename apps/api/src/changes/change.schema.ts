import { z } from 'zod/v4'
import { ChangeStatus } from './change.entity'
import { SourceIDSchema } from './source.schema'

export const ChangeIDSchema = z.string().meta({
  id: 'Change',
  title: 'Change ID',
})

export const CreateChangeInputSchema = z.strictObject({
  title: z.string().max(1000).optional(),
  description: z.string().max(100000).optional(),
  status: z.enum(ChangeStatus).optional(),
  sources: z.array(SourceIDSchema).default([]),
  metadata: z.record(z.string(), z.any()).optional(),
})
export const CreateChangeInputJSONSchema = z.toJSONSchema(
  CreateChangeInputSchema,
)

export const UpdateChangeInputSchema = z.strictObject({
  id: ChangeIDSchema,
  title: z.string().max(1000).optional(),
  description: z.string().max(100000).optional(),
  status: z.enum(ChangeStatus).optional(),
  sources: z.array(SourceIDSchema).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
})
export const UpdateChangeInputJSONSchema = z.toJSONSchema(
  UpdateChangeInputSchema,
)

export const ChangeInputWithLangSchema = z.strictObject({
  change_id: ChangeIDSchema.optional(),
  change: CreateChangeInputSchema.optional(),
  add_sources: z.array(SourceIDSchema).optional(),
  remove_sources: z.array(SourceIDSchema).optional(),
  apply: z.boolean().optional(),
})
