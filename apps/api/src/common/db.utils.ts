import { BaseEntity } from '@mikro-orm/core'
import type { OrderDefinition } from '@mikro-orm/core'

export function mapOrderBy<T extends BaseEntity>(
  orderBy: OrderDefinition<T> | undefined,
  mappings: Record<string, string>,
): { [key: string]: 'asc' | 'desc' } | undefined {
  const order = {}
  if (orderBy) {
    for (const key in orderBy) {
      const value = (orderBy as any)[key]
      if (typeof value === 'string') {
        ;(order as any)[mappings[key] || key] = value
      }
    }
  } else {
    return undefined
  }
  return order
}
