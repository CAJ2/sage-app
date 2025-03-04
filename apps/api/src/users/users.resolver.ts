import {
  Args,
  ID,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql'
import { plainToInstance } from 'class-transformer'
import { validateOrReject } from 'class-validator'
import { User } from './users.model'
import { UsersService } from './users.service'

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => User, { name: 'getUser' })
  async user(@Args('id', { type: () => ID }) id: string) {
    const user = await this.usersService.findOneByID(id)
    if (!user) {
      throw new Error('User not found')
    }
    const result = plainToInstance(User, user)
    await validateOrReject(result)
    return result
  }

  @ResolveField()
  async identities(@Parent() user: User) {
    const { id } = user
    return await this.usersService.findIdentities(id)
  }
}
