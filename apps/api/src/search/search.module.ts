import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { AuthModule } from '@src/auth/auth.module'
import { CommonModule } from '@src/common/common.module'
import { CachedSearchBackendService } from '@src/search/cached-search-backend.service'
import { MistralService } from '@src/search/mistral.service'
import { SEARCH_BACKEND } from '@src/search/search.backend'
import { SearchResolver } from '@src/search/search.resolver'
import { SearchService } from '@src/search/search.service'
import { TypesenseSearchService } from '@src/search/typesense.service'

@Module({
  imports: [ConfigModule, CommonModule, MikroOrmModule.forFeature([]), AuthModule],
  providers: [
    MistralService,
    SearchResolver,
    SearchService,
    TypesenseSearchService,
    CachedSearchBackendService,
    {
      provide: SEARCH_BACKEND,
      useExisting: CachedSearchBackendService,
    },
  ],
  exports: [SearchService],
})
export class SearchModule {}
