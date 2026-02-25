import { Resolver } from '@nestjs/graphql'

import { AuthService } from '@src/auth/auth.service'
import { User } from '@src/users/users.model'

@Resolver(() => User)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}
}
