import { Injectable } from '@nestjs/common'
import { parseLanguageHeader } from '@src/common/i18n'
import { ClsService } from 'nestjs-cls'
import { z, ZodObject } from 'zod/v4'
import * as z4 from 'zod/v4/core'

@Injectable()
export class ZService {
  constructor(private readonly cls: ClsService) {}

  async parse<S extends z4.$ZodType>(schema: S, input: unknown): Promise<z4.output<S>> {
    if (schema instanceof ZodObject) {
      for (const key in schema.shape) {
        const field = schema.shape[key]
        // Fill in the langugae field if not provided in the query input
        // Usually this comes from an Accept-Language header
        if (
          key === 'lang' &&
          field instanceof z.ZodOptional &&
          field.def.innerType instanceof z.ZodUnion
        ) {
          const lang = this.cls.get('lang')
          schema.shape[key] = field
            .transform((f) => f || lang)
            .refine(
              (val) => {
                if (
                  typeof val === 'string' &&
                  val.length > 0 &&
                  parseLanguageHeader(val).length > 0
                ) {
                  return true
                }
                return false
              },
              {
                error:
                  'Language must be provided either in the `lang` input field or in the Accept-Language header',
              },
            )
        }
      }
      return schema.parseAsync(input)
    }
    throw new Error('Unsupported schema type')
  }
}
