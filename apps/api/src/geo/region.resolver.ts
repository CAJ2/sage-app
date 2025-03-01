import { Args, Query, Resolver } from '@nestjs/graphql'
import { Region, RegionPage } from './region.model'
import { RegionService } from './region.service'

@Resolver(() => Region)
export class RegionResolver {
  constructor (private readonly regionService: RegionService) {}

  @Query(() => RegionPage)
  async regions (
    @Args('page', { nullable: true, defaultValue: 1 }) page: number,
    @Args('perPage', { nullable: true, defaultValue: 10 }) perPage: number
  ): Promise<RegionPage | null> {
    return null
  }

  @Query(() => Region, { nullable: true })
  async region (@Args('id') id: string) {
    return this.regionService.findById(id)
  }
}
