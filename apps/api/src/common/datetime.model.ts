import { GraphQLScalarType } from 'graphql'
import { DateTimeResolver } from 'graphql-scalars'
import { DateTime } from 'luxon'
import type { GraphQLScalarTypeConfig } from 'graphql'

export const GraphQLDateTimeConfig: GraphQLScalarTypeConfig<
  DateTime,
  DateTime
> = {
  name: 'DateTime',
  description:
    'An ISO8601 date-time string represented by a Luxon DateTime instance.',

  serialize (value) {
    if (value instanceof DateTime) {
      return value
    }

    const date: Date = DateTimeResolver.serialize(value)
    return DateTime.fromJSDate(date)
  },

  parseValue (value) {
    if (value instanceof DateTime) {
      return value
    }

    const date: Date = DateTimeResolver.parseValue(value)
    return DateTime.fromJSDate(date)
  },

  parseLiteral (ast) {
    const date: Date = DateTimeResolver.parseLiteral(ast, null)
    return DateTime.fromJSDate(date)
  },

  extensions: {
    codegenScalarType: 'DateTime | string',
  },
}

export const LuxonDateTimeResolver = new GraphQLScalarType(
  GraphQLDateTimeConfig
)
