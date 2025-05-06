import {
  Args,
  ID,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql'
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

  @Query(() => User, { name: 'getUser', nullable: true })
  async getUser(@Args('id', { type: () => ID }) id: string) {
    const user = await this.usersService.findOneByID(id)
    if (!user) {
      throw NotFoundErr('User not found')
    }
    const result = await this.transform.entityToModel(user, User)
    return result
  }

  @ResolveField()
  async orgs(@Parent() user: User, @Args() args: UsersOrgsArgs) {
    const filter = this.transform.paginationArgs(args)
    const cursor = await this.usersService.orgs(user.id, filter)
    return this.transform.entityToPaginated(cursor, args, Org, OrgsPage)
  }
}
