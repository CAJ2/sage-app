import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'

import { AuthModule } from '@src/auth/auth.module'
import { CommonModule } from '@src/common/common.module'
import { MeiliService } from '@src/search/meilisearch.service'
import { SearchResolver } from '@src/search/search.resolver'
import { SearchService } from '@src/search/search.service'

@Module({
  imports: [CommonModule, MikroOrmModule.forFeature([]), AuthModule],
  providers: [SearchResolver, SearchService, MeiliService],
  exports: [SearchService],
})
export class SearchModule {}
