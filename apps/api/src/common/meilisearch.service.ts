import { Injectable } from '@nestjs/common'
import { Searchable } from '@src/db/base.entity'
import { MeiliSearch, RecordAny } from 'meilisearch'

export enum SearchIndex {
  CATEGORIES = 'categories',
  ITEMS = 'items',
  VARIANTS = 'variants',
  COMPONENTS = 'components',
  MATERIALS = 'materials',
  PLACES = 'places',
  ORGS = 'orgs',
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

  async addDocs(docs: Searchable | Searchable[], wait = false) {
    let addDocs: RecordAny[] = []
    let index = ''
    if (!Array.isArray(docs)) {
      addDocs = [await docs.toSearchDoc()]
      index = docs.searchIndex()
    } else {
      addDocs = await Promise.all(docs.map((doc) => doc.toSearchDoc()))
      index = docs[0].searchIndex()
    }
    const res = this.client.index(index).addDocuments(addDocs)
    if (wait) {
      return res.waitTask()
    }
    return res
  }

  async search(index: string, query: string, options: any) {
    const res = await this.client.index(index).search(query, options)
    return res
  }

  async federatedSearch(
    queries: { index: SearchIndex; query: string; options?: any }[],
    limit?: number,
    offset?: number,
  ) {
    const qs = queries.map((q) => ({
      indexUid: q.index,
      q: q.query,
      limit: q.options?.limit || 10,
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
