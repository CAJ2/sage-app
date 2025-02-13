import { Args, ID, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'

import { User } from './users.model'
import { UsersService } from './users.service'

@Resolver(() => User)
export class UsersResolver {
  constructor (
    private readonly usersService: UsersService
  ) {}

  @Query(() => User, { name: 'getUser' })
  async user (@Args('id', { type: () => ID }) id: string) {
    return await this.usersService.findOneByID(id)
  }

  @ResolveField()
  async identities (@Parent() user: User) {
    const { id } = user
    return await this.usersService.findIdentities(id)
  }
}
