import { Args, ID, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { NotFoundErr } from '@src/common/exceptions'
import { TransformService } from '@src/common/transform'

import { Org, OrgsPage } from './org.model'
import { User, UsersOrgsArgs } from './users.model'
import { UsersService } from './users.service'

@Resolver(() => User)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly transform: TransformService,
  ) {}

  @Query(() => User, { name: 'user', nullable: true })
  async user(@Args('id', { type: () => ID }) id: string) {
    const user = await this.usersService.findOneByID(id)
    if (!user) {
      throw NotFoundErr('User not found')
    }
    const result = await this.transform.entityToModel(User, user)
    return result
  }

  @ResolveField()
  async orgs(@Parent() user: User, @Args() args: UsersOrgsArgs) {
    const [parsedArgs, filter] = await this.transform.paginationArgs(UsersOrgsArgs, args)
    const cursor = await this.usersService.orgs(user.id, filter)
    return this.transform.entityToPaginated(Org, OrgsPage, cursor, parsedArgs)
  }
}
