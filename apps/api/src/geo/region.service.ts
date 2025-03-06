import { EntityManager } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'
import { Region } from './region.entity'

@Injectable()
export class RegionService {
  constructor(private readonly em: EntityManager) {}

  async findAll(cursor: any, perPage: number) {
    return null
  }

  async findById(id: string) {
    return this.em.findOne(Region, { id })
  }
}
