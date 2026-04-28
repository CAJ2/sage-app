import { ArgsType, Field, Int } from '@nestjs/graphql'
import { z } from 'zod/v4'

export const DEFAULT_RELATED_LIMIT = 20
export const MAX_RELATED_LIMIT = 100
export const MAX_RELATED_OFFSET = 200

export const RelatedArgsSchema = z.object({
  query: z.string().trim().min(1).optional(),
  limit: z.number().int().positive().max(MAX_RELATED_LIMIT).optional(),
  offset: z.number().int().min(0).max(MAX_RELATED_OFFSET).optional(),
})

@ArgsType()
export class RelatedArgs {
  static schema = RelatedArgsSchema

  @Field(() => String, { nullable: true })
  query?: string

  @Field(() => Int, { nullable: true })
  limit?: number

  @Field(() => Int, { nullable: true })
  offset?: number
}
