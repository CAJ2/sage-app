import { describe, expect, test, vi } from 'vitest'

import { RedisService } from '@src/common/redis.service'
import { CachedSearchBackendService } from '@src/search/cached-search-backend.service'
import { MistralService } from '@src/search/mistral.service'
import { TypesenseSearchService } from '@src/search/typesense.service'

function makeCachedSearchBackendService() {
  const cache = new Map<string, string>()
  const redisService = {
    get: vi.fn(async (key: string) => cache.get(key) ?? null),
    set: vi.fn(async (key: string, value: string) => {
      cache.set(key, value)
    }),
  } as unknown as RedisService

  const mistralService = {
    getEmbedding: vi.fn(async () => [0.1, 0.2, 0.3]),
  } as unknown as MistralService

  const delegate = {
    search: vi.fn(async () => ({ hits: [], found: 0 })),
    multiSearch: vi.fn(async () => ({ results: [] })),
    listCollections: vi.fn(async () => []),
    supportsVectorSearch: vi.fn(async () => true),
  } as unknown as TypesenseSearchService

  return {
    service: new CachedSearchBackendService(redisService, mistralService, delegate),
    redisService,
    mistralService,
    delegate,
  }
}

describe('CachedSearchBackendService', () => {
  test('caches query-vector searches before repeating embedding generation', async () => {
    const { service, mistralService, delegate } = makeCachedSearchBackendService()

    const request = {
      collection: 'items',
      query: 'chair',
      options: {
        vector: {
          kind: 'query' as const,
          text: 'chair',
        },
      },
    }

    await service.search(request)
    await service.search(request)

    expect(mistralService.getEmbedding).toHaveBeenCalledTimes(1)
    expect(delegate.search).toHaveBeenCalledTimes(1)
    expect(delegate.search).toHaveBeenCalledWith({
      collection: 'items',
      query: 'chair',
      options: {
        vector: {
          kind: 'embedding',
          values: [0.1, 0.2, 0.3],
        },
      },
    })
  })

  test('reuses one embedding for repeated query vectors inside a multi-search request', async () => {
    const { service, mistralService, delegate } = makeCachedSearchBackendService()

    await service.multiSearch({
      searches: [
        {
          collection: 'items',
          query: 'smart phone',
          options: {
            vector: {
              kind: 'query',
              text: 'smart phone',
            },
          },
        },
        {
          collection: 'variants',
          query: 'smart phone',
          options: {
            vector: {
              kind: 'query',
              text: 'smart phone',
            },
          },
        },
      ],
    })

    expect(mistralService.getEmbedding).toHaveBeenCalledTimes(1)
    expect(delegate.multiSearch).toHaveBeenCalledWith({
      searches: [
        {
          collection: 'items',
          query: 'smart phone',
          options: {
            vector: {
              kind: 'embedding',
              values: [0.1, 0.2, 0.3],
            },
          },
        },
        {
          collection: 'variants',
          query: 'smart phone',
          options: {
            vector: {
              kind: 'embedding',
              values: [0.1, 0.2, 0.3],
            },
          },
        },
      ],
    })
  })
})
