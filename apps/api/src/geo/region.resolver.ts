import { Args, ID, Query, Resolver } from '@nestjs/graphql'
import { NotFoundErr } from '@src/common/exceptions'
import { TransformService } from '@src/common/transform'
import {
  Region,
  RegionsArgs,
  RegionsPage,
  RegionsSearchByPointArgs,
} from './region.model'
import { RegionService } from './region.service'

@Resolver(() => Region)
export class RegionResolver {
  constructor(
    private readonly regionService: RegionService,
    private readonly transform: TransformService,
  ) {}

  @Query(() => RegionsPage, { name: 'getRegions' })
  async getRegions(@Args() args: RegionsArgs): Promise<RegionsPage> {
    const filter = this.transform.paginationArgs(args)
    const cursor = await this.regionService.find(filter)
    return this.transform.entityToPaginated(cursor, args, Region, RegionsPage)
  }

  @Query(() => Region, { name: 'getRegion', nullable: true })
  async getRegion(@Args('id', { type: () => ID }) id: string) {
    const region = await this.regionService.findOneByID(id)
    if (!region) {
      throw NotFoundErr('Region not found')
    }
    return this.transform.entityToModel(region, Region)
  }

  @Query(() => RegionsPage, { name: 'searchRegionsByPoint' })
  async searchRegionsByPoint(
    @Args() args: RegionsSearchByPointArgs,
  ): Promise<RegionsPage> {
    const filter = this.transform.paginationArgs(args)
    const cursor = await this.regionService.searchByPoint(
      {
        latitude: args.lat_long[0],
        longitude: args.lat_long[1],
      },
      filter,
    )
    return this.transform.entityToPaginated(cursor, args, Region, RegionsPage)
  }
}
