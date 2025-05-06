import { ArgsType, Field, ID, ObjectType } from '@nestjs/graphql'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { translate } from '@src/db/i18n'
import { CreatedUpdated } from '@src/graphql/base.model'
import { Paginated, PaginationBasicArgs } from '@src/graphql/paginated'
import { Transform } from 'class-transformer'
import { DateTime } from 'luxon'
import { Region as RegionEntity } from './region.entity'

@ObjectType()
export class Region extends CreatedUpdated<RegionEntity> {
  @Field(() => ID)
  id!: string

  @Field(() => String, { nullable: true })
  @Transform(translate)
  name?: string

  @Field(() => String)
  placetype!: string
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
export class RegionsPage extends Paginated(Region) {}

@ArgsType()
export class RegionsArgs extends PaginationBasicArgs {}

@ArgsType()
export class RegionsSearchByPointArgs extends PaginationBasicArgs {
  @Field(() => Number)
  latitude!: number

  @Field(() => Number)
  longitude!: number
}
