import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { AuthModule } from '@src/auth/auth.module'
import { CommonModule } from '@src/common/common.module'
import { SEARCH_BACKEND } from '@src/search/search.backend'
import { SearchResolver } from '@src/search/search.resolver'
import { SearchService } from '@src/search/search.service'
import { TypesenseSearchService } from '@src/search/typesense.service'

@Module({
  imports: [ConfigModule, CommonModule, MikroOrmModule.forFeature([]), AuthModule],
  providers: [
    SearchResolver,
    SearchService,
    TypesenseSearchService,
    {
      provide: SEARCH_BACKEND,
      useExisting: TypesenseSearchService,
    },
  ],
  exports: [SearchService],
})
export class SearchModule {}
