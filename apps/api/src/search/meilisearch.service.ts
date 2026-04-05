import { Injectable } from '@nestjs/common'
import { MeiliSearch } from 'meilisearch'

export enum SearchIndex {
  CATEGORIES = 'categories',
  ITEMS = 'items',
  VARIANTS = 'variants',
  COMPONENTS = 'components',
  MATERIALS = 'materials',
  PLACES = 'places',
  ORGS = 'orgs',
  REGIONS = 'regions',
}

@Injectable()
export class MeiliService {
  client: MeiliSearch

  private availableIndexesPromise: Promise<string[]> | null = null
  private indexCacheExpiry = 0

  private static readonly CACHE_TTL = 60 * 60 * 1000 // 1 hour
  private embedderCache = new Map<string, { promise: Promise<string | null>; expiry: number }>()

  constructor() {
    this.client = new MeiliSearch({
      host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
      apiKey: process.env.MEILISEARCH_API_KEY,
    })
  }

  async getAvailableIndexes(): Promise<string[]> {
    if (this.availableIndexesPromise && Date.now() < this.indexCacheExpiry) {
      return this.availableIndexesPromise
    }
    this.indexCacheExpiry = Date.now() + MeiliService.CACHE_TTL
    this.availableIndexesPromise = this.client
      .getIndexes({ limit: 200 })
      .then((result) => result.results.map((idx) => idx.uid))
      .catch((err) => {
        this.availableIndexesPromise = null
        this.indexCacheExpiry = 0
        throw err
      })
    return this.availableIndexesPromise
  }

  // Returns the name of the first embedder defined on the index, or null if none.
  // Result is cached per index UID for CACHE_TTL ms. Fails open (returns null) on error.
  async getIndexEmbedder(index: string): Promise<string | null> {
    const cached = this.embedderCache.get(index)
    if (cached && Date.now() < cached.expiry) {
      return cached.promise
    }
    const expiry = Date.now() + MeiliService.CACHE_TTL
    const promise = this.client
      .index(index)
      .getEmbedders()
      .then((embedders) => {
        if (!embedders) return null
        const keys = Object.keys(embedders)
        return keys.length > 0 ? keys[0] : null
      })
      .catch(() => {
        this.embedderCache.delete(index)
        return null
      })
    this.embedderCache.set(index, { promise, expiry })
    return promise
  }

  async search(index: string, query: string, options: any) {
    const embedder = await this.getIndexEmbedder(index)
    const searchOptions = embedder
      ? { ...options, hybrid: { semanticRatio: 0.5, embedder } }
      : options
    const res = await this.client.index(index).search(query, searchOptions)
    return res
  }

  async federatedSearch(
    queries: { index: string; query: string; options?: any }[],
    limit?: number,
    offset?: number,
  ) {
    const embedders = await Promise.all(queries.map((q) => this.getIndexEmbedder(q.index)))
    const qs = queries.map((q, i) => ({
      indexUid: q.index,
      q: q.query,
      ...(embedders[i] ? { hybrid: { semanticRatio: 0.5, embedder: embedders[i] } } : {}),
    }))
    const results = await this.client.multiSearch({
      queries: qs,
      federation: {
        limit: limit || 10,
        offset: offset || 0,
      },
    })
    return results
  }
}
