import { EntityManager } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'
import { BadRequestErr } from '@src/common/exceptions'
import { User } from './users.entity'

@Injectable()
export class UsersService {
  constructor(private readonly em: EntityManager) {}

  async findOneByID(id: string) {
    return await this.em.findOne(User, { id })
  }

  async findByUsernameOrEmail(usernameOrEmail: string) {
    let user = await this.em.findOne(User, { email: usernameOrEmail })
    if (!user) {
      user = await this.em.findOne(User, { username: usernameOrEmail })
    }
    return user
  }

  async findByUsernameOrEmailAuth(usernameOrEmail: string) {
    let user = await this.em.findOne(User, { email: usernameOrEmail })
    if (!user) {
      user = await this.em.findOne(User, { username: usernameOrEmail })
    }
    return user
  }

  async create(user: User) {
    let existing = await this.em.findOne(User, { email: user.email })
    if (!existing) {
      existing = await this.em.findOne(User, { username: user.username })
    }
    if (existing) {
      throw BadRequestErr('User already exists')
    }
    await this.em.persistAndFlush(user)
    return user
  }
}
