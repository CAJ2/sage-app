import { Args, Query, Resolver } from '@nestjs/graphql'
import { TransformService } from '@src/common/transform'
import { SearchArgs, SearchResultPage } from './search.model'
import { SearchService } from './search.service'

@Resolver(() => SearchResultPage)
export class SearchResolver {
  constructor(
    private readonly searchService: SearchService,
    private readonly transformService: TransformService,
  ) {}

  @Query(() => SearchResultPage, { name: 'search' })
  async search(@Args() args: SearchArgs): Promise<any> {
    const cursor = await this.searchService.searchAll(
      args.query,
      args.types,
      args.limit,
      args.offset,
    )
    if (!cursor) {
      return {
        edges: [],
        nodes: [],
        totalCount: 0,
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
        },
      }
    }
    return this.transformService.objectsToPaginated(cursor, SearchResultPage)
  }
}
