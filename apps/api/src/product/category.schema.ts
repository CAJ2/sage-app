import { Injectable } from '@nestjs/common'
import { Edit } from '@src/changes/change.model'
import { ChangeInputWithLangSchema } from '@src/changes/change.schema'
import { ChangeService } from '@src/changes/change.service'
import { BaseSchemaService, zToSchema } from '@src/common/base.schema'
import { UISchemaElement } from '@src/common/ui.schema'
import { ImageOrIconSchema, TrArraySchema } from '@src/graphql/base.model'
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
    private readonly changeService: ChangeService,
  ) {
    this.CreateSchema = ChangeInputWithLangSchema.extend({
      name_tr: TrArraySchema,
      desc_short_tr: TrArraySchema,
      desc_tr: TrArraySchema,
      image_url: ImageOrIconSchema,
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
          scope: '#/properties/desc_short_tr',
          label: 'Short Description Translations',
          options: this.baseSchema.trOptionsUISchema(),
        },
        {
          type: 'Control',
          scope: '#/properties/desc_tr',
          options: this.baseSchema.trOptionsUISchema(),
        },
        {
          type: 'Control',
          scope: '#/properties/image_url',
          options: this.baseSchema.imageOrIconOptionsUISchema(),
        },
      ],
    }

    this.UpdateSchema = ChangeInputWithLangSchema.extend({
      id: z.string(),
      name: z.string().max(1024).optional(),
      name_tr: TrArraySchema,
      desc_short_tr: TrArraySchema,
      desc_tr: TrArraySchema,
      image_url: ImageOrIconSchema,
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
          scope: '#/properties/desc_short_tr',
          options: this.baseSchema.trOptionsUISchema(),
        },
        {
          type: 'Control',
          scope: '#/properties/desc_tr',
          options: this.baseSchema.trOptionsUISchema(),
        },
        {
          type: 'Control',
          scope: '#/properties/image_url',
          options: this.baseSchema.imageOrIconOptionsUISchema(),
        },
      ],
    }

    this.CreateValidator = this.baseSchema.ajv.compile(this.CreateJSONSchema)
    this.UpdateValidator = this.baseSchema.ajv.compile(this.UpdateJSONSchema)
    this.changeService.registerEditValidator(
      'Category',
      'create',
      this.categoryCreateEdit.bind(this),
    )
    this.changeService.registerEditValidator(
      'Category',
      'update',
      this.categoryUpdateEdit.bind(this),
    )
  }

  async categoryCreateEdit(edit: Edit) {
    const data = _.cloneDeep(edit.changes)
    this.CreateValidator(data)
    this.baseSchema.flattenRefs(data)
    return data
  }

  async categoryUpdateEdit(edit: Edit) {
    const data = _.cloneDeep(edit.changes)
    this.UpdateValidator(data)
    this.baseSchema.flattenRefs(data)
    return data
  }
}
