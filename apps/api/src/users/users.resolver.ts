import {
  Args,
  ID,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql'
import { NotFoundErr } from '@src/common/exceptions'
import { entityToModel } from '@src/db/transform'
import { validateOrReject } from 'class-validator'
import { User } from './users.model'
import { UsersService } from './users.service'

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => User, { name: 'getUser' })
  async getUser(@Args('id', { type: () => ID }) id: string) {
    const user = await this.usersService.findOneByID(id)
    if (!user) {
      throw NotFoundErr('User not found')
    }
    const result = entityToModel(user, User)
    await validateOrReject(result)
    return result
  }

  @ResolveField()
  async identities(@Parent() user: User) {
    const { id } = user
    return await this.usersService.findIdentities(id)
  }
}
