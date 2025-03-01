import { z } from 'zod'

export const TranslatedField = z.object({
  default: z.string(),
})
