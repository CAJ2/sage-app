import { z } from 'zod/v4'

export const OrgIDSchema = z.nanoid().meta({
  id: 'Org',
  name: 'Organization ID',
})
