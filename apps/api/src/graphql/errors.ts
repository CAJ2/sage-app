import { GraphQLError } from 'graphql'
import type { GraphQLFormattedError } from 'graphql'

export function formatError(
  error: GraphQLError,
  ctx: any,
): GraphQLFormattedError {
  const msg = ctx.req as any
  if (msg.authCode) {
    if (msg.authCode === 401) {
      return {
        message: 'Unauthorized',
        extensions: {
          code: 401,
        },
      }
    }
    if (msg.authCode === 403) {
      return {
        message: 'Forbidden',
        extensions: {
          code: 403,
        },
      }
    }
  }

  // If in production, delete stacktrace
  if (process.env.NODE_ENV === 'production') {
    delete error.extensions?.stacktrace
  }
  return error
}
