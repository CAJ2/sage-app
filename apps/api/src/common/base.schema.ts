import { Injectable } from '@nestjs/common'
import { I18nService } from 'nestjs-i18n'
import { core, z } from 'zod/v4'

export const zToSchema = (
  schema: core.$ZodType,
): core.JSONSchema.BaseSchema => {
  return z.toJSONSchema(schema, {
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
          ctx.jsonSchema.type = 'string'
        }
      }
    },
  })
}

@Injectable()
export class BaseSchemaService {
  constructor(private readonly i18n: I18nService) {}

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
          {
            type: 'Control',
            scope: '#/properties/auto',
            label: this.i18n.t('schemas.translated_input.auto_title'),
          },
        ],
      },
    }
  }
}
