import { describe, expect, test, vi } from 'vitest'

import { MeiliService } from '@src/search/meilisearch.service'

function makeMeiliService() {
  const service = new MeiliService()

  const mockSearch = vi.fn().mockResolvedValue({ hits: [] })
  const mockMultiSearch = vi.fn().mockResolvedValue({ hits: [] })
  const mockGetEmbedders = vi.fn()
  const mockGetIndexes = vi.fn().mockResolvedValue({ results: [] })

  service.client = {
    index: vi.fn().mockReturnValue({
      search: mockSearch,
      getEmbedders: mockGetEmbedders,
    }),
    multiSearch: mockMultiSearch,
    getIndexes: mockGetIndexes,
  } as any

  return { service, mockSearch, mockMultiSearch, mockGetEmbedders }
}

describe('MeiliService', () => {
  describe('getIndexEmbedder', () => {
    test('returns the first embedder name when embedders are defined', async () => {
      const { service, mockGetEmbedders } = makeMeiliService()
      mockGetEmbedders.mockResolvedValue({ 'my-embedder': {}, other: {} })

      const result = await service.getIndexEmbedder('items_en')

      expect(result).toBe('my-embedder')
    })

    test('returns null when no embedders are defined', async () => {
      const { service, mockGetEmbedders } = makeMeiliService()
      mockGetEmbedders.mockResolvedValue({})

      const result = await service.getIndexEmbedder('items_en')

      expect(result).toBeNull()
    })

    test('returns null when getEmbedders returns null', async () => {
      const { service, mockGetEmbedders } = makeMeiliService()
      mockGetEmbedders.mockResolvedValue(null)

      const result = await service.getIndexEmbedder('items_en')

      expect(result).toBeNull()
    })

    test('fails open (returns null) when getEmbedders throws', async () => {
      const { service, mockGetEmbedders } = makeMeiliService()
      mockGetEmbedders.mockRejectedValue(new Error('network error'))

      const result = await service.getIndexEmbedder('items_en')

      expect(result).toBeNull()
    })

    test('caches result and does not call getEmbedders a second time', async () => {
      const { service, mockGetEmbedders } = makeMeiliService()
      mockGetEmbedders.mockResolvedValue({ 'my-embedder': {} })

      await service.getIndexEmbedder('items_en')
      await service.getIndexEmbedder('items_en')

      expect(mockGetEmbedders).toHaveBeenCalledTimes(1)
    })

    test('caches independently per index', async () => {
      const { service, mockGetEmbedders } = makeMeiliService()
      mockGetEmbedders.mockResolvedValueOnce({ 'embedder-a': {} })
      mockGetEmbedders.mockResolvedValueOnce({})

      const a = await service.getIndexEmbedder('items_en')
      const b = await service.getIndexEmbedder('items_de')

      expect(a).toBe('embedder-a')
      expect(b).toBeNull()
    })
  })

  describe('search', () => {
    test('adds hybrid params when index has an embedder', async () => {
      const { service, mockSearch, mockGetEmbedders } = makeMeiliService()
      mockGetEmbedders.mockResolvedValue({ 'my-embedder': {} })

      await service.search('items_en', 'chair', { limit: 10 })

      expect(mockSearch).toHaveBeenCalledWith('chair', {
        limit: 10,
        hybrid: { semanticRatio: 0.5, embedder: 'my-embedder' },
      })
    })

    test('does not add hybrid params when index has no embedder', async () => {
      const { service, mockSearch, mockGetEmbedders } = makeMeiliService()
      mockGetEmbedders.mockResolvedValue({})

      await service.search('items_en', 'chair', { limit: 10 })

      expect(mockSearch).toHaveBeenCalledWith('chair', { limit: 10 })
    })
  })

  describe('federatedSearch', () => {
    test('adds hybrid per-query for indexes that have an embedder', async () => {
      const { service, mockMultiSearch, mockGetEmbedders } = makeMeiliService()
      // items_en has embedder, categories_en does not
      mockGetEmbedders.mockResolvedValueOnce({ 'my-embedder': {} })
      mockGetEmbedders.mockResolvedValueOnce({})

      await service.federatedSearch(
        [
          { index: 'items_en', query: 'chair' },
          { index: 'categories_en', query: 'chair' },
        ],
        10,
        0,
      )

      const calledQueries = mockMultiSearch.mock.calls[0][0].queries
      expect(calledQueries[0]).toMatchObject({
        indexUid: 'items_en',
        hybrid: { semanticRatio: 0.5, embedder: 'my-embedder' },
      })
      expect(calledQueries[1]).not.toHaveProperty('hybrid')
    })

    test('does not add hybrid when no indexes have embedders', async () => {
      const { service, mockMultiSearch, mockGetEmbedders } = makeMeiliService()
      mockGetEmbedders.mockResolvedValue({})

      await service.federatedSearch([{ index: 'items_en', query: 'chair' }], 10, 0)

      const calledQueries = mockMultiSearch.mock.calls[0][0].queries
      expect(calledQueries[0]).not.toHaveProperty('hybrid')
    })
  })
})
