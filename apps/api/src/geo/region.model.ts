import { Field, ID, ObjectType } from '@nestjs/graphql'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { IDCreatedUpdated } from '@src/graphql/base.model'
import { Paginated } from '@src/graphql/paginated'
import { DateTime } from 'luxon'
import { Region as RegionEntity } from './region.entity'

@ObjectType()
export class Region extends IDCreatedUpdated<RegionEntity> {
  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => Number)
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
