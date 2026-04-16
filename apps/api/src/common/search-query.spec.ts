import { describe, expect, test } from 'vitest'
import { parseAndTranslateSearchQuery } from './search-query.translator'

describe('parseAndTranslateSearchQuery', () => {
  const config = {
    defaultSearchFields: ['title', 'desc'],
    fieldMap: {
      orders_count: 'ordersCount',
      first_name: 'firstName',
    },
  }

  test('translates basic default search term', () => {
    const result = parseAndTranslateSearchQuery('apple', config)
    expect(result).toEqual({
      $or: [{ title: { $ilike: '%apple%' } }, { desc: { $ilike: '%apple%' } }],
    })
  })

  test('translates multiple default search terms (AND is default connective)', () => {
    const result = parseAndTranslateSearchQuery('apple pie', config)
    expect(result).toEqual({
      $and: [
        { $or: [{ title: { $ilike: '%apple%' } }, { desc: { $ilike: '%apple%' } }] },
        { $or: [{ title: { $ilike: '%pie%' } }, { desc: { $ilike: '%pie%' } }] },
      ],
    })
  })

  test('translates phrase query', () => {
    const result = parseAndTranslateSearchQuery('"apple pie"', config)
    expect(result).toEqual({
      $or: [{ title: { $ilike: '%apple pie%' } }, { desc: { $ilike: '%apple pie%' } }],
    })
  })

  test('translates single field search', () => {
    const result = parseAndTranslateSearchQuery('first_name:Bob', config)
    expect(result).toEqual({
      firstName: { $ilike: '%Bob%' },
    })
  })

  test('translates numeric field search', () => {
    const result = parseAndTranslateSearchQuery('orders_count:3', config)
    expect(result).toEqual({
      ordersCount: 3,
    })
  })

  test('translates range operators', () => {
    const result = parseAndTranslateSearchQuery('orders_count:>16 orders_count:<=30', config)
    expect(result).toEqual({
      $and: [
        { ordersCount: { $gt: 16 } },
        { ordersCount: { $lte: 30 } },
      ],
    })
  })

  test('translates NOT and minus modifiers', () => {
    const res1 = parseAndTranslateSearchQuery('-first_name:Bob', config)
    expect(res1).toEqual({
      $not: { firstName: { $ilike: '%Bob%' } },
    })

    const res2 = parseAndTranslateSearchQuery('NOT first_name:Bob', config)
    expect(res2).toEqual({
      $not: { firstName: { $ilike: '%Bob%' } },
    })
  })

  test('translates OR connective', () => {
    const result = parseAndTranslateSearchQuery('first_name:Bob OR orders_count:3', config)
    expect(result).toEqual({
      $or: [{ firstName: { $ilike: '%Bob%' } }, { ordersCount: 3 }],
    })
  })

  test('translates grouping with parentheses', () => {
    const result = parseAndTranslateSearchQuery('state:disabled AND (tag:"sale shopper" OR tag:VIP)', config)
    expect(result).toEqual({
      $and: [
        { state: { $ilike: '%disabled%' } },
        {
          $or: [
            { tag: { $ilike: '%sale shopper%' } },
            { tag: { $ilike: '%VIP%' } },
          ],
        },
      ],
    })
  })

  test('translates prefix/wildcard query', () => {
    const result = parseAndTranslateSearchQuery('title:head*', config)
    expect(result).toEqual({
      title: { $ilike: 'head%' },
    })
  })

  test('translates exists query', () => {
    const result = parseAndTranslateSearchQuery('published_at:*', config)
    expect(result).toEqual({
      published_at: { $ne: null },
    })
  })

  test('handles empty or blank query', () => {
    const result = parseAndTranslateSearchQuery('   ', config)
    expect(result).toEqual({})
  })
})