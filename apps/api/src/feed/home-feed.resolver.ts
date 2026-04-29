import { Args, Query, Resolver } from '@nestjs/graphql'

import { OptionalAuth } from '@src/auth/decorators'
import { TransformService } from '@src/common/transform'
import { FeedArgs, FeedConnection, FeedItem } from '@src/feed/home-feed.model'
import { HomeFeedService } from '@src/feed/home-feed.service'

@Resolver(() => FeedItem)
export class HomeFeedResolver {
  constructor(
    private readonly homeFeedService: HomeFeedService,
    private readonly transform: TransformService,
  ) {}

  @Query(() => FeedConnection, { name: 'feed' })
  @OptionalAuth()
  async feed(@Args() args: FeedArgs): Promise<FeedConnection> {
    const [parsedArgs, filter] = await this.transform.paginationArgs(FeedArgs, args)
    const cursor = await this.homeFeedService.find(filter, args.region, args.format)
    return this.transform.entityToPaginated(
      FeedItem,
      FeedConnection,
      cursor,
      parsedArgs,
    ) as Promise<FeedConnection>
  }
}
