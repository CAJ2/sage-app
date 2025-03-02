import { Extensions, Field, ID, ObjectType } from '@nestjs/graphql'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { CreatedUpdated } from '@src/graphql/created-updated.model'
import { Paginated } from '@src/graphql/paginated'
import { DateTime } from 'luxon'
import { z } from 'zod'

@ObjectType()
export class PlaceTag {
  @Field(() => String)
  @Extensions({ z: z.string() })
  tag_name: string = ''
}

@ObjectType()
export class Place extends CreatedUpdated {
  @Field(() => ID)
  @Extensions({ z: z.string().nanoid() })
  id: string = ''

  @Field(() => String, { nullable: true })
  @Extensions({ z: z.string().max(1024).optional() })
  name?: string

  @Field(() => String, { nullable: true })
  @Extensions({ z: z.string().max(1024).optional() })
  address?: string

  @Field(() => String, { nullable: true })
  @Extensions({ z: z.string().optional() })
  desc?: string

  @Field(() => [PlaceTag])
  @Extensions({ z: z.array(z.any()).default([]) })
  tags: PlaceTag[] = []

  // @Field(() => Org, { nullable: true })
  // @Extensions({ z: z.any().optional() })
  // org?: Org

  @Field(() => [PlaceHistory])
  @Extensions({ z: z.array(z.any()).default([]) })
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
