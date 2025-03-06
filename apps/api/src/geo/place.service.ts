import { EntityManager } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'
import { Place } from './place.entity'
import { PlacePage } from './place.model'

@Injectable()
export class PlaceService {
  constructor(private readonly em: EntityManager) {}

  async findAll(page: number, perPage: number): Promise<PlacePage | null> {
    return null
  }

  async findById(id: string) {
    return this.em.findOne(Place, { id }, { populate: ['tags'] })
  }
}
