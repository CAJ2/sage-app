import { Injectable } from '@nestjs/common'
import Ajv2020 from 'ajv/dist/2020'
import _ from 'lodash'
import { core, z } from 'zod/v4'

import { I18nService } from '@src/common/i18n.service'
import { ZJSONObject } from '@src/common/z.schema'

export const zToSchema = (schema: core.$ZodType): core.JSONSchema.BaseSchema => {
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

export const ImageOrIconSchema = z
  .url({ protocol: /^(https|icon)/ })
  .optional()
  .default('')
export const RelMetaSchema = ZJSONObject.optional()

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
        nanoid: true,
      },
    })
  }

  collectionToInput(collection: Record<string, string>[], refField: string, foreignField: string) {
    return collection.map((item) => {
      const obj = {
        id: item[foreignField],
        ..._.omit(item, [refField, foreignField]),
      }
      return obj
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
            label: this.i18n.t('schemas.translatedInput.langTitle'),
          },
          {
            type: 'Control',
            scope: '#/properties/text',
            label: this.i18n.t('schemas.translatedInput.textTitle'),
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
