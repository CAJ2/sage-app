import { EntityManager } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'
import { Org } from './org.entity'

@Injectable()
export class OrgService {
  constructor(private readonly em: EntityManager) {}

  async findOneByID(id: string) {
    return await this.em.findOne(Org, { id })
  }
}
