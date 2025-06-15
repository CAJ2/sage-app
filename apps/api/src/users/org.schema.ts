import { z } from 'zod/v4'

export const OrgIDSchema = z.string().meta({
  id: 'Org',
  name: 'Organization ID',
})
