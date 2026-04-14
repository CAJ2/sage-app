import { ArgsType, Field, ID, Int, ObjectType } from '@nestjs/graphql'
import { DateTime } from 'luxon'
import { z } from 'zod/v4'

import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { CreatedUpdated, registerModel } from '@src/graphql/base.model'
import { Paginated, PaginationBasicArgs } from '@src/graphql/paginated'

@ObjectType({ description: "A geographic region based on the Who's On First dataset" })
export class Region extends CreatedUpdated {
  @Field(() => ID)
  id!: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  desc?: string

  @Field(() => String, {
    description: 'The type of geographic entity (e.g. country, region, locality)',
  })
  placetype!: string

  @Field(() => [Number], {
    nullable: true,
    description: 'Bounding box as [minLon, minLat, maxLon, maxLat]',
  })
  bbox?: number[]

  @Field(() => Number, {
    nullable: true,
    description: 'Minimum map zoom level at which this region should be displayed',
  })
  minZoom?: number
}
registerModel('Region', Region)

@ObjectType()
export class RegionHistory {
  @Field(() => ID)
  regionID!: string

  @Field(() => LuxonDateTimeResolver)
  datetime!: DateTime

  @Field(() => String)
  userID!: string

  @Field(() => String, { nullable: true })
  original?: string

  @Field(() => String, { nullable: true })
  changes?: string
}

@ObjectType()
export class RegionsPage extends Paginated(Region) {}

@ArgsType()
export class RegionSearchWithinArgs {
  @Field(() => String)
  query!: string

  @Field(() => Int, { nullable: true })
  adminLevel?: number

  @Field(() => Int, { nullable: true })
  limit?: number

  @Field(() => Int, { nullable: true })
  offset?: number
}

@ArgsType()
export class RegionsArgs extends PaginationBasicArgs {
  static schema = PaginationBasicArgs.schema
}

@ArgsType()
export class RegionsSearchByPointArgs extends PaginationBasicArgs {
  static schema = PaginationBasicArgs.schema.extend({
    latlong: z.array(z.number()),
  })

  @Field(() => [Number])
  latlong!: number[]
}

@ObjectType()
export class CurrentRegion {
  @Field(() => Region, { nullable: true })
  region?: Region

  @Field(() => [Region])
  regionHierarchy!: Region[]
}

export const RegionIDSchema = z.string().meta({
  id: 'Region',
  name: 'Region ID',
})
