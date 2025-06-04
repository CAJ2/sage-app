import { z } from 'zod/v4'

export const PlaceIDSchema = z.string().meta({
  id: 'Place',
  name: 'Place ID',
})
