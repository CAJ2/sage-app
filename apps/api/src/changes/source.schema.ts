import { Injectable } from '@nestjs/common'
import { z } from 'zod/v4'

import { Source, SourceType } from '@src/changes/source.entity'
import {
  CreateSourceInput,
  Source as SourceModel,
  UpdateSourceInput,
} from '@src/changes/source.model'
import { TransformInput, ZService } from '@src/common/z.service'

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

const ModelTransform = z.transform((input: TransformInput) => {
  const entity = input.input as Source
  const model = new SourceModel()
  model.id = entity.id
  model.type = entity.type
  model.location = entity.location
  model.content = entity.content
  model.contentURL = entity.contentURL
  model.metadata = entity.metadata
  return model
})

@Injectable()
export class SourceSchemaService {
  CreateSchema = CreateSourceInputSchema
  UpdateSchema = UpdateSourceInputSchema

  constructor(private readonly zService: ZService) {
    this.zService.registerTransform(Source, SourceModel, ModelTransform)
  }

  async parseCreateInput(input: CreateSourceInput): Promise<CreateSourceInput> {
    return this.zService.parse(this.CreateSchema, input)
  }

  async parseUpdateInput(input: UpdateSourceInput): Promise<UpdateSourceInput> {
    return this.zService.parse(this.UpdateSchema, input)
  }
}
