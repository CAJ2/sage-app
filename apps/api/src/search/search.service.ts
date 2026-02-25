import { Injectable } from '@nestjs/common'

import { MeiliService, SearchIndex } from '@src/common/meilisearch.service'
import { Place } from '@src/geo/place.model'
import { Region } from '@src/geo/region.model'
import { Component } from '@src/process/component.model'
import { Material } from '@src/process/material.model'
import { Category } from '@src/product/category.model'
import { Item } from '@src/product/item.model'
import { Variant } from '@src/product/variant.model'
import { SearchType } from '@src/search/search.model'
import { Org } from '@src/users/org.model'

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
    [SearchType.MATERIAL]: SearchIndex.MATERIALS,
  }

  indexModelMap: Record<SearchIndex, any> = {
    [SearchIndex.CATEGORIES]: Category,
    [SearchIndex.ITEMS]: Item,
    [SearchIndex.VARIANTS]: Variant,
    [SearchIndex.COMPONENTS]: Component,
    [SearchIndex.ORGS]: Org,
    [SearchIndex.PLACES]: Place,
    [SearchIndex.REGIONS]: Region,
    [SearchIndex.MATERIALS]: Material,
  }

  mapTypeToIndex(type: SearchType): SearchIndex {
    return this.typeIndexMap[type]
  }

  mapIndexToModel(index: string): string {
    return this.indexModelMap[index as SearchIndex]
  }

  async searchAll(
    query: string,
    types?: SearchType[],
    latLong?: number[],
    limit?: number,
    offset?: number,
  ) {
    const idxs =
      types?.map((t) => this.mapTypeToIndex(t)) ||
      ([
        SearchIndex.CATEGORIES,
        SearchIndex.ITEMS,
        SearchIndex.VARIANTS,
        SearchIndex.ORGS,
        SearchIndex.PLACES,
      ] as SearchIndex[])
    if (!query && !idxs.find((i) => i === SearchIndex.PLACES)) {
      return null
    }
    const filters = []
    if (latLong && latLong.length === 2) {
      const geoFilter = `_geoRadius(${latLong[0]}, ${latLong[1]}, 10000)`
      filters.push(geoFilter)
    } else if (latLong && latLong.length === 3) {
      const geoFilter = `_geoRadius(${latLong[0]}, ${latLong[1]}, ${latLong[2]})`
      filters.push(geoFilter)
    } else if (latLong && latLong.length === 4) {
      const geoFilter = `_geoBoundingBox([${latLong[0]}, ${latLong[1]}], [${latLong[2]}, ${latLong[3]}])`
      filters.push(geoFilter)
    }
    if (idxs.length === 1) {
      const results = await this.meili.search(idxs[0], query, {
        filter: filters.length > 0 ? filters : undefined,
        limit: limit ? limit + 1 : 11,
        offset,
      })
      const items = results.hits.map((h) => {
        h._type = this.mapIndexToModel(idxs[0])
        if (h._geo) {
          h.location = {
            latitude: h._geo.lat,
            longitude: h._geo.lng,
          }
        }
        return h
      })
      return {
        items,
        count: results.totalHits || results.estimatedTotalHits || 0,
      }
    }
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
      if (h._geo) {
        h.location = {
          latitude: h._geo.lat,
          longitude: h._geo.lng,
        }
      }
      return h
    })
    return {
      items,
      count: results.totalHits || results.estimatedTotalHits || 0,
    }
  }
}
