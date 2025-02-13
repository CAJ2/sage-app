import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default'
import config from '@config/config'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { GraphQLModule, Int } from '@nestjs/graphql'
import { DirectiveLocation, GraphQLBoolean, GraphQLDirective } from 'graphql'
import { join } from 'path'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { DB } from './db.service'
import { CacheControlScopeEnum } from './graphql/cache-control'
import { UsersModule } from './users/users.module'

@Module({
  controllers: [AppController],
  exports: [DB],
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      autoSchemaFile: join(process.cwd(), 'schema/schema.gql'),
      buildSchemaOptions: {
        directives: [
          new GraphQLDirective({
            args: {
              inheritMaxAge: {
                type: GraphQLBoolean
              },
              maxAge: {
                type: Int
              },
              scope: {
                type: CacheControlScopeEnum
              }
            },
            locations: [
              DirectiveLocation.FIELD_DEFINITION,
              DirectiveLocation.OBJECT,
              DirectiveLocation.INTERFACE,
              DirectiveLocation.UNION
            ],
            name: 'cacheControl'
          })
        ]
      },
      driver: ApolloDriver,
      include: [AuthModule, UsersModule],
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      sortSchema: true
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config]
    }),
    AuthModule,
    UsersModule
  ],
  providers: [AppService, DB]
})
export class AppModule {}
