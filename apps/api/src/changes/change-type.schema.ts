import { z } from 'zod/v4'

export const EditModelTypeSchema = z.enum([
  'Place',
  'Org',
  'Component',
  'Material',
  'Process',
  'Program',
  'Category',
  'Item',
  'Variant',
])
