import { describe, expect, test, vi } from 'vitest'

import { I18nService } from '@src/common/i18n.service'
import { MetaService } from '@src/common/meta.service'
import { Item } from '@src/product/item.entity'
import { SearchIndex } from '@src/search/search.backend'
import { SearchType } from '@src/search/search.model'
import { SearchService } from '@src/search/search.service'

function makeSearchService() {
  const findManyByID = vi.fn(async (ids: string[]) => ids.map((id) => ({ id })))
  const searchBackend = {
    search: vi.fn(async () => ({ hits: [], found: 0 })),
    multiSearch: vi.fn(async () => ({ results: [] })),
    listCollections: vi.fn(async () => []),
    supportsVectorSearch: vi.fn(async () => true),
  }
  const i18n = {
    getLang: vi.fn(() => 'en'),
  } as unknown as I18nService
  const metaService = {
    findEntityService: vi.fn((entityClass: unknown) => {
      if (entityClass === Item) {
        return [Item, { findManyByID }]
      }
      return null
    }),
  } as unknown as MetaService

  return {
    service: new SearchService(searchBackend as any, i18n, metaService),
    searchBackend,
    findManyByID,
    i18n,
  }
}

describe('SearchService', () => {
  test('searchRelated uses document vector queries and self exclusion', async () => {
    const { service, searchBackend, findManyByID } = makeSearchService()
    searchBackend.search.mockResolvedValue({
      hits: [{ id: 'item-2', sourceCollection: 'items', score: 99 }],
      found: 4,
    })

    const result = await service.searchRelated(SearchIndex.ITEMS, 'item-1', 'reusable', 5, 10)

    expect(searchBackend.search).toHaveBeenCalledWith({
      collection: 'items',
      query: 'reusable',
      options: {
        lang: 'en',
        filters: [{ type: 'raw', expression: 'id:!=`item-1`' }],
        limit: 6,
        offset: 10,
        vector: {
          kind: 'document',
          id: 'item-1',
        },
      },
    })
    expect(findManyByID).toHaveBeenCalledWith(['item-2'])
    expect(result.count).toBe(4)
    expect(result.items[0]).toMatchObject({ id: 'item-2', _type: 'Item' })
  })

  test('searchAll passes a logical query vector to the backend for cacheable semantic search', async () => {
    const { service, searchBackend } = makeSearchService()
    searchBackend.multiSearch.mockResolvedValue({
      results: [{ hits: [], found: 0 }],
    })

    await service.searchAll('smart phone', [SearchType.ITEM], undefined, 10, 2)

    expect(searchBackend.multiSearch).toHaveBeenCalledWith({
      searches: [
        {
          collection: 'items',
          query: 'smart phone',
          options: {
            lang: 'en',
            vector: {
              kind: 'query',
              text: 'smart phone',
            },
            limit: 13,
          },
        },
      ],
    })
  })
})
