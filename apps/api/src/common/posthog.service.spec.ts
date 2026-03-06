import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { ClsService } from 'nestjs-cls'
import { PostHog } from 'posthog-node'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { PosthogService } from '@src/common/posthog.service'

vi.mock('posthog-node')

describe('PosthogService', () => {
  let service: PosthogService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PosthogService,
        {
          provide: ClsService,
          useValue: { get: vi.fn() },
        },
        {
          provide: ConfigService,
          useValue: {
            get: vi.fn((key: string) => {
              if (key === 'posthog.apiKey') return 'test-key'
              if (key === 'app.version') return '1.2.3'
              if (key === 'app.sha') return 'abc123'
              return undefined
            }),
          },
        },
      ],
    }).compile()

    service = module.get<PosthogService>(PosthogService)
  })

  test('should be defined', () => {
    expect(service).toBeDefined()
  })

  test('should register with version and sha if apiKey is present', () => {
    expect(PostHog).toHaveBeenCalledWith('test-key', { host: 'https://eu.i.posthog.com' })
    const clientInstance = vi.mocked(PostHog).mock.instances[0]
    expect(clientInstance.register).toHaveBeenCalledWith({
      app: 'api',
      app_version: '1.2.3',
      app_sha: 'abc123',
      environment: 'test', // Vitest sets NODE_ENV to test
    })
  })
})
