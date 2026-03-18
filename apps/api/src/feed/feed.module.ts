import { Module } from '@nestjs/common'

import { CommonModule } from '@src/common/common.module'
import { HomeFeedResolver } from '@src/feed/home-feed.resolver'
import { HomeFeedSchemaService } from '@src/feed/home-feed.schema'
import { HomeFeedService } from '@src/feed/home-feed.service'

@Module({
  imports: [CommonModule],
  providers: [HomeFeedResolver, HomeFeedService, HomeFeedSchemaService],
  exports: [HomeFeedService],
})
export class FeedModule {}
