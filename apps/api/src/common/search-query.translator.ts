import { FilterQuery } from '@mikro-orm/core'
import { ASTNode, SearchQueryParser } from './search-query.parser'

export interface SearchTranslationConfig {
  defaultSearchFields?: string[]
  fieldMap?: Record<string, string>
}

export class SearchQueryTranslator {
  translate(ast: ASTNode | null, config: SearchTranslationConfig = {}): FilterQuery<any> {
    if (!ast) return {}
    return this.translateNode(ast, config)
  }

  private translateNode(node: ASTNode, config: SearchTranslationConfig): FilterQuery<any> {
    switch (node.type) {
      case 'AND': {
        const left = this.translateNode(node.left, config)
        const right = this.translateNode(node.right, config)
        // If left or right is empty, we don't need $and
        if (Object.keys(left).length === 0) return right
        if (Object.keys(right).length === 0) return left
        return { $and: [left, right] }
      }
      case 'OR': {
        const left = this.translateNode(node.left, config)
        const right = this.translateNode(node.right, config)
        if (Object.keys(left).length === 0 && Object.keys(right).length === 0) return {}
        if (Object.keys(left).length === 0) return right
        if (Object.keys(right).length === 0) return left
        return { $or: [left, right] }
      }
      case 'NOT': {
        const inner = this.translateNode(node.node, config)
        if (Object.keys(inner).length === 0) return {}
        return { $not: inner }
      }
      case 'FIELD': {
        const fieldName = this.mapField(node.field, config.fieldMap)
        let value: any = node.value

        // Check for exists
        if (node.comparator === ':' && value === '*' && !node.isString) {
          return { [fieldName]: { $ne: null } }
        }

        // Check for wildcards
        if (node.comparator === ':' && typeof value === 'string' && value.includes('*')) {
          return { [fieldName]: { $ilike: value.replace(/\*/g, '%') } }
        }

        // Numeric parsing if not string
        if (!node.isString && !isNaN(Number(value))) {
          value = Number(value)
        }

        switch (node.comparator) {
          case ':':
            if (typeof value === 'string') {
              return { [fieldName]: { $ilike: `%${value}%` } }
            }
            return { [fieldName]: value }
          case ':<':
            return { [fieldName]: { $lt: value } }
          case ':>':
            return { [fieldName]: { $gt: value } }
          case ':<=':
            return { [fieldName]: { $lte: value } }
          case ':>=':
            return { [fieldName]: { $gte: value } }
          default:
            return { [fieldName]: value }
        }
      }
      case 'TERM': {
        if (!node.value) return {}
        const defaultFields = config.defaultSearchFields || []
        if (defaultFields.length === 0) {
          // Fallback if no default fields are provided
          return {}
        }

        let value: any = node.value
        if (typeof value === 'string' && value.includes('*')) {
          value = value.replace(/\*/g, '%')
        } else if (typeof value === 'string') {
          value = `%${value}%`
        }

        const orClauses = defaultFields.map((field) => ({
          [field]: { $ilike: value },
        }))

        if (orClauses.length === 1) return orClauses[0]
        return { $or: orClauses }
      }
    }
  }

  private mapField(field: string, fieldMap?: Record<string, string>): string {
    if (!fieldMap) return field
    return fieldMap[field] || field
  }
}

export function parseAndTranslateSearchQuery(
  query: string,
  config: SearchTranslationConfig = {},
): FilterQuery<any> {
  const parser = new SearchQueryParser()
  const ast = parser.parse(query)
  const translator = new SearchQueryTranslator()
  return translator.translate(ast, config)
}