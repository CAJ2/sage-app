import { Injectable } from '@nestjs/common'

import { RedisService } from '@src/common/redis.service'
import { MistralService } from '@src/search/mistral.service'
import {
  buildSearchBackendCacheKey,
  type SearchBackend,
  type SearchBackendMultiSearchRequest,
  type SearchBackendMultiSearchResult,
  type SearchBackendSearchRequest,
  type SearchBackendSearchResult,
} from '@src/search/search.backend'
import { TypesenseSearchService } from '@src/search/typesense.service'

@Injectable()
export class CachedSearchBackendService implements SearchBackend {
  private static readonly CACHE_KEY_PREFIX = 'sb'
  private static readonly CACHE_TTL_SECONDS = 600

  constructor(
    private readonly redisService: RedisService,
    private readonly mistralService: MistralService,
    private readonly delegate: TypesenseSearchService,
  ) {}

  async listCollections(): Promise<string[]> {
    return await this.delegate.listCollections()
  }

  async supportsVectorSearch(collection: string): Promise<boolean> {
    return await this.delegate.supportsVectorSearch(collection)
  }

  async search(request: SearchBackendSearchRequest): Promise<SearchBackendSearchResult> {
    const cacheKey = buildSearchBackendCacheKey(
      CachedSearchBackendService.CACHE_KEY_PREFIX,
      request,
    )
    const cached = await this.redisService.get(cacheKey)
    if (cached) {
      return JSON.parse(cached) as SearchBackendSearchResult
    }

    const result = await this.delegate.search(await this.materializeSearchRequest(request))
    await this.redisService.set(
      cacheKey,
      JSON.stringify(result),
      CachedSearchBackendService.CACHE_TTL_SECONDS,
    )
    return result
  }

  async multiSearch(
    request: SearchBackendMultiSearchRequest,
  ): Promise<SearchBackendMultiSearchResult> {
    const cacheKey = buildSearchBackendCacheKey(
      CachedSearchBackendService.CACHE_KEY_PREFIX,
      request,
    )
    const cached = await this.redisService.get(cacheKey)
    if (cached) {
      return JSON.parse(cached) as SearchBackendMultiSearchResult
    }

    const embeddings = new Map<string, Promise<number[] | null>>()
    const searches = await Promise.all(
      request.searches.map((search) => this.materializeSearchRequest(search, embeddings)),
    )
    const result = await this.delegate.multiSearch({ searches })
    await this.redisService.set(
      cacheKey,
      JSON.stringify(result),
      CachedSearchBackendService.CACHE_TTL_SECONDS,
    )
    return result
  }

  private async materializeSearchRequest(
    request: SearchBackendSearchRequest,
    embeddings = new Map<string, Promise<number[] | null>>(),
  ): Promise<SearchBackendSearchRequest> {
    const vector = request.options?.vector
    if (!vector || vector.kind !== 'query' || !vector.text.trim()) {
      return request
    }

    let embeddingPromise = embeddings.get(vector.text)
    if (!embeddingPromise) {
      embeddingPromise = this.mistralService.getEmbedding(vector.text)
      embeddings.set(vector.text, embeddingPromise)
    }

    const embedding = await embeddingPromise
    if (!embedding) {
      return {
        ...request,
        options: {
          ...request.options,
          vector: undefined,
        },
      }
    }

    return {
      ...request,
      options: {
        ...request.options,
        vector: {
          kind: 'embedding',
          values: embedding,
        },
      },
    }
  }
}
