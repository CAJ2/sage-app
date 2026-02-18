import { Injectable } from '@nestjs/common'
import { ClsService } from 'nestjs-cls'
import { ZodObject } from 'zod/v4'
import * as z4 from 'zod/v4/core'

@Injectable()
export class ZService {
  constructor(private readonly cls: ClsService) {}

  async parse<S extends z4.$ZodType>(schema: S, input: unknown): Promise<z4.output<S>> {
    if (schema instanceof ZodObject) {
      return schema.parseAsync(input)
    }
    throw new Error('Unsupported schema type')
  }
}
