import { IncomingMessage } from 'http'
import { join } from 'path'
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default'
import { ApolloDriver } from '@nestjs/apollo'
import { DynamicModule, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { Int, GraphQLModule as NestGraphQLModule } from '@nestjs/graphql'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import {
  DirectiveLocation,
  GraphQLBoolean,
  GraphQLDirective,
  GraphQLError,
} from 'graphql'
import { CacheControlScopeEnum } from './cache-control'
import { Context, IncomingMessageWithAuthCode } from './graphql.context'
import type { GraphQLFormattedError } from 'graphql'

@Module({})
export class GraphQLModule {
  static register(): DynamicModule {
    const graphQL = NestGraphQLModule.forRootAsync({
      driver: ApolloDriver,
      imports: [ConfigModule],

      useFactory: (configService: ConfigService) => {
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
          },
          sortSchema: true,
          playground: false,
          plugins: [
            ApolloServerPluginLandingPageLocalDefault({
              embed: true,
            }),
          ],
          resolvers: {
            DateTime: LuxonDateTimeResolver,
          },
          formatError: (err: GraphQLError) => this.formatError(err, context),
          bodyParserConfig: false,
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

  private static formatError(
    error: GraphQLError,
    ctx: Context,
  ): GraphQLFormattedError {
    const msg = ctx.req as IncomingMessageWithAuthCode
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
