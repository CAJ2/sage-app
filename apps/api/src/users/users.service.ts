import { InjectRepository } from '@mikro-orm/nestjs'
import { EntityRepository } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'
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
  constructor(
    @InjectRepository(User)
    private readonly users: EntityRepository<User>,
  ) {}

  async findOneByID(id: string) {
    return await this.users.findOne(
      { id },
      { populate: ['identities'], fields: identityInclude },
    )
  }

  async findByUsernameOrEmail(usernameOrEmail: string) {
    let user = await this.users.findOne(
      { email: usernameOrEmail },
      { populate: ['identities'], fields: identityInclude },
    )
    if (!user) {
      user = await this.users.findOne(
        { username: usernameOrEmail },
        { populate: ['identities'], fields: identityInclude },
      )
    }
    return user
  }

  async findByUsernameOrEmailAuth(usernameOrEmail: string) {
    let user = await this.users.findOne(
      { email: usernameOrEmail },
      { populate: ['identities'] },
    )
    if (!user) {
      user = await this.users.findOne(
        { username: usernameOrEmail },
        { populate: ['identities'] },
      )
    }
    return user
  }

  async findIdentities(id: string) {
    const user = await this.users.findOne(
      { id },
      { populate: ['identities'], fields: identityInclude },
    )
    return user?.identities
  }
}
