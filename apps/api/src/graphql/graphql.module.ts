import { IncomingMessage } from 'http'
import { join } from 'path'

import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { DynamicModule, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { Int, GraphQLModule as NestGraphQLModule } from '@nestjs/graphql'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { DirectiveLocation, GraphQLBoolean, GraphQLDirective } from 'graphql'
import type { GraphQLFormattedError } from 'graphql'
import { JSONObjectDefinition, JSONObjectResolver } from 'graphql-scalars'

import { CacheControlScopeEnum } from './cache-control'
import { Context, IncomingMessageWithAuthCode } from './graphql.context'

@Module({})
export class GraphQLModule {
  static register(): DynamicModule {
    const graphQL = NestGraphQLModule.forRootAsync({
      driver: ApolloDriver,
      imports: [ConfigModule],

      useFactory: (configService: ConfigService): ApolloDriverConfig => {
        const context: Context = {}

        return {
          autoSchemaFile: join(process.cwd(), 'schema/schema.gql'),
          context: ({ req }: { req: IncomingMessage }) => {
            context.req = req
            return context
          },
          buildSchemaOptions: {
            directives: [
              new GraphQLDirective({
                args: {
                  inheritMaxAge: {
                    type: GraphQLBoolean,
                  },
                  maxAge: {
                    type: Int,
                  },
                  scope: {
                    type: CacheControlScopeEnum,
                  },
                },
                locations: [
                  DirectiveLocation.FIELD_DEFINITION,
                  DirectiveLocation.OBJECT,
                  DirectiveLocation.INTERFACE,
                  DirectiveLocation.UNION,
                ],
                name: 'cacheControl',
              }),
            ],
            scalarsMap: [{ type: () => JSONObjectDefinition, scalar: JSONObjectResolver }],
          },
          sortSchema: true,
          playground: false,
          plugins: [
            ApolloServerPluginLandingPageLocalDefault({
              embed: {
                endpointIsEditable: false,
              },
              includeCookies: true,
            }),
          ],
          introspection: true,
          hideSchemaDetailsFromClientErrors: false,
          resolvers: {
            DateTime: LuxonDateTimeResolver,
            JSONObject: JSONObjectResolver,
          },
          status400ForVariableCoercionErrors: true,
          formatError: (err: GraphQLFormattedError) => this.formatError(err, context),
        }
      },
    })

    return {
      module: GraphQLModule,
      imports: [graphQL],
      providers: [],
      exports: [graphQL],
    }
  }

  private static formatError(error: GraphQLFormattedError, ctx: Context): GraphQLFormattedError {
    const msg = ctx.req as IncomingMessageWithAuthCode
    if (!['PRODUCTION', 'TEST'].includes(process.env.NODE_ENV || '')) {
      // oxlint-disable-next-line no-console
      console.error('GraphQL Error:', error)
    }
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
}
