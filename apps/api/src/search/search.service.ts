import { Injectable } from '@nestjs/common'
import { MeiliService, SearchIndex } from '@src/common/meilisearch.service'
import { Place } from '@src/geo/place.model'
import { Region } from '@src/geo/region.model'
import { Component } from '@src/process/component.model'
import { Material } from '@src/process/material.model'
import { Category } from '@src/product/category.model'
import { Item } from '@src/product/item.model'
import { Variant } from '@src/product/variant.model'
import { Org } from '@src/users/org.model'
import { SearchType } from './search.model'

@Injectable()
export class SearchService {
  constructor(private readonly meili: MeiliService) {}

  typeIndexMap: Record<SearchType, SearchIndex> = {
    [SearchType.CATEGORY]: SearchIndex.CATEGORIES,
    [SearchType.ITEM]: SearchIndex.ITEMS,
    [SearchType.VARIANT]: SearchIndex.VARIANTS,
    [SearchType.COMPONENT]: SearchIndex.COMPONENTS,
    [SearchType.ORG]: SearchIndex.ORGS,
    [SearchType.PLACE]: SearchIndex.PLACES,
    [SearchType.REGION]: SearchIndex.REGIONS,
  }

  indexModelMap: Record<SearchIndex, any> = {
    [SearchIndex.CATEGORIES]: Category,
    [SearchIndex.ITEMS]: Item,
    [SearchIndex.VARIANTS]: Variant,
    [SearchIndex.COMPONENTS]: Component,
    [SearchIndex.ORGS]: Org,
    [SearchIndex.MATERIALS]: Material,
    [SearchIndex.PLACES]: Place,
    [SearchIndex.REGIONS]: Region,
  }

  mapTypeToIndex(type: SearchType): SearchIndex {
    return this.typeIndexMap[type]
  }

  mapIndexToModel(index: SearchIndex): string {
    return this.indexModelMap[index]
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
        SearchIndex.ORGS,
        SearchIndex.PLACES,
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
      h._type = this.mapIndexToModel(h._federation.indexUid)
      return h
    })
    return {
      items,
      count: results.totalHits || results.estimatedTotalHits || 0,
    }
  }
}
