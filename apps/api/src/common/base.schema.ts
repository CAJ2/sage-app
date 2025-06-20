import { Injectable } from '@nestjs/common'
import Ajv2020 from 'ajv/dist/2020'
import _ from 'lodash'
import { I18nService } from 'nestjs-i18n'
import { core, z } from 'zod/v4'

export const zToSchema = (
  schema: core.$ZodType,
): core.JSONSchema.BaseSchema => {
  return z.toJSONSchema(schema, {
    io: 'input',
    override: (ctx) => {
      if (ctx.jsonSchema.id) {
        ctx.jsonSchema.$id = ctx.jsonSchema.id
        delete ctx.jsonSchema.id
      }
      const def = (ctx.zodSchema as core.$ZodTypes)._zod.def
      switch (def.type) {
        case 'union': {
          const oneOf = ctx.jsonSchema.anyOf
          delete ctx.jsonSchema.anyOf
          ctx.jsonSchema.oneOf = oneOf
        }
      }
    },
  })
}

export const TranslatedInputSchema = z.object({
  lang: z
    .string()
    .regex(/^[a-z]{2,3}(-[A-Z]{2,8}(-[^-]{2,8})?)?$/)
    .meta({
      id: 'lang',
      title: 'Language Code',
    }),
  text: z.string().optional(),
  auto: z.boolean().default(false),
})
export const TrArraySchema = z
  .array(TranslatedInputSchema)
  .optional()
  .default([
    {
      lang: 'en',
      text: '',
      auto: false,
    },
  ])
export const ImageOrIconSchema = z
  .url({ protocol: /^(https|iconify):\/\// })
  .optional()
  .default('')
export const RelMetaSchema = z
  .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
  .optional()

@Injectable()
export class BaseSchemaService {
  ajv: Ajv2020
  constructor(private readonly i18n: I18nService) {
    this.ajv = new Ajv2020({
      strict: true,
      coerceTypes: true,
      allErrors: true,
      useDefaults: true,
      removeAdditional: true,
      keywords: ['name'],
      formats: {
        date: true,
        url: true,
        uri: true,
      },
    })
  }

  flattenRefs(data: any) {
    _.each(data, (value, key) => {
      if (_.isPlainObject(value) && value.id && _.keys(value).length === 1) {
        data[key] = (data[key] as any).id
      }
    })
  }

  trOptionsUISchema() {
    return {
      detail: {
        type: 'VerticalLayout',
        elements: [
          {
            type: 'Control',
            scope: '#/properties/lang',
            label: this.i18n.t('schemas.translated_input.lang_title'),
          },
          {
            type: 'Control',
            scope: '#/properties/text',
            label: this.i18n.t('schemas.translated_input.text_title'),
          },
        ],
      },
      showSortButtons: false,
    }
  }

  imageOrIconOptionsUISchema() {
    return {
      control: [
        {
          type: 'Icon',
        },
        {
          type: 'Source',
          format: 'IMAGE',
        },
      ],
    }
  }
}
