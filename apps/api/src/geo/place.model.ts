import { ArgsType, Field, ID, ObjectType } from '@nestjs/graphql'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { translate } from '@src/db/i18n'
import { CreatedUpdated } from '@src/graphql/base.model'
import { Paginated, PaginationBasicArgs } from '@src/graphql/paginated'
import { Tag } from '@src/process/tag.model'
import { Org } from '@src/users/org.model'
import { Transform } from 'class-transformer'
import { DateTime } from 'luxon'
import { Place as PlaceEntity } from './place.entity'

@ObjectType()
export class PlaceLocation {
  @Field(() => Number)
  latitude!: number

  @Field(() => Number)
  longitude!: number
}

@ObjectType()
export class PlaceAddress {
  @Field(() => String, { nullable: true })
  housenumber?: string

  @Field(() => String, { nullable: true })
  street?: string

  @Field(() => String, { nullable: true })
  city?: string

  @Field(() => String, { nullable: true })
  region?: string

  @Field(() => String, { nullable: true })
  postal_code?: string

  @Field(() => String, { nullable: true })
  country?: string
}

@ObjectType()
export class Place extends CreatedUpdated<PlaceEntity> {
  @Field(() => ID)
  id!: string

  @Field(() => String, { nullable: true })
  @Transform(translate)
  name?: string

  @Field(() => PlaceAddress, { nullable: true })
  @Transform(translate)
  address?: PlaceAddress

  @Field(() => String, { nullable: true })
  @Transform(translate)
  desc?: string

  @Field(() => PlaceLocation, { nullable: true })
  location?: PlaceLocation

  @Field(() => [Tag])
  tags: Tag[] = []

  @Field(() => Org, { nullable: true })
  org?: Org & {}
}

@ObjectType()
export class PlaceHistory {
  @Field(() => String)
  place_id!: string

  @Field(() => LuxonDateTimeResolver)
  datetime!: DateTime

  @Field(() => String)
  user_id!: string

  @Field(() => String, { nullable: true })
  original?: string

  @Field(() => String, { nullable: true })
  changes?: string
}

@ObjectType()
export class PlacesPage extends Paginated(Place) {}

@ArgsType()
export class PlacesArgs extends PaginationBasicArgs {}
