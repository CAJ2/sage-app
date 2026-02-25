import { Injectable } from '@nestjs/common'
import { z } from 'zod/v4'

import { HTTPS_OR_ICON } from '@src/common/z.schema'
import { ZService } from '@src/common/z.service'
import { TagType } from '@src/process/tag.entity'
import { CreateTagDefinitionInput, UpdateTagDefinitionInput } from '@src/process/tag.model'

export const CreateTagDefinitionInputSchema = z.object({
  name: z.string().max(100),
  type: z.enum(TagType),
  desc: z.string().max(100_000).optional(),
  metaTemplate: z.json().optional(),
  bgColor: z.stringFormat('hexColor', /^#[0-9A-Fa-f]{6}$/).optional(),
  image: z.url(HTTPS_OR_ICON).optional(),
})

export const UpdateTagDefinitionInputSchema = z.object({
  id: z.nanoid(),
  name: z.string().max(100).optional(),
  type: z.enum(TagType).optional(),
  desc: z.string().max(100_000).optional(),
  metaTemplate: z.json().optional(),
  bgColor: z.stringFormat('hexColor', /^#[0-9A-Fa-f]{6}$/).optional(),
  image: z.url(HTTPS_OR_ICON).optional(),
})

@Injectable()
export class TagSchemaService {
  CreateSchema = CreateTagDefinitionInputSchema
  UpdateSchema = UpdateTagDefinitionInputSchema

  constructor(private readonly z: ZService) {}

  async parseCreateInput(input: CreateTagDefinitionInput): Promise<CreateTagDefinitionInput> {
    return this.z.parse(this.CreateSchema, input)
  }

  async parseUpdateInput(input: UpdateTagDefinitionInput): Promise<UpdateTagDefinitionInput> {
    return this.z.parse(this.UpdateSchema, input)
  }
}
