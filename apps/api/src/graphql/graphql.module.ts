import { IncomingMessage } from 'http'
import { join } from 'path'

import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { DynamicModule, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { Int, GraphQLModule as NestGraphQLModule } from '@nestjs/graphql'
import { DirectiveLocation, GraphQLBoolean, GraphQLDirective } from 'graphql'
import type { GraphQLFormattedError } from 'graphql'
import { JSONObjectDefinition, JSONObjectResolver } from 'graphql-scalars'

import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { CacheControlScopeEnum } from '@src/graphql/cache-control'
import { Context } from '@src/graphql/graphql.context'

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
          formatError: (err: GraphQLFormattedError) => GraphQLModule.formatError(err),
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

  private static formatError(error: GraphQLFormattedError): GraphQLFormattedError {
    if (!['PRODUCTION', 'TEST'].includes((process.env.NODE_ENV || '').toUpperCase())) {
      // oxlint-disable-next-line no-console
      console.error('GraphQL Error:', error)
    }
    if (process.env.NODE_ENV === 'production') {
      delete error.extensions?.stacktrace
    }
    return error
  }
}
