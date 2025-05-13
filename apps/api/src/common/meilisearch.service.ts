import { Injectable } from '@nestjs/common'
import { Searchable } from '@src/db/base.entity'
import { MeiliSearch, RecordAny } from 'meilisearch'

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
}
