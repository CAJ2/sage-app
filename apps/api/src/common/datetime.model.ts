import { GraphQLScalarType } from 'graphql'
import type { GraphQLScalarTypeConfig } from 'graphql'
import { DateTimeResolver } from 'graphql-scalars'
import { DateTime } from 'luxon'

export const GraphQLDateTimeConfig: GraphQLScalarTypeConfig<DateTime, string> = {
  name: 'DateTime',
  description: 'A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with RFC 3339.',

  serialize(value: unknown): string {
    if (value instanceof DateTime) {
      const dt = value.toISO()
      if (dt) return dt
      return ''
    }
    return DateTimeResolver.serialize(value).toISOString()
  },

  parseValue(value) {
    if (value instanceof DateTime) {
      return value
    }

    const date: Date = DateTimeResolver.parseValue(value)
    return DateTime.fromJSDate(date)
  },

  parseLiteral(ast) {
    const date: Date = DateTimeResolver.parseLiteral(ast, null)
    return DateTime.fromJSDate(date)
  },

  extensions: {
    codegenScalarType: 'DateTime | string',
  },
}

export const LuxonDateTimeResolver = new GraphQLScalarType<DateTime, string>(GraphQLDateTimeConfig)
