import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { DB } from '@src/db.service'

@Injectable()
export class RegionService {
  constructor (private readonly db: DB) {}

  async findAll (cursor: Prisma.RegionWhereUniqueInput, perPage: number) {
    return null
  }

  async findById (id: string) {
    return this.db.region.findUnique({
      where: { id },
    })
  }
}
