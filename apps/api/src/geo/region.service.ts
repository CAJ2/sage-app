import { EntityManager, raw } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'

import { CursorOptions } from '@src/common/transform'

import { Region } from './region.entity'

@Injectable()
export class RegionService {
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
