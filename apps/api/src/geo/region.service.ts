import { QueryOrder } from '@mikro-orm/core'
import { EntityManager, raw } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'

import { CursorOptions } from '@src/common/transform'
import { IEntityService, IsEntityService } from '@src/db/base.entity'
import { Region } from '@src/geo/region.entity'

@Injectable()
@IsEntityService(Region)
export class RegionService implements IEntityService<Region> {
  constructor(private readonly em: EntityManager) {}

  async find(opts: CursorOptions<Region>) {
    const regions = await this.em.find(Region, opts.where, opts.options)
    const count = await this.em.count(Region, opts.where)
    return {
      items: regions,
      count,
    }
  }

  async findOneByID(id: string) {
    return this.em.findOne(Region, { id })
  }

  async findManyByID(ids: string[]) {
    return this.em.find(Region, { id: { $in: ids } })
  }

  async findMostSpecificByPoint(args: {
    latitude: number
    longitude: number
  }): Promise<Region | null> {
    const { latitude, longitude } = args
    const results = await this.em.find(
      Region,
      {
        [raw(`ST_Contains(geo::geometry, ST_SetSrid(ST_MakePoint(?, ?), 4326))`, [
          longitude,
          latitude,
        ])]: true,
      },
      { orderBy: { adminLevel: QueryOrder.DESC_NULLS_LAST }, limit: 1 },
    )
    return results[0] ?? null
  }

  async searchByPoint(args: { latitude: number; longitude: number }, opts: CursorOptions<Region>) {
    const { latitude, longitude } = args
    const where = {
      ...opts.where,
      [raw(`ST_Contains(geo::geometry, ST_SetSrid(ST_MakePoint(?, ?), 4326))`, [
        longitude,
        latitude,
      ])]: true,
    }
    const regions = await this.em.find(Region, where, {
      ...opts.options,
      populate: ['id', 'name', 'placetype'],
    })
    const count = await this.em.count(Region, {
      ...opts.where,
      [raw(`ST_Contains(geo::geometry, ST_SetSrid(ST_MakePoint(?, ?), 4326))`, [
        longitude,
        latitude,
      ])]: true,
    })
    return {
      items: regions,
      count,
    }
  }
}
