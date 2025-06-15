import { Injectable } from '@nestjs/common'
import { ChangeInputWithLangSchema } from '@src/changes/change.schema'
import { BaseSchemaService, zToSchema } from '@src/common/base.schema'
import { UISchemaElement } from '@src/common/ui.schema'
import { ImageOrIconSchema, TrArraySchema } from '@src/graphql/base.model'
import { I18nTranslations } from '@src/i18n/i18n.generated'
import { I18nService } from 'nestjs-i18n'
import { z } from 'zod/v4'

export const CategoryIDSchema = z.string().meta({
  id: 'Category',
  name: 'Category ID',
})

@Injectable()
export class CategorySchemaService {
  CreateCategoryInputSchema: z.ZodObject
  CreateCategoryInputJSONSchema: z.core.JSONSchema.BaseSchema
  CreateCategoryInputUISchema: UISchemaElement
  UpdateCategoryInputSchema: z.ZodObject
  UpdateCategoryInputJSONSchema: z.core.JSONSchema.BaseSchema
  UpdateCategoryInputUISchema: UISchemaElement

  constructor(
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly baseSchema: BaseSchemaService,
  ) {
    this.CreateCategoryInputSchema = ChangeInputWithLangSchema.extend({
      name_tr: TrArraySchema,
      desc_short_tr: TrArraySchema,
      desc_tr: TrArraySchema,
      image_url: ImageOrIconSchema,
    })

    this.CreateCategoryInputJSONSchema = zToSchema(
      this.CreateCategoryInputSchema,
    )

    this.CreateCategoryInputUISchema = {
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

    this.UpdateCategoryInputSchema = ChangeInputWithLangSchema.extend({
      id: z.string(),
      name: z.string().max(1024).optional(),
      name_tr: TrArraySchema,
      desc_short_tr: TrArraySchema,
      desc_tr: TrArraySchema,
      image_url: ImageOrIconSchema,
    })

    this.UpdateCategoryInputJSONSchema = zToSchema(
      this.UpdateCategoryInputSchema,
    )

    this.UpdateCategoryInputUISchema = {
      type: 'VerticalLayout',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/name',
          label: 'Name',
          options: {
            readonly: true,
          },
        },
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
  }
}
