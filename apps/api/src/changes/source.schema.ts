import { Injectable } from '@nestjs/common'
import { z } from 'zod/v4'

import { SourceType } from '@src/changes/source.entity'
import { CreateSourceInput, UpdateSourceInput } from '@src/changes/source.model'
import { ZService } from '@src/common/z.service'

export const SourceIDSchema = z.string().meta({
  id: 'Source',
  title: 'Source ID',
})

export const CreateSourceInputSchema = z.object({
  type: z.enum(SourceType),
  location: z.string().max(2048).optional(),
  content: z.record(z.string(), z.json()).optional(),
  contentURL: z.url({ protocol: /^https$/ }).optional(),
  metadata: z.record(z.string(), z.json()).optional(),
})
export const CreateSourceInputJSONSchema = z.toJSONSchema(CreateSourceInputSchema)

export const UpdateSourceInputSchema = z.object({
  id: z.nanoid(),
  type: z.enum(SourceType).optional(),
  location: z.string().max(2048).optional(),
  content: z.record(z.string(), z.json()).optional(),
  contentURL: z.url({ protocol: /^https$/ }).optional(),
  metadata: z.record(z.string(), z.json()).optional(),
})
export const UpdateSourceInputJSONSchema = z.toJSONSchema(UpdateSourceInputSchema)

@Injectable()
export class SourceSchemaService {
  CreateSchema = CreateSourceInputSchema
  UpdateSchema = UpdateSourceInputSchema

  constructor(private readonly z: ZService) {}

  async parseCreateInput(input: CreateSourceInput): Promise<CreateSourceInput> {
    return this.z.parse(this.CreateSchema, input)
  }

  async parseUpdateInput(input: UpdateSourceInput): Promise<UpdateSourceInput> {
    return this.z.parse(this.UpdateSchema, input)
  }
}
