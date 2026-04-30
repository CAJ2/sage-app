import { createParamDecorator } from '@nestjs/common'
import type { ExecutionContext } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'

import { AllowAnonymous } from '@src/auth/decorators'
import { getRequestFromContext } from '@src/auth/utils'
import { VoteInput, VoteOutput } from '@src/feedback/feedback.model'
import { FeedbackService } from '@src/feedback/feedback.service'

const ClientIP = createParamDecorator((_data: unknown, context: ExecutionContext): string => {
  const request = getRequestFromContext(context)
  const forwarded = request.headers['x-forwarded-for']
  if (forwarded) {
    const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0]
    return ip.trim()
  }
  return request.ip ?? ''
})

@Resolver()
export class FeedbackResolver {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Mutation(() => VoteOutput, { name: 'vote' })
  @AllowAnonymous()
  async vote(@Args('input') input: VoteInput, @ClientIP() ip: string): Promise<VoteOutput> {
    return this.feedbackService.vote(input, ip)
  }
}
