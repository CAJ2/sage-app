import { Injectable } from '@nestjs/common'
import { z } from 'zod/v4'

import { HTTPS_OR_ICON } from '@src/common/z.schema'
import { TransformInput, ZService } from '@src/common/z.service'
import { Tag as TagEntity, TagType } from '@src/process/tag.entity'
import {
  CreateTagDefinitionInput,
  Tag,
  TagDefinition,
  UpdateTagDefinitionInput,
} from '@src/process/tag.model'

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

  constructor(private readonly zService: ZService) {
    const TagDefinitionTransform = z.transform((input: TransformInput) => {
      const entity = input.input as TagEntity
      const model = new TagDefinition()
      model.id = entity.id
      model.createdAt = entity.createdAt as any
      model.updatedAt = entity.updatedAt as any
      model.name = input.i18n.tr(entity.name) as string
      model.type = entity.type
      model.desc = input.i18n.tr(entity.desc)
      model.metaTemplate = entity.metaTemplate as any
      model.bgColor = entity.bgColor
      model.image = entity.image
      return model
    })
    this.zService.registerTransform(TagEntity, TagDefinition, TagDefinitionTransform)

    const TagTransform = z.transform((input: TransformInput) => {
      const entity = input.input as TagEntity
      const model = new Tag()
      model.id = entity.id
      model.createdAt = entity.createdAt as any
      model.updatedAt = entity.updatedAt as any
      model.name = input.i18n.tr(entity.name) as string
      model.type = entity.type
      model.desc = input.i18n.tr(entity.desc)
      model.metaTemplate = entity.metaTemplate as any
      model.bgColor = entity.bgColor
      model.image = entity.image
      model.meta = (entity as any).meta
      return model
    })
    this.zService.registerTransform(TagEntity, Tag, TagTransform)
  }

  async parseCreateInput(input: CreateTagDefinitionInput): Promise<CreateTagDefinitionInput> {
    return this.zService.parse(this.CreateSchema, input)
  }

  async parseUpdateInput(input: UpdateTagDefinitionInput): Promise<UpdateTagDefinitionInput> {
    return this.zService.parse(this.UpdateSchema, input)
  }
}
