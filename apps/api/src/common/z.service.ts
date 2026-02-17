import { Injectable } from '@nestjs/common'
import { ClsService } from 'nestjs-cls'
import z, { ZodObject } from 'zod/v4'
import * as z4 from 'zod/v4/core'

@Injectable()
export class ZService {
  constructor(private readonly cls: ClsService) {}

  async parse<S extends z4.$ZodType>(schema: S, input: unknown): Promise<z4.output<S>> {
    if (schema instanceof ZodObject) {
      for (const key in schema.shape) {
        if (key.endsWith('Tr')) {
          // HACK: It seems that TranslatedInput will somehow come in as
          // an array of length 0 with properties matching the input field names.
          // Instead we expect a normal object with keys matching the field names.
          // TODO(CAJ2): Figure out if this is a bug in NestJS/graphql or something else.
          schema = (schema as any).extend({
            [key]: z
              .array(
                z.any().transform((arr: any) => {
                  if (!arr) return arr
                  const obj: Record<string, any> = {}
                  for (const item in arr) {
                    obj[item] = arr[item]
                  }
                  return obj
                }),
              )
              .optional(),
          })
        }
      }
      return (schema as any).parseAsync(input)
    }
    throw new Error('Unsupported schema type')
  }
}
