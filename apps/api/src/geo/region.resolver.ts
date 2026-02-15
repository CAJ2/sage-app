import { Args, ID, Query, Resolver } from '@nestjs/graphql'
import { NotFoundErr } from '@src/common/exceptions'
import { TransformService } from '@src/common/transform'

import { Region, RegionsArgs, RegionsPage, RegionsSearchByPointArgs } from './region.model'
import { RegionService } from './region.service'

@Resolver(() => Region)
export class RegionResolver {
  constructor(
    private readonly regionService: RegionService,
    private readonly transform: TransformService,
  ) {}

  @Query(() => RegionsPage, { name: 'regions' })
  async regions(@Args() args: RegionsArgs): Promise<RegionsPage> {
    const [parsedArgs, filter] = await this.transform.paginationArgs(RegionsArgs, args)
    const cursor = await this.regionService.find(filter)
    return this.transform.entityToPaginated(Region, RegionsPage, cursor, parsedArgs)
  }

  @Query(() => Region, { name: 'region', nullable: true })
  async region(@Args('id', { type: () => ID }) id: string) {
    const region = await this.regionService.findOneByID(id)
    if (!region) {
      throw NotFoundErr('Region not found')
    }
    return this.transform.entityToModel(Region, region)
  }

  @Query(() => RegionsPage, { name: 'searchRegionsByPoint' })
  async searchRegionsByPoint(@Args() args: RegionsSearchByPointArgs): Promise<RegionsPage> {
    const [parsedArgs, filter] = await this.transform.paginationArgs(RegionsSearchByPointArgs, args)
    const cursor = await this.regionService.searchByPoint(
      {
        latitude: args.latlong[0],
        longitude: args.latlong[1],
      },
      filter,
    )
    return this.transform.entityToPaginated(Region, RegionsPage, cursor, parsedArgs)
  }
}
