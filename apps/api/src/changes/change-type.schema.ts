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

export const RefModelTypeSchema = z.enum([
  'Place',
  'Org',
  'Component',
  'Material',
  'Process',
  'Program',
  'Category',
  'Item',
  'Variant',
  'Tag',
])
