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

  test('extracts array filters correctly', () => {
    const result = parseSearchQuery('chair tags:=[A,B]', [SearchIndex.VARIANTS])

    expect(result.textQuery).toBe('chair')
    expect(result.filtersByIndex.get(SearchIndex.VARIANTS)).toEqual([
      {
        type: 'raw',
        expression: 'tags:=[A,B]',
      },
    ])
  })

  test('extracts numeric filters correctly and formats them for typesense', () => {
    const result = parseSearchQuery('chair admin_level>5 admin_level<=10', [SearchIndex.REGIONS])

    expect(result.textQuery).toBe('chair')
    expect(result.filtersByIndex.get(SearchIndex.REGIONS)).toEqual([
      {
        type: 'raw',
        expression: 'admin_level:>5',
      },
      {
        type: 'raw',
        expression: 'admin_level:<=10',
      },
    ])
  })

  test('extracts exact match filter and maps = to :=', () => {
    const result = parseSearchQuery('chair categories=foo', [SearchIndex.ITEMS])

    expect(result.textQuery).toBe('chair')
    expect(result.filtersByIndex.get(SearchIndex.ITEMS)).toEqual([
      {
        type: 'raw',
        expression: 'categories:=foo',
      },
    ])
  })

  test('strips filter-like tokens that are not configured in SEARCH_QUERY_FILTER_RULES', () => {
    const result = parseSearchQuery('chair email:me@example.com', [SearchIndex.ITEMS])

    expect(result.textQuery).toBe('chair')
    expect(result.filtersByIndex.get(SearchIndex.ITEMS)).toEqual([])
  })

  test('strips filter tokens even when the searched indexes do not support them', () => {
    const result = parseSearchQuery('code:07731343 admin_level>5', [SearchIndex.ITEMS])

    expect(result.textQuery).toBe('')
    expect(result.filtersByIndex.get(SearchIndex.ITEMS)).toEqual([])
  })
})
