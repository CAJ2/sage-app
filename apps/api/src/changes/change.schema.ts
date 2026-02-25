import { Injectable } from '@nestjs/common'
import { z } from 'zod/v4'

import { ZService } from '@src/common/z.service'
import { LangSchema } from '@src/graphql/base.model'

import { CreateChangeInput } from './change-ext.model'
import { ChangeStatus } from './change.entity'
import { UpdateChangeInput } from './change.model'

export const ChangeIDSchema = z.string().meta({
  id: 'Change',
  title: 'Change ID',
})

export const CreateChangeInputSchema = z.object({
  title: z.string().min(1).max(1000).optional(),
  description: z.string().max(100000).optional(),
  status: z.enum(ChangeStatus).optional(),
  sources: z.array(z.nanoid()).optional(),
})
export const CreateChangeInputJSONSchema = z.toJSONSchema(CreateChangeInputSchema)

export const UpdateChangeInputSchema = z.object({
  id: z.nanoid(),
  title: z.string().max(1000).optional(),
  description: z.string().max(100_000).optional(),
  status: z.enum(ChangeStatus).optional(),
  sources: z.array(z.nanoid()).optional(),
})
export const UpdateChangeInputJSONSchema = z.toJSONSchema(UpdateChangeInputSchema)

export const SourceInputSchema = z.object({
  id: z.nanoid(),
  meta: z.record(z.string(), z.json()).optional(),
})

export const DeleteInputSchema = z.object({
  id: z.nanoid(),
  changeID: z.nanoid().optional(),
  change: CreateChangeInputSchema.optional(),
  addSources: SourceInputSchema.array().optional(),
  removeSources: z.array(z.nanoid()).optional(),
  apply: z.boolean().optional(),
})

export const ChangeInputWithLangSchema = z.object({
  changeID: z.nanoid().optional(),
  change: CreateChangeInputSchema.optional(),
  addSources: SourceInputSchema.array().optional(),
  removeSources: z.array(z.nanoid()).optional(),
  apply: z.boolean().optional(),
  lang: LangSchema,
})

@Injectable()
export class ChangeSchemaService {
  CreateSchema = CreateChangeInputSchema
  UpdateSchema = UpdateChangeInputSchema

  constructor(private readonly z: ZService) {}

  async parseCreateInput(input: CreateChangeInput): Promise<CreateChangeInput> {
    return this.z.parse(this.CreateSchema, input)
  }

  async parseUpdateInput(input: UpdateChangeInput): Promise<UpdateChangeInput> {
    return this.z.parse(this.UpdateSchema, input)
  }
}
