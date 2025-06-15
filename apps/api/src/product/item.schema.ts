import { Injectable } from '@nestjs/common'
import { z } from 'zod/v4'

export const ItemIDSchema = z.string().meta({
  id: 'Item',
  name: 'Item ID',
})

@Injectable()
export class ItemSchemaService {
  ItemIDSchema = ItemIDSchema
}
