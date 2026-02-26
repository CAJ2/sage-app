import { join } from 'path'

import { Global, Module } from '@nestjs/common'
import { ClsModule } from 'nestjs-cls'
import { AcceptLanguageResolver, HeaderResolver, I18nModule, QueryResolver } from 'nestjs-i18n'

import { BaseSchemaService } from '@src/common/base.schema'
import { I18nService } from '@src/common/i18n.service'
import { MeiliService } from '@src/common/meilisearch.service'
import { PosthogService } from '@src/common/posthog.service'
import { TransformService } from '@src/common/transform'
import { ZService } from '@src/common/z.service'

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
    PosthogService,
  ],
  exports: [
    TransformService,
    MeiliService,
    BaseSchemaService,
    ZService,
    I18nService,
    PosthogService,
  ],
})
export class CommonModule {}
