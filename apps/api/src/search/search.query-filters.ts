import { SearchBackendFilter, SearchIndex } from '@src/search/search.backend'

type SearchQueryFilterOperator = ':' | ':=' | ':!='

type SearchQueryFilterRule = {
  token: string
  indexes: SearchIndex[]
  operators: SearchQueryFilterOperator[]
  buildExpression: (args: { operator: SearchQueryFilterOperator; value: string }) => string
}

const SEARCH_QUERY_FILTER_REGEX =
  /(^|\s)([a-z][\w.]*)((?::!=|:=|:))(`[^`]+`|\[[^\]]+\]|"[^"]+"|\S+)/gi

export const SEARCH_QUERY_FILTER_RULES: SearchQueryFilterRule[] = [
  {
    token: 'code',
    indexes: [SearchIndex.VARIANTS],
    operators: [':', ':=', ':!='],
    buildExpression: ({ operator, value }) => `code${operator}${value}`,
  },
]

export function parseSearchQuery(query: string, indexes: SearchIndex[]) {
  const filtersByIndex = new Map<SearchIndex, SearchBackendFilter[]>(
    indexes.map((index) => [index, []]),
  )
  const matches: Array<{ start: number; end: number }> = []

  for (const match of query.matchAll(SEARCH_QUERY_FILTER_REGEX)) {
    const [fullMatch, , token, operator, value] = match
    const rule = SEARCH_QUERY_FILTER_RULES.find(
      (candidate) =>
        candidate.token === token.toLowerCase() &&
        candidate.indexes.some((index) => filtersByIndex.has(index)),
    )

    if (!rule) {
      continue
    }

    if (!rule.operators.includes(operator as SearchQueryFilterOperator)) {
      continue
    }

    const expression = rule.buildExpression({
      operator: operator as SearchQueryFilterOperator,
      value,
    })

    for (const index of rule.indexes) {
      const filters = filtersByIndex.get(index)
      if (!filters) {
        continue
      }

      filters.push({
        type: 'raw',
        expression,
      })
    }

    matches.push({
      start: match.index ?? 0,
      end: (match.index ?? 0) + fullMatch.length,
    })
  }

  if (matches.length === 0) {
    return {
      textQuery: query.trim(),
      filtersByIndex,
    }
  }

  const sortedMatches = matches.sort((a, b) => a.start - b.start)
  let cursor = 0
  let textQuery = ''

  for (const match of sortedMatches) {
    textQuery += query.slice(cursor, match.start)
    cursor = match.end
  }

  textQuery += query.slice(cursor)

  return {
    textQuery: textQuery.replace(/\s+/g, ' ').trim(),
    filtersByIndex,
  }
}
