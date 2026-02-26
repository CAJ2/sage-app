import { Injectable } from '@nestjs/common'
import { ValidateFunction } from 'ajv'
import _ from 'lodash'
import { z } from 'zod/v4'

import { DeleteInput } from '@src/changes/change-ext.model'
import type { Edit } from '@src/changes/change.model'
import { ChangeInputWithLangSchema, DeleteInputSchema } from '@src/changes/change.schema'
import {
  BaseSchemaService,
  ImageOrIconSchema,
  stripNulls,
  zToSchema,
} from '@src/common/base.schema'
import { TrArraySchema } from '@src/common/i18n'
import { I18nService } from '@src/common/i18n.service'
import { UISchemaElement } from '@src/common/ui.schema'
import { ZService } from '@src/common/z.service'
import { CreateCategoryInput, UpdateCategoryInput } from '@src/product/category.model'

export const CategoryIDSchema = z.string().meta({
  id: 'Category',
  name: 'Category ID',
})

@Injectable()
export class CategorySchemaService {
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
    private readonly zService: ZService,
  ) {
    this.CreateSchema = ChangeInputWithLangSchema.extend({
      name: z.string().max(1024).optional(),
      nameTr: TrArraySchema,
      descShort: z.string().max(1024).optional(),
      descShortTr: TrArraySchema,
      desc: z.string().max(100_000).optional(),
      descTr: TrArraySchema,
      imageURL: ImageOrIconSchema,
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
          scope: '#/properties/descShortTr',
          label: 'Short Description Translations',
          options: this.baseSchema.trOptionsUISchema(),
        },
        {
          type: 'Control',
          scope: '#/properties/descTr',
          options: this.baseSchema.trOptionsUISchema(),
        },
        {
          type: 'Control',
          scope: '#/properties/imageURL',
          options: this.baseSchema.imageOrIconOptionsUISchema(),
        },
      ],
    }

    this.UpdateSchema = ChangeInputWithLangSchema.extend({
      id: z.string(),
      name: z.string().max(1024).optional(),
      nameTr: TrArraySchema,
      descShort: z.string().max(1024).optional(),
      descShortTr: TrArraySchema,
      desc: z.string().max(100_000).optional(),
      descTr: TrArraySchema,
      imageURL: ImageOrIconSchema,
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
          scope: '#/properties/descShortTr',
          options: this.baseSchema.trOptionsUISchema(),
        },
        {
          type: 'Control',
          scope: '#/properties/descTr',
          options: this.baseSchema.trOptionsUISchema(),
        },
        {
          type: 'Control',
          scope: '#/properties/imageURL',
          options: this.baseSchema.imageOrIconOptionsUISchema(),
        },
      ],
    }

    this.CreateValidator = this.baseSchema.ajv.compile(this.CreateJSONSchema)
    this.UpdateValidator = this.baseSchema.ajv.compile(this.UpdateJSONSchema)
  }

  async categoryCreateEdit(edit: Edit) {
    const data: Record<string, any> = stripNulls(_.cloneDeep(edit.changes) ?? {})
    this.CreateValidator(data)
    return this.parseCreateInput(data as CreateCategoryInput)
  }

  async categoryUpdateEdit(edit: Edit) {
    const data: Record<string, any> = stripNulls(_.cloneDeep(edit.changes) ?? {})
    this.UpdateValidator(data)
    return this.parseUpdateInput(data as UpdateCategoryInput)
  }

  async parseCreateInput(input: CreateCategoryInput): Promise<CreateCategoryInput> {
    return this.zService.parse(this.CreateSchema, input)
  }

  async parseUpdateInput(input: UpdateCategoryInput): Promise<UpdateCategoryInput> {
    return this.zService.parse(this.UpdateSchema, input)
  }

  async parseDeleteInput(input: DeleteInput): Promise<DeleteInput> {
    return this.zService.parse(DeleteInputSchema, input)
  }
}
