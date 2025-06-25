import { Injectable } from '@nestjs/common'
import { Edit } from '@src/changes/change.model'
import { ChangeInputWithLangSchema } from '@src/changes/change.schema'
import { EditService } from '@src/changes/edit.service'
import {
  BaseSchemaService,
  ImageOrIconSchema,
  RelMetaSchema,
  TrArraySchema,
  zToSchema,
} from '@src/common/base.schema'
import { UISchemaElement } from '@src/common/ui.schema'
import { I18nTranslations } from '@src/i18n/i18n.generated'
import { TagDefinitionIDSchema } from '@src/process/tag.model'
import { ValidateFunction } from 'ajv'
import _ from 'lodash'
import { I18nService } from 'nestjs-i18n'
import { z } from 'zod/v4'
import { CategoryIDSchema } from './category.schema'

export const ItemIDSchema = z.string().meta({
  id: 'Item',
  name: 'Item ID',
})

@Injectable()
export class ItemSchemaService {
  ItemCategoriesInputSchema: z.ZodObject
  ItemTagsInputSchema: z.ZodObject
  CreateSchema: z.ZodObject
  CreateJSONSchema: z.core.JSONSchema.BaseSchema
  CreateValidator: ValidateFunction
  CreateUISchema: UISchemaElement
  UpdateSchema: z.ZodObject
  UpdateJSONSchema: z.core.JSONSchema.BaseSchema
  UpdateValidator: ValidateFunction
  UpdateUISchema: UISchemaElement

  constructor(
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly baseSchema: BaseSchemaService,
    private readonly editService: EditService,
  ) {
    this.ItemCategoriesInputSchema = z.strictObject({
      id: CategoryIDSchema,
    })
    this.ItemTagsInputSchema = z.strictObject({
      id: TagDefinitionIDSchema,
      meta: RelMetaSchema,
    })

    this.CreateSchema = ChangeInputWithLangSchema.extend({
      name: z.string().min(1).max(100).optional(),
      name_tr: TrArraySchema,
      desc: z.string().max(100_000).optional(),
      desc_tr: TrArraySchema,
      image_url: ImageOrIconSchema,
      categories: z.array(this.ItemCategoriesInputSchema).optional(),
      tags: z.array(this.ItemTagsInputSchema).optional(),
    })

    this.CreateJSONSchema = zToSchema(this.CreateSchema)
    this.CreateUISchema = {
      type: 'VerticalLayout',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/name_tr',
          label: 'Name Translations',
          options: this.baseSchema.trOptionsUISchema(),
        },
        {
          type: 'Control',
          scope: '#/properties/desc_tr',
          label: 'Description Translations',
          options: this.baseSchema.trOptionsUISchema(),
        },
        {
          type: 'Control',
          scope: '#/properties/image_url',
          label: 'Image',
        },
        {
          type: 'Control',
          scope: '#/properties/categories',
          label: 'Categories',
        },
        {
          type: 'Control',
          scope: '#/properties/tags',
          label: 'Tags',
        },
      ],
    }

    this.UpdateSchema = ChangeInputWithLangSchema.extend({
      id: ItemIDSchema,
      name_tr: TrArraySchema.optional(),
      desc_tr: TrArraySchema.optional(),
      image_url: ImageOrIconSchema,
      categories: z.array(this.ItemCategoriesInputSchema).optional(),
      tags: z.array(this.ItemTagsInputSchema).optional(),
    })
    this.UpdateJSONSchema = zToSchema(this.UpdateSchema)
    this.UpdateUISchema = {
      type: 'VerticalLayout',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/name_tr',
          label: 'Name Translations',
          options: this.baseSchema.trOptionsUISchema(),
        },
        {
          type: 'Control',
          scope: '#/properties/desc_tr',
          label: 'Description Translations',
          options: this.baseSchema.trOptionsUISchema(),
        },
        {
          type: 'Control',
          scope: '#/properties/image_url',
          label: 'Image',
        },
        {
          type: 'Control',
          scope: '#/properties/categories',
          label: 'Categories',
        },
        {
          type: 'Control',
          scope: '#/properties/tags',
          label: 'Tags',
        },
      ],
    }
    this.CreateValidator = this.baseSchema.ajv.compile(this.CreateJSONSchema)
    this.UpdateValidator = this.baseSchema.ajv.compile(this.UpdateJSONSchema)
  }

  async itemCreateEdit(edit: Edit) {
    const data = _.cloneDeep(edit.changes)
    this.CreateValidator(data)
    return data
  }

  async itemUpdateEdit(edit: Edit) {
    const data: Record<string, any> | undefined = _.cloneDeep(edit.changes)
    if (data) {
      data.tags = this.baseSchema.collectionToInput(
        data.item_tags || [],
        'item',
        'tag',
      )
    }
    this.UpdateValidator(data)
    return data
  }
}
