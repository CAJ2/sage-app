import { Args, Query, Resolver } from '@nestjs/graphql'

import { OptionalAuth } from '@src/auth/decorators'
import { BadRequestErr } from '@src/common/exceptions'
import { TransformService } from '@src/common/transform'
import { SearchArgs, SearchResultPage } from '@src/search/search.model'
import { SearchService } from '@src/search/search.service'

@Resolver(() => SearchResultPage)
export class SearchResolver {
  constructor(
    private readonly searchService: SearchService,
    private readonly transformService: TransformService,
  ) {}

  @Query(() => SearchResultPage, { name: 'search' })
  @OptionalAuth()
  async search(@Args() args: SearchArgs): Promise<any> {
    const result = SearchArgs.schema.safeParse(args)
    if (!result.success) {
      throw BadRequestErr('Invalid search arguments')
    }
    const cursor = await this.searchService.searchAll(
      args.query,
      args.types,
      args.latlong,
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
    return this.transformService.objectsToPaginated(SearchResultPage, cursor)
  }
}
