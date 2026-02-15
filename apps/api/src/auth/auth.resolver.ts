import { Resolver } from '@nestjs/graphql'

import { User } from '@src/users/users.model'

import { AuthService } from './auth.service'

@Resolver(() => User)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}
}
