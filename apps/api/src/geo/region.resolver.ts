import { Args, ID, Query, Resolver } from '@nestjs/graphql'

import { OptionalAuth } from '@src/auth/decorators'
import { NotFoundErr } from '@src/common/exceptions'
import { TransformService } from '@src/common/transform'
import { LocationService } from '@src/geo/location.service'
import {
  CurrentRegion,
  Region,
  RegionsArgs,
  RegionsPage,
  RegionsSearchByPointArgs,
} from '@src/geo/region.model'
import { RegionService } from '@src/geo/region.service'

@Resolver(() => Region)
export class RegionResolver {
  constructor(
    private readonly regionService: RegionService,
    private readonly locationService: LocationService,
    private readonly transform: TransformService,
  ) {}

  @Query(() => RegionsPage, { name: 'regions' })
  @OptionalAuth()
  async regions(@Args() args: RegionsArgs): Promise<RegionsPage> {
    const [parsedArgs, filter] = await this.transform.paginationArgs(RegionsArgs, args)
    const cursor = await this.regionService.find(filter)
    return this.transform.entityToPaginated(Region, RegionsPage, cursor, parsedArgs)
  }

  @Query(() => Region, { name: 'region', nullable: true })
  @OptionalAuth()
  async region(@Args('id', { type: () => ID }) id: string) {
    const region = await this.regionService.findOneByID(id)
    if (!region) {
      throw NotFoundErr('Region not found')
    }
    return this.transform.entityToModel(Region, region)
  }

  @Query(() => CurrentRegion, { name: 'currentRegion', nullable: true })
  @OptionalAuth()
  async currentRegion(): Promise<CurrentRegion | null> {
    const ids = await this.locationService.resolveLocation()
    if (!ids || ids.length === 0) return null

    const [region, allRegions] = await Promise.all([
      this.regionService.findOneByID(ids[0]),
      this.regionService.findManyByID(ids),
    ])

    const sorted = allRegions.sort((a, b) => (b.adminLevel ?? 0) - (a.adminLevel ?? 0))
    const [regionModel, ...hierarchyModels] = await Promise.all([
      region ? this.transform.entityToModel(Region, region) : Promise.resolve(undefined),
      ...sorted.map((r) => this.transform.entityToModel(Region, r)),
    ])

    return {
      region: regionModel,
      regionHierarchy: hierarchyModels,
    }
  }

  @Query(() => RegionsPage, { name: 'searchRegionsByPoint' })
  @OptionalAuth()
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
