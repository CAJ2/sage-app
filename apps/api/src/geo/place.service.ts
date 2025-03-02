import { Injectable } from '@nestjs/common'
import { DB } from '@src/db.service'
import { PlacePage } from './place.model'

@Injectable()
export class PlaceService {
  constructor(private readonly db: DB) {}

  async findAll(page: number, perPage: number): Promise<PlacePage | null> {
    return null
  }

  async findById(id: string) {
    return this.db.place.findUnique({
      where: { id },
      include: {
        tags: true,
      },
    })
  }
}
