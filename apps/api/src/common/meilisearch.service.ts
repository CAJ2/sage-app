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

  constructor() {
    this.client = new MeiliSearch({
      host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
      apiKey: process.env.MEILISEARCH_API_KEY,
    })
  }

  async search(index: string, query: string, options: any) {
    const res = await this.client.index(index).search(query, options)
    return res
  }

  async federatedSearch(
    queries: { index: string; query: string; options?: any }[],
    limit?: number,
    offset?: number,
  ) {
    const qs = queries.map((q) => ({
      indexUid: q.index,
      q: q.query,
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
