import { join } from 'path'
import { Global, Module } from '@nestjs/common'
import { ClsModule } from 'nestjs-cls'
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n'
import { BaseSchemaService } from './base.schema'
import { I18nService } from './i18n.service'
import { MeiliService } from './meilisearch.service'
import { TransformService } from './transform'
import { ZService } from './z.service'

@Global()
@Module({
  imports: [
    ClsModule.forRoot({ global: true }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: join(__dirname, '../i18n/'),
        watch: true,
      },
      typesOutputPath: join(__dirname, '../i18n/i18n.generated.ts'),
      resolvers: [
        new QueryResolver(['lang', 'locale']),
        new HeaderResolver(['x-lang', 'x-locale']),
        AcceptLanguageResolver,
      ],
    }),
  ],
  providers: [
    TransformService,
    MeiliService,
    BaseSchemaService,
    ZService,
    I18nService,
  ],
  exports: [
    TransformService,
    MeiliService,
    BaseSchemaService,
    ZService,
    I18nService,
  ],
})
export class CommonModule {}
