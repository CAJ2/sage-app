import { Extensions, Field, ID, ObjectType } from '@nestjs/graphql'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { CreatedUpdated } from '@src/graphql/created-updated.model'
import { Paginated } from '@src/graphql/paginated'
import { DateTime } from 'luxon'
import { z } from 'zod'

@ObjectType()
export class Region extends CreatedUpdated {
  @Field(() => ID)
  @Extensions({ z: z.string() })
  id!: string

  @Field(() => String, { nullable: true })
  @Extensions({ z: z.string().optional() })
  name?: string

  @Field(() => Number)
  @Extensions({ z: z.number().int() })
  admin_level!: number
}

@ObjectType()
export class RegionHistory {
  @Field(() => ID)
  region_id!: string

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
export class RegionPage extends Paginated(Region) {}
