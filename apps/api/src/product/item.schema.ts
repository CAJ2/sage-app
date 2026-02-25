import { Injectable } from '@nestjs/common'
import { ValidateFunction } from 'ajv'
import _ from 'lodash'
import { z } from 'zod/v4'

import { DeleteInput } from '@src/changes/change-ext.model'
import type { Edit } from '@src/changes/change.model'
import { ChangeInputWithLangSchema, DeleteInputSchema } from '@src/changes/change.schema'
import { EditService } from '@src/changes/edit.service'
import {
  BaseSchemaService,
  ImageOrIconSchema,
  RelMetaSchema,
  zToSchema,
} from '@src/common/base.schema'
import { TrArraySchema } from '@src/common/i18n'
import { I18nService } from '@src/common/i18n.service'
import { UISchemaElement } from '@src/common/ui.schema'
import { ZService } from '@src/common/z.service'
import { TagDefinitionIDSchema } from '@src/process/tag.model'
import { CategoryIDSchema } from '@src/product/category.schema'
import { CreateItemInput, UpdateItemInput } from '@src/product/item.model'

export const ItemIDSchema = z.string().meta({
  id: 'Item',
  name: 'Item ID',
})

@Injectable()
export class ItemSchemaService {
  ItemCategoriesInputSchema
  ItemTagsInputSchema
  CreateSchema
  CreateJSONSchema: z.core.JSONSchema.BaseSchema
  CreateValidator: ValidateFunction
  CreateUISchema: UISchemaElement
  UpdateSchema
  UpdateJSONSchema: z.core.JSONSchema.BaseSchema
  UpdateValidator: ValidateFunction
  UpdateUISchema: UISchemaElement

  constructor(
    private readonly i18n: I18nService,
    private readonly baseSchema: BaseSchemaService,
    private readonly editService: EditService,
    private readonly zService: ZService,
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
      nameTr: TrArraySchema,
      desc: z.string().max(100_000).optional(),
      descTr: TrArraySchema,
      imageURL: ImageOrIconSchema,
      categories: z.array(this.ItemCategoriesInputSchema).optional(),
      tags: z.array(this.ItemTagsInputSchema).optional(),
    })

    this.CreateJSONSchema = zToSchema(this.CreateSchema)
    this.CreateUISchema = {
      type: 'VerticalLayout',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/nameTr',
          label: 'Name Translations',
          options: this.baseSchema.trOptionsUISchema(),
        },
        {
          type: 'Control',
          scope: '#/properties/descTr',
          label: 'Description Translations',
          options: this.baseSchema.trOptionsUISchema(),
        },
        {
          type: 'Control',
          scope: '#/properties/imageURL',
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
      name: z.string().min(1).max(100).optional(),
      nameTr: TrArraySchema.optional(),
      desc: z.string().max(100_000).optional(),
      descTr: TrArraySchema.optional(),
      imageURL: ImageOrIconSchema,
      categories: z.array(this.ItemCategoriesInputSchema).optional(),
      addCategories: z.array(this.ItemCategoriesInputSchema).optional(),
      removeCategories: z.array(z.string()).optional(),
      tags: z.array(this.ItemTagsInputSchema).optional(),
      addTags: z.array(this.ItemTagsInputSchema).optional(),
      removeTags: z.array(z.string()).optional(),
    })
    this.UpdateJSONSchema = zToSchema(this.UpdateSchema)
    this.UpdateUISchema = {
      type: 'VerticalLayout',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/nameTr',
          label: 'Name Translations',
          options: this.baseSchema.trOptionsUISchema(),
        },
        {
          type: 'Control',
          scope: '#/properties/descTr',
          label: 'Description Translations',
          options: this.baseSchema.trOptionsUISchema(),
        },
        {
          type: 'Control',
          scope: '#/properties/imageURL',
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
      data.tags = this.baseSchema.collectionToInput(data.item_tags || [], 'item', 'tag')
    }
    this.UpdateValidator(data)
    return data
  }

  async parseCreateInput(input: CreateItemInput): Promise<CreateItemInput> {
    return this.zService.parse(this.CreateSchema, input)
  }

  async parseUpdateInput(input: UpdateItemInput): Promise<UpdateItemInput> {
    return this.zService.parse(this.UpdateSchema, input)
  }

  async parseDeleteInput(input: DeleteInput): Promise<DeleteInput> {
    return this.zService.parse(DeleteInputSchema, input)
  }
}
