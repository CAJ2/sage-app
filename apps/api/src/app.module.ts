import path from 'path'

import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import dotenv from 'dotenv-flow'
import { Request } from 'express'
import { nanoid } from 'nanoid'
import { ClsModule, ClsService } from 'nestjs-cls'
import { AcceptLanguageResolver, HeaderResolver, I18nModule, QueryResolver } from 'nestjs-i18n'

import { AppController } from '@src/app.controller'
import { AppService } from '@src/app.service'
import { AuthModule } from '@src/auth/auth.module'
import { ChangesModule } from '@src/changes/changes.module'
import { parseLanguageHeader } from '@src/common/i18n'
import config from '@src/config/config'
import { GeoModule } from '@src/geo/geo.module'
import { GraphQLModule } from '@src/graphql/graphql.module'
import { HealthModule } from '@src/health/health.module'
import { ProcessModule } from '@src/process/process.module'
import { ProductModule } from '@src/product/product.module'
import { SearchModule } from '@src/search/search.module'
import { UsersModule } from '@src/users/users.module'

import { isProd } from './common/common.utils'
import { MIKRO_CONFIG } from './mikro-orm.config'

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
        watch: !isProd(),
      },
      typesOutputPath: path.join(__dirname, '../src/i18n/i18n.generated.ts'),
      resolvers: [
        new QueryResolver(['lang', 'locale']),
        new HeaderResolver(['x-lang', 'x-locale']),
        AcceptLanguageResolver,
      ],
    }),
    MikroOrmModule.forRoot(MIKRO_CONFIG),
    AuthModule,
    GraphQLModule.register(),
    HealthModule,
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
