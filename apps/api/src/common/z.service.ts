import { Injectable } from '@nestjs/common'
import { ClsService } from 'nestjs-cls'
import { z, ZodObject } from 'zod/v4'

@Injectable()
export class ZService {
  constructor(private readonly cls: ClsService) {}

  async parse<S extends z.ZodObject>(schema: S, input: z.input<S>): Promise<z.output<S>> {
    if (schema instanceof ZodObject) {
      return schema.parseAsync(input)
    }
    throw new Error('Unsupported schema type')
  }
}
