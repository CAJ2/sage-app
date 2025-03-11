import { Resolver } from '@nestjs/graphql'
import { User } from '@src/users/users.model'
import { UsersService } from '@src/users/users.service'
import { AuthService } from './auth.service'

@Resolver(() => User)
export class AuthResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}
}
