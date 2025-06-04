import { z } from 'zod/v4'

export const ItemIDSchema = z.nanoid().meta({
  id: 'Item',
  name: 'Item ID',
})
