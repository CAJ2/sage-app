import { Injectable } from '@nestjs/common'
import { MeiliService, SearchIndex } from '@src/common/meilisearch.service'
import { SearchType } from './search.model'

@Injectable()
export class SearchService {
  constructor(private readonly meili: MeiliService) {}

  mapTypeToIndex(type: SearchType): SearchIndex {
    switch (type) {
      case SearchType.CATEGORY:
        return SearchIndex.CATEGORIES
      case SearchType.ITEM:
        return SearchIndex.ITEMS
      case SearchType.VARIANT:
        return SearchIndex.VARIANTS
      case SearchType.COMPONENT:
        return SearchIndex.COMPONENTS
      case SearchType.ORG:
        return SearchIndex.ORGS
      case SearchType.PLACE:
        return SearchIndex.PLACES
      default:
        throw new Error(`Unknown search type: ${type}`)
    }
  }

  async searchAll(
    query: string,
    types?: SearchType[],
    limit?: number,
    offset?: number,
  ) {
    if (!query) {
      return null
    }
    const idxs =
      types?.map((t) => this.mapTypeToIndex(t)) ||
      ([
        SearchIndex.CATEGORIES,
        SearchIndex.ITEMS,
        SearchIndex.VARIANTS,
        SearchIndex.COMPONENTS,
      ] as SearchIndex[])
    const results = await this.meili.federatedSearch(
      idxs.map((idx) => ({
        index: idx,
        query,
      })),
      limit ? limit + 1 : 11,
      offset,
    )
    const items = results.hits.map((h) => {
      if (!h._federation) {
        return null
      }
      switch (h._federation.indexUid) {
        case SearchIndex.CATEGORIES:
          return { ...h, type: SearchType.CATEGORY }
        case SearchIndex.ITEMS:
          return { ...h, type: SearchType.ITEM }
        case SearchIndex.VARIANTS:
          return { ...h, type: SearchType.VARIANT }
        case SearchIndex.COMPONENTS:
          return { ...h, type: SearchType.COMPONENT }
        case SearchIndex.ORGS:
          return { ...h, type: SearchType.ORG }
        case SearchIndex.PLACES:
          return { ...h, type: SearchType.PLACE }
      }
      return null
    })
    return {
      edges: items.map((i) => ({ cursor: '', node: i })),
      nodes: items,
      totalCount: results.hits.length,
      pageInfo: {
        hasNextPage: results.hits.length > (limit || 10),
        hasPreviousPage: offset ? offset > 0 : false,
      },
    }
  }
}
