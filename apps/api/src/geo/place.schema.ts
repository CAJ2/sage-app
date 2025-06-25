import { Injectable } from '@nestjs/common'
import { Edit } from '@src/changes/change.model'
import { ChangeInputWithLangSchema } from '@src/changes/change.schema'
import {
  BaseSchemaService,
  TrArraySchema,
  zToSchema,
} from '@src/common/base.schema'
import { UISchemaElement } from '@src/common/ui.schema'
import { I18nTranslations } from '@src/i18n/i18n.generated'
import { TagDefinitionIDSchema } from '@src/process/tag.model'
import { OrgIDSchema } from '@src/users/org.schema'
import { ValidateFunction } from 'ajv'
import _ from 'lodash'
import { I18nService } from 'nestjs-i18n'
import { z } from 'zod/v4'

export const PlaceIDSchema = z.string().meta({
  id: 'Place',
  name: 'Place ID',
})

export const PlaceTagsInputSchema = z.strictObject({
  id: TagDefinitionIDSchema,
})

export const PlaceOrgInputSchema = z.strictObject({
  id: OrgIDSchema,
})

@Injectable()
export class PlaceSchemaService {
  CreateSchema: z.ZodObject<any>
  CreateJSONSchema: z.core.JSONSchema.BaseSchema
  CreateValidator: ValidateFunction
  CreateUISchema: UISchemaElement
  UpdateSchema: z.ZodObject<any>
  UpdateJSONSchema: z.core.JSONSchema.BaseSchema
  UpdateValidator: ValidateFunction
  UpdateUISchema: UISchemaElement

  constructor(
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly baseSchema: BaseSchemaService,
  ) {
    this.CreateSchema = ChangeInputWithLangSchema.extend({
      name: z.string().max(1024).optional(),
      name_tr: TrArraySchema,
      desc: z.string().max(100_000).optional(),
      desc_tr: TrArraySchema,
      address: z.string().max(2048).optional(),
      address_tr: TrArraySchema,
      location: z
        .object({
          latitude: z.number(),
          longitude: z.number(),
        })
        .optional(),
      org: PlaceOrgInputSchema.optional(),
      tags: z.array(PlaceTagsInputSchema).optional(),
    })
    this.CreateJSONSchema = zToSchema(this.CreateSchema)
    this.CreateUISchema = {
      type: 'VerticalLayout',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/name_tr',
          options: this.baseSchema.trOptionsUISchema(),
        },
        {
          type: 'Control',
          scope: '#/properties/desc_tr',
          options: this.baseSchema.trOptionsUISchema(),
        },
        {
          type: 'Control',
          scope: '#/properties/address_tr',
          options: this.baseSchema.trOptionsUISchema(),
        },
        {
          type: 'Control',
          scope: '#/properties/location',
        },
        {
          type: 'Control',
          scope: '#/properties/org',
        },
        {
          type: 'Control',
          scope: '#/properties/tags',
        },
      ],
    }

    this.UpdateSchema = ChangeInputWithLangSchema.extend({
      id: PlaceIDSchema,
      name: z.string().max(1024).optional(),
      name_tr: TrArraySchema,
      desc: z.string().max(100_000).optional(),
      desc_tr: TrArraySchema,
      address: z.string().max(2048).optional(),
      address_tr: TrArraySchema,
      location: z
        .object({
          latitude: z.number(),
          longitude: z.number(),
        })
        .optional(),
      org: PlaceOrgInputSchema.optional(),
      tags: z.array(PlaceTagsInputSchema).optional(),
      add_tags: z.array(PlaceTagsInputSchema).optional(),
      remove_tags: TagDefinitionIDSchema.array().optional(),
    })
    this.UpdateJSONSchema = zToSchema(this.UpdateSchema)
    this.UpdateUISchema = {
      type: 'VerticalLayout',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/name_tr',
          options: this.baseSchema.trOptionsUISchema(),
        },
        {
          type: 'Control',
          scope: '#/properties/desc_tr',
          options: this.baseSchema.trOptionsUISchema(),
        },
        {
          type: 'Control',
          scope: '#/properties/address_tr',
          options: this.baseSchema.trOptionsUISchema(),
        },
        {
          type: 'Control',
          scope: '#/properties/location',
        },
        {
          type: 'Control',
          scope: '#/properties/org',
        },
        {
          type: 'Control',
          scope: '#/properties/tags',
        },
      ],
    }
    this.CreateValidator = this.baseSchema.ajv.compile(this.CreateJSONSchema)
    this.UpdateValidator = this.baseSchema.ajv.compile(this.UpdateJSONSchema)
  }

  async placeCreateEdit(edit: Edit) {
    const data = _.cloneDeep(edit.changes)
    this.CreateValidator(data)
    return data
  }

  async placeUpdateEdit(edit: Edit) {
    const data: Record<string, any> | undefined = _.cloneDeep(edit.changes)
    if (data) {
      data.tags = this.baseSchema.collectionToInput(
        data.place_tags || [],
        'place',
        'tag',
      )
    }
    this.UpdateValidator(data)
    return data
  }
}
