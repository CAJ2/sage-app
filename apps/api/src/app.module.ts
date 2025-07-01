import path from 'path'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import config from '@src/config/config'
import dotenv from 'dotenv-flow'
import { Request } from 'express'
import { nanoid } from 'nanoid'
import { ClsModule, ClsService } from 'nestjs-cls'
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { ChangesModule } from './changes/changes.module'
import { parseLanguageHeader } from './db/i18n'
import { GeoModule } from './geo/geo.module'
import { GraphQLModule } from './graphql/graphql.module'
import { HealthModule } from './health/health.module'
import { ProcessModule } from './process/process.module'
import { ProductModule } from './product/product.module'
import { SearchModule } from './search/search.module'
import { UsersModule } from './users/users.module'

if (dotenv) {
  dotenv.config()
}

@Module({
  controllers: [AppController],
  exports: [],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true,
      load: [config],
    }),
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        setup: (cls: ClsService, req: Request) => {
          if (req.headers['accept-language']) {
            cls.set('lang', parseLanguageHeader(req.headers['accept-language']))
          }
        },
        generateId: true,
        idGenerator: (req: Request) => {
          const existingId = req.headers['x-request-id']
          if (Array.isArray(existingId) || !existingId) {
            return nanoid()
          }
          return existingId
        },
      },
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      typesOutputPath: path.join(__dirname, '../src/i18n/i18n.generated.ts'),
      resolvers: [
        new QueryResolver(['lang', 'locale']),
        new HeaderResolver(['x-lang', 'x-locale']),
        AcceptLanguageResolver,
      ],
    }),
    MikroOrmModule.forRoot(),
    GraphQLModule.register(),
    HealthModule,
    AuthModule.registerAsync(),
    UsersModule,
    GeoModule,
    ProductModule,
    ProcessModule,
    ChangesModule,
    SearchModule,
  ],
  providers: [AppService],
})
export class AppModule {}
