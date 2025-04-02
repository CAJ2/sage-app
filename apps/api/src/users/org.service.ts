import { EntityManager } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'
import { CursorOptions } from '@src/common/transform'
import { Org } from './org.entity'
import { User } from './users.entity'

@Injectable()
export class OrgService {
  constructor(private readonly em: EntityManager) {}

  async findOneByID(id: string) {
    return await this.em.findOne(Org, { id })
  }

  async users(orgID: string, opts: CursorOptions<User>) {
    opts.where.orgs = orgID
    const users = await this.em.find(User, opts.where, opts.options)
    const count = await this.em.count(User, opts.where)
    return {
      items: users,
      count,
    }
  }
}
