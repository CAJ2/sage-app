import { Args, ID, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'

import { OptionalAuth } from '@src/auth/decorators'
import { NotFoundErr } from '@src/common/exceptions'
import { TransformService } from '@src/common/transform'
import { Place, PlacesArgs, PlacesPage } from '@src/geo/place.model'
import { PlaceService } from '@src/geo/place.service'
import { Tag } from '@src/process/tag.model'
import { Org } from '@src/users/org.model'

@Resolver(() => Place)
export class PlaceResolver {
  constructor(
    private readonly placeService: PlaceService,
    private readonly transform: TransformService,
  ) {}

  @Query(() => PlacesPage, { name: 'places' })
  @OptionalAuth()
  async places(@Args() args: PlacesArgs): Promise<PlacesPage> {
    const [parsedArgs, filter] = await this.transform.paginationArgs(PlacesArgs, args)
    const cursor = await this.placeService.find(filter)
    return this.transform.entityToPaginated(Place, PlacesPage, cursor, parsedArgs)
  }

  @Query(() => Place, { name: 'place', nullable: true })
  @OptionalAuth()
  async place(@Args('id', { type: () => ID }) id: string): Promise<Place> {
    const place = await this.placeService.findOneByID(id)
    if (!place) {
      throw NotFoundErr('Place not found')
    }
    return this.transform.entityToModel(Place, place)
  }

  @ResolveField()
  async tags(@Parent() place: Place) {
    const tags = await this.placeService.tags(place.id)
    return this.transform.entitiesToModels(Tag, tags)
  }

  @ResolveField()
  async org(@Parent() place: Place) {
    const org = await this.placeService.org(place.id, place.entity)
    if (!org) {
      return null
    }
    return this.transform.entityToModel(Org, org)
  }
}
