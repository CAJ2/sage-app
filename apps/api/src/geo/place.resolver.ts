import { Args, Query, Resolver } from '@nestjs/graphql'
import { Place, PlacePage } from './place.model'
import { PlaceService } from './place.service'

@Resolver(() => Place)
export class PlaceResolver {
  constructor (private readonly placeService: PlaceService) {}

  @Query(() => PlacePage)
  async places (
    @Args('page', { nullable: true, defaultValue: 1 }) page: number,
    @Args('perPage', { nullable: true, defaultValue: 10 }) perPage: number
  ): Promise<PlacePage | null> {
    return this.placeService.findAll(page, perPage)
  }

  @Query(() => Place, { nullable: true })
  async place (@Args('id') id: string) {
    return this.placeService.findById(id)
  }
}
