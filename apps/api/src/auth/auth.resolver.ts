import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { User as UserEntity } from '@src/users/users.entity'
import { CreateUserWithPasswordInput, User } from '@src/users/users.model'
import { UsersService } from '@src/users/users.service'
import { validateOrReject } from 'class-validator'
import { AuthService } from './auth.service'

@Resolver(() => User)
export class AuthResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Mutation(() => User, { name: 'createUserWithPassword' })
  async create(@Args('input') input: CreateUserWithPasswordInput) {
    await validateOrReject(input)
    let user = new UserEntity(
      input.email,
      input.username,
      input.given_name,
      input.family_name,
    )
    user = await this.usersService.create(user)
    await this.authService.addUserIdentityPassword(user.email, input.password)
    return user
  }
}
