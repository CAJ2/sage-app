import { Injectable, OnModuleDestroy } from '@nestjs/common'
import { ClsService } from 'nestjs-cls'
import { PostHog } from 'posthog-node'

import type { UserSession } from '@src/auth/auth.guard'

@Injectable()
export class PosthogService implements OnModuleDestroy {
  private readonly client: PostHog | null

  constructor(private readonly cls: ClsService) {
    const apiKey = process.env.POSTHOG_API_KEY
    if (apiKey) {
      this.client = new PostHog(apiKey, { host: 'https://eu.i.posthog.com' })
    } else {
      this.client = null
    }
  }

  captureException(exception: unknown) {
    if (!this.client) return

    const err = exception instanceof Error ? exception : new Error(String(exception))
    const session = this.cls.get<UserSession | null>('session')
    const distinctId = session?.user?.id
    this.client.captureException(err, distinctId)
  }

  async onModuleDestroy() {
    await this.client?.shutdown()
  }
}
