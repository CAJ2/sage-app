import { Injectable } from '@nestjs/common'
import { Searchable } from '@src/db/base.entity'
import _ from 'lodash'
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
    }))
    const results = await this.client.multiSearch({
      queries: qs,
      federation: {
        limit: limit || 10,
        offset: offset || 0,
      },
    })
    return { ...results, hits: this.transformResults(results.hits) }
  }

  transformResults(results: any[]) {
    return results.map((r) => {
      for (const key in r) {
        if (key.startsWith('name_')) {
          r.name = _.set(r.name || {}, key.replace('name_', ''), r[key])
          delete r[key]
        }
        if (key.startsWith('desc_short_')) {
          r.desc_short = _.set(
            r.desc_short || {},
            key.replace('desc_short_', ''),
            r[key],
          )
          delete r[key]
        } else if (key.startsWith('desc_')) {
          r.desc = _.set(r.desc || {}, key.replace('desc_', ''), r[key])
          delete r[key]
        }
        if (key.startsWith('address_')) {
          r.address = _.set(
            r.address || {},
            key.replace('address_', ''),
            r[key],
          )
          delete r[key]
        }
      }
      return r
    })
  }
}
