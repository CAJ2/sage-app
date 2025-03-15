import { Extensions, Field, ObjectType } from '@nestjs/graphql'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { IDCreatedUpdated } from '@src/graphql/base.model'
import { Paginated } from '@src/graphql/paginated'
import { Org } from '@src/users/org.model'
import { MaxLength } from 'class-validator'
import { DateTime } from 'luxon'
import { z } from 'zod'
import { Place as PlaceEntity } from './place.entity'

@ObjectType()
export class PlaceTag {
  @Field(() => String)
  @Extensions({ z: z.string() })
  tag_name: string = ''
}

@ObjectType()
export class Place extends IDCreatedUpdated<PlaceEntity> {
  @Field(() => String, { nullable: true })
  @MaxLength(1024)
  name?: string

  @Field(() => String, { nullable: true })
  @MaxLength(1024)
  address?: string

  @Field(() => String, { nullable: true })
  desc?: string

  @Field(() => [PlaceTag])
  tags: PlaceTag[] = []

  @Field(() => Org, { nullable: true })
  org?: Org & {}

  @Field(() => [PlaceHistory])
  history: PlaceHistory[] = []
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
export class PlacePage extends Paginated(Place) {}
