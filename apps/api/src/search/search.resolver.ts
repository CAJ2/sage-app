import { Args, Query, Resolver } from '@nestjs/graphql'
import { SearchArgs, SearchResultPage } from './search.model'
import { SearchService } from './search.service'

@Resolver(() => SearchResultPage)
export class SearchResolver {
  constructor(private readonly searchService: SearchService) {}

  @Query(() => SearchResultPage, { name: 'search' })
  async search(@Args() args: SearchArgs): Promise<any> {
    const cursor = await this.searchService.searchAll(args.query)
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
    return cursor
  }
}
