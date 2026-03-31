import { Args, ID, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'

import { AuthUser, type ReqUser } from '@src/auth/auth.guard'
import { OptionalAuth } from '@src/auth/decorators'
import { Change } from '@src/changes/change.model'
import { NotFoundErr } from '@src/common/exceptions'
import { TransformService } from '@src/common/transform'
import {
  CreatePlaceInput,
  CreatePlaceOutput,
  Place,
  PlacesArgs,
  PlacesPage,
  UpdatePlaceInput,
  UpdatePlaceOutput,
} from '@src/geo/place.model'
import { PlaceSchemaService } from '@src/geo/place.schema'
import { PlaceService } from '@src/geo/place.service'
import { ModelEditSchema } from '@src/graphql/base.model'
import { Tag } from '@src/process/tag.model'
import { Org } from '@src/users/org.model'

@Resolver(() => Place)
export class PlaceResolver {
  constructor(
    private readonly placeService: PlaceService,
    private readonly transform: TransformService,
    private readonly placeSchemaService: PlaceSchemaService,
  ) {}

  @Query(() => ModelEditSchema, { nullable: true })
  @OptionalAuth()
  async placeSchema(): Promise<ModelEditSchema> {
    return {
      create: {
        schema: this.placeSchemaService.CreateJSONSchema,
        uischema: this.placeSchemaService.CreateUISchema,
      },
      update: {
        schema: this.placeSchemaService.UpdateJSONSchema,
        uischema: this.placeSchemaService.UpdateUISchema,
      },
    }
  }

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
    const org = await this.placeService.org(place.id)
    if (!org) {
      return null
    }
    return this.transform.entityToModel(Org, org)
  }

  @Mutation(() => CreatePlaceOutput, { nullable: true })
  async createPlace(
    @Args('input') input: CreatePlaceInput,
    @AuthUser() user: ReqUser,
  ): Promise<CreatePlaceOutput> {
    input = await this.placeSchemaService.parseCreateInput(input)
    const created = await this.placeService.create(input, user.id)
    const model = await this.transform.entityToModel(Place, created.place)
    if (created.change) {
      const change = await this.transform.entityToModel(Change, created.change)
      return { place: model, change }
    }
    return { place: model }
  }

  @Mutation(() => UpdatePlaceOutput, { nullable: true })
  async updatePlace(
    @Args('input') input: UpdatePlaceInput,
    @AuthUser() user: ReqUser,
  ): Promise<UpdatePlaceOutput> {
    input = await this.placeSchemaService.parseUpdateInput(input)
    const updated = await this.placeService.update(input, user.id)
    const model = await this.transform.entityToModel(Place, updated.place)
    if (updated.change) {
      const change = await this.transform.entityToModel(Change, updated.change)
      const currentPlace = updated.currentPlace
        ? await this.transform.entityToModel(Place, updated.currentPlace)
        : undefined
      return { place: model, change, currentPlace }
    }
    return { place: model }
  }
}
