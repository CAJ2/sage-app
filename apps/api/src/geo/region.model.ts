import { ArgsType, Field, ID, ObjectType } from '@nestjs/graphql'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { translate } from '@src/common/i18n'
import { CreatedUpdated, registerModel } from '@src/graphql/base.model'
import { Paginated, PaginationBasicArgs } from '@src/graphql/paginated'
import { Transform } from 'class-transformer'
import { DateTime } from 'luxon'
import { z } from 'zod/v4'
import { Region as RegionEntity } from './region.entity'

function extractBbox(obj: RegionEntity): number[] | undefined {
  if (obj.properties && obj.properties['geom:bbox']) {
    return obj.properties['geom:bbox'].split(',').map(Number)
  }
}

@ObjectType()
export class Region extends CreatedUpdated<RegionEntity> {
  @Field(() => ID)
  id!: string

  @Field(() => String, { nullable: true })
  @Transform(translate)
  name?: string

  @Field(() => String)
  placetype!: string

  @Field(() => [Number], { nullable: true })
  bbox?: number[]

  @Field(() => Number, { nullable: true })
  minZoom?: number

  transform(entity: RegionEntity) {
    this.bbox = extractBbox(entity)
    if (entity.properties && entity.properties['lbl:minZoom']) {
      this.minZoom = Number(entity.properties['lbl:minZoom'])
    }
  }
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
export class RegionsArgs extends PaginationBasicArgs {}

@ArgsType()
export class RegionsSearchByPointArgs extends PaginationBasicArgs {
  @Field(() => [Number])
  latlong!: number[]
}

export const RegionIDSchema = z.string().meta({
  id: 'Region',
  name: 'Region ID',
})
