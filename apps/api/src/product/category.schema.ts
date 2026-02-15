import { Injectable } from '@nestjs/common'
import type { Edit } from '@src/changes/change.model'
import { ChangeInputWithLangSchema } from '@src/changes/change.schema'
import { BaseSchemaService, ImageOrIconSchema, zToSchema } from '@src/common/base.schema'
import { TrArraySchema } from '@src/common/i18n'
import { UISchemaElement } from '@src/common/ui.schema'
import { I18nTranslations } from '@src/i18n/i18n.generated'
import { ValidateFunction } from 'ajv'
import _ from 'lodash'
import { I18nService } from 'nestjs-i18n'
import { z } from 'zod/v4'

export const CategoryIDSchema = z.string().meta({
  id: 'Category',
  name: 'Category ID',
})

@Injectable()
export class CategorySchemaService {
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
  ) {
    this.CreateSchema = ChangeInputWithLangSchema.extend({
      nameTr: TrArraySchema,
      descShortTr: TrArraySchema,
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
      descShortTr: TrArraySchema,
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
    const data = _.cloneDeep(edit.changes)
    this.CreateValidator(data)
    return data
  }

  async categoryUpdateEdit(edit: Edit) {
    const data = _.cloneDeep(edit.changes)
    this.UpdateValidator(data)
    return data
  }
}
