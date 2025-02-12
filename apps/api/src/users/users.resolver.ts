import { Args, ID, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";

import { User } from "./users.model";
import { UsersService } from "./users.service";

@Resolver(() => User)
export class UsersResolver {
  constructor(
    private usersService: UsersService,
  ) {}

  @Query(() => User, {name: 'getUser'})
  async user(@Args('id', { type: () => ID }) id: string) {
    return this.usersService.findOneByID(id);
  }

  @ResolveField()
  async identities(@Parent() user: User) {
    const { id } = user;
    return this.usersService.findIdentities(id);
  }
}
