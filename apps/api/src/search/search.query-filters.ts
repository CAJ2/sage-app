import { SearchBackendFilter, SearchIndex } from '@src/search/search.backend'

type SearchQueryFilterOperator = ':' | ':=' | ':!=' | '>' | '>=' | '<' | '<=' | '='

type SearchQueryFilterRule = {
  token: string
  indexes: SearchIndex[]
  operators: SearchQueryFilterOperator[]
  buildExpression: (args: { operator: SearchQueryFilterOperator; value: string }) => string
}

const SEARCH_QUERY_FILTER_REGEX =
  /(^|\s)([a-z][\w.]*)((?::!=|:=|:|>=|<=|>|<|=))(`[^`]+`|\[[^\]]+\]|"[^"]+"|\S+)/gi

function buildExpression(token: string, operator: SearchQueryFilterOperator, value: string) {
  if (['>', '>=', '<', '<='].includes(operator)) {
    return `${token}:${operator}${value}`
  }
  if (operator === '=') {
    return `${token}:=${value}`
  }
  return `${token}${operator}${value}`
}

const stringOperators: SearchQueryFilterOperator[] = [':', ':=', ':!=', '=']
const numericOperators: SearchQueryFilterOperator[] = [':', ':=', ':!=', '=', '>', '>=', '<', '<=']

export const SEARCH_QUERY_FILTER_RULES: SearchQueryFilterRule[] = [
  {
    token: 'code',
    indexes: [SearchIndex.VARIANTS],
    operators: stringOperators,
    buildExpression: ({ operator, value }) => buildExpression('code', operator, value),
  },
  {
    token: 'components',
    indexes: [SearchIndex.VARIANTS],
    operators: stringOperators,
    buildExpression: ({ operator, value }) => buildExpression('components', operator, value),
  },
  {
    token: 'items',
    indexes: [SearchIndex.VARIANTS],
    operators: stringOperators,
    buildExpression: ({ operator, value }) => buildExpression('items', operator, value),
  },
  {
    token: 'tags',
    indexes: [SearchIndex.VARIANTS, SearchIndex.PLACES, SearchIndex.ITEMS, SearchIndex.COMPONENTS],
    operators: stringOperators,
    buildExpression: ({ operator, value }) => buildExpression('tags', operator, value),
  },
  {
    token: 'placetype',
    indexes: [SearchIndex.REGIONS],
    operators: stringOperators,
    buildExpression: ({ operator, value }) => buildExpression('placetype', operator, value),
  },
  {
    token: 'admin_level',
    indexes: [SearchIndex.REGIONS],
    operators: numericOperators,
    buildExpression: ({ operator, value }) => buildExpression('admin_level', operator, value),
  },
  {
    token: 'technical',
    indexes: [SearchIndex.MATERIALS],
    operators: stringOperators,
    buildExpression: ({ operator, value }) => buildExpression('technical', operator, value),
  },
  {
    token: 'shape',
    indexes: [SearchIndex.MATERIALS],
    operators: stringOperators,
    buildExpression: ({ operator, value }) => buildExpression('shape', operator, value),
  },
  {
    token: 'ancestors',
    indexes: [SearchIndex.MATERIALS],
    operators: stringOperators,
    buildExpression: ({ operator, value }) => buildExpression('ancestors', operator, value),
  },
  {
    token: 'technical_descendants',
    indexes: [SearchIndex.MATERIALS],
    operators: stringOperators,
    buildExpression: ({ operator, value }) =>
      buildExpression('technical_descendants', operator, value),
  },
  {
    token: 'categories',
    indexes: [SearchIndex.ITEMS],
    operators: stringOperators,
    buildExpression: ({ operator, value }) => buildExpression('categories', operator, value),
  },
]

export function parseSearchQuery(query: string, indexes: SearchIndex[]) {
  const filtersByIndex = new Map<SearchIndex, SearchBackendFilter[]>(
    indexes.map((index) => [index, []]),
  )
  const matches: Array<{ start: number; end: number }> = []

  for (const match of query.matchAll(SEARCH_QUERY_FILTER_REGEX)) {
    const [fullMatch, , token, operator, value] = match

    matches.push({
      start: match.index ?? 0,
      end: (match.index ?? 0) + fullMatch.length,
    })

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
