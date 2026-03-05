import { Injectable } from '@nestjs/common'
import { z } from 'zod/v4'

import { Source, SourceType } from '@src/changes/source.entity'
import {
  CreateSourceInput,
  LinkSourceInput,
  Source as SourceModel,
  UnlinkSourceInput,
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

const JsonLdIdSchema = z
  .string()
  .refine(
    (v) => v.startsWith('http://g.co/kg/') || v.startsWith('https://www.wikidata.org/entity/Q'),
    { message: '@id must be a Google Knowledge Graph or Wikidata entity IRI' },
  )

export const LinkSourceInputSchema = z.object({
  id: z.nanoid(),
  jsonld: z.looseObject({ '@id': JsonLdIdSchema, '@type': z.string().min(1) }),
})

export const UnlinkSourceInputSchema = z.object({
  id: z.nanoid(),
  jsonld: z.looseObject({ '@id': JsonLdIdSchema }),
})

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

  async parseLinkInput(input: LinkSourceInput): Promise<LinkSourceInput> {
    return this.zService.parse(LinkSourceInputSchema, input as any) as Promise<LinkSourceInput>
  }

  async parseUnlinkInput(input: UnlinkSourceInput): Promise<UnlinkSourceInput> {
    return this.zService.parse(UnlinkSourceInputSchema, input as any) as Promise<UnlinkSourceInput>
  }
}
