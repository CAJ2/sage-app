import { Injectable } from '@nestjs/common'

import { I18nService } from '@src/common/i18n.service'
import { MeiliService, SearchIndex } from '@src/common/meilisearch.service'
import { MetaService } from '@src/common/meta.service'
import { Place } from '@src/geo/place.entity'
import { Region } from '@src/geo/region.entity'
import { Component } from '@src/process/component.entity'
import { Material } from '@src/process/material.entity'
import { Category } from '@src/product/category.entity'
import { Item } from '@src/product/item.entity'
import { Variant } from '@src/product/variant.entity'
import { SearchType } from '@src/search/search.model'
import { Org } from '@src/users/org.entity'

@Injectable()
export class SearchService {
  constructor(
    private readonly meili: MeiliService,
    private readonly i18n: I18nService,
    private readonly metaService: MetaService,
  ) {}

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

  indexEntityClassMap: Record<SearchIndex, any> = {
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

  mapIndexToEntityClass(indexUid: string): any {
    const base = indexUid.replace(/_[a-z]{2,3}$/, '') as SearchIndex
    return this.indexEntityClassMap[base]
  }

  private resolveIndex(index: SearchIndex, lang: string, available: string[]): string {
    const candidate = `${index}_${lang}`
    if (lang === 'en') return candidate
    return available.includes(candidate) ? candidate : `${index}_en`
  }

  private async hydrateHits(hits: any[], defaultEntityClass?: any) {
    const classByHit = hits.map((h) => {
      const entityClass =
        defaultEntityClass ??
        (h._federation ? this.mapIndexToEntityClass(h._federation.indexUid) : null)
      return { hit: h, entityClass }
    })

    const idsByClass = new Map<any, string[]>()
    for (const { hit, entityClass } of classByHit) {
      if (!entityClass) continue
      if (!idsByClass.has(entityClass)) {
        idsByClass.set(entityClass, [])
      }
      idsByClass.get(entityClass)!.push(hit.id)
    }

    const entityByClassById = new Map<any, Map<string, any>>()
    for (const [entityClass, ids] of idsByClass.entries()) {
      const service = await this.metaService.findEntityService(entityClass)
      if (!service) continue
      const entities = await service.findManyByID(ids)
      entityByClassById.set(entityClass, new Map(entities.map((e: any) => [e.id, e])))
    }

    const result = []
    for (const { hit, entityClass } of classByHit) {
      if (!entityClass) continue
      const entity = entityByClassById.get(entityClass)?.get(hit.id)
      if (!entity) continue
      entity._type = entityClass.name
      if (hit._geo) {
        entity.location = {
          latitude: hit._geo.lat,
          longitude: hit._geo.lng,
        }
      }
      result.push(entity)
    }
    return result
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
    const lang = this.i18n.getLang()
    const available = lang !== 'en' ? await this.meili.getAvailableIndexes() : []
    if (idxs.length === 1) {
      const results = await this.meili.search(this.resolveIndex(idxs[0], lang, available), query, {
        filter: filters.length > 0 ? filters : undefined,
        limit: limit ? limit + 1 : 11,
        offset,
      })
      const entityClass = this.mapIndexToEntityClass(idxs[0])
      const items = await this.hydrateHits(results.hits, entityClass)
      return {
        items,
        count: results.totalHits || results.estimatedTotalHits || 0,
      }
    }
    const results = await this.meili.federatedSearch(
      idxs.map((idx) => ({
        index: this.resolveIndex(idx, lang, available),
        query,
      })),
      limit ? limit + 1 : 11,
      offset,
    )
    const items = await this.hydrateHits(results.hits.filter((h) => h._federation))
    return {
      items,
      count: results.totalHits || results.estimatedTotalHits || 0,
    }
  }
}
