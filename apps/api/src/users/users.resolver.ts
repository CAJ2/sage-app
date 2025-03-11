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
import { User, UsersOrgsFilter } from './users.model'
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
    const result = await entityToModel(user, User)
    return result
  }

  @ResolveField()
  async orgs(@Parent() user: User, @Args('filter') filter: UsersOrgsFilter) {
    return { totalCount: 0 }
  }
}
