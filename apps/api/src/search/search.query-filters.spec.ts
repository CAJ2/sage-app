import { describe, expect, test } from 'vitest'

import { SearchIndex } from '@src/search/search.backend'
import { parseSearchQuery } from '@src/search/search.query-filters'

describe('parseSearchQuery', () => {
  test('extracts configured filters and keeps the remaining free-text query', () => {
    const result = parseSearchQuery('chair code:07731343', [
      SearchIndex.ITEMS,
      SearchIndex.VARIANTS,
    ])

    expect(result.textQuery).toBe('chair')
    expect(result.filtersByIndex.get(SearchIndex.ITEMS)).toEqual([])
    expect(result.filtersByIndex.get(SearchIndex.VARIANTS)).toEqual([
      {
        type: 'raw',
        expression: 'code:07731343',
      },
    ])
  })

  test('leaves configured filter tokens in the query when the searched indexes do not support them', () => {
    const result = parseSearchQuery('code:07731343', [SearchIndex.ITEMS])

    expect(result.textQuery).toBe('code:07731343')
    expect(result.filtersByIndex.get(SearchIndex.ITEMS)).toEqual([])
  })
})
