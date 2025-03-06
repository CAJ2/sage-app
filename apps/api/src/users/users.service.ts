import { EntityManager } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'
import { BadRequestErr } from '@src/common/exceptions'
import { User } from './users.entity'

const identityInclude = [
  '*',
  'identities.id',
  'identities.created_at',
  'identities.updated_at',
  'identities.provider',
  'identities.subject',
  'identities.type',
  'identities.profile_data',
  'identities.multifactor',
] as const

@Injectable()
export class UsersService {
  constructor(private readonly em: EntityManager) {}

  async findOneByID(id: string) {
    return await this.em.findOne(
      User,
      { id },
      { populate: ['identities'], fields: identityInclude },
    )
  }

  async findByUsernameOrEmail(usernameOrEmail: string) {
    let user = await this.em.findOne(
      User,
      { email: usernameOrEmail },
      { populate: ['identities'], fields: identityInclude },
    )
    if (!user) {
      user = await this.em.findOne(
        User,
        { username: usernameOrEmail },
        { populate: ['identities'], fields: identityInclude },
      )
    }
    return user
  }

  async findByUsernameOrEmailAuth(usernameOrEmail: string) {
    let user = await this.em.findOne(
      User,
      { email: usernameOrEmail },
      { populate: ['identities'] },
    )
    if (!user) {
      user = await this.em.findOne(
        User,
        { username: usernameOrEmail },
        { populate: ['identities'] },
      )
    }
    return user
  }

  async findIdentities(id: string) {
    const user = await this.em.findOne(
      User,
      { id },
      { populate: ['identities'], fields: identityInclude },
    )
    return user?.identities
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
