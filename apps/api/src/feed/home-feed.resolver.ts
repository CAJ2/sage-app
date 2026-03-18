import { Args, Query, Resolver } from '@nestjs/graphql'

import { OptionalAuth } from '@src/auth/decorators'
import { TransformService } from '@src/common/transform'
import { FeedArgs, FeedItem, FeedPage } from '@src/feed/home-feed.model'
import { HomeFeedService } from '@src/feed/home-feed.service'

@Resolver(() => FeedItem)
export class HomeFeedResolver {
  constructor(
    private readonly homeFeedService: HomeFeedService,
    private readonly transform: TransformService,
  ) {}

  @Query(() => FeedPage, { name: 'feed' })
  @OptionalAuth()
  async feed(@Args() args: FeedArgs): Promise<FeedPage> {
    const [parsedArgs, filter] = await this.transform.paginationArgs(FeedArgs, args)
    const cursor = await this.homeFeedService.find(filter, args.regionId)
    return this.transform.entityToPaginated(
      FeedItem,
      FeedPage,
      cursor,
      parsedArgs,
    ) as Promise<FeedPage>
  }
}
