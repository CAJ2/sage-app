import { EntityManager } from '@mikro-orm/postgresql'
import { Inject, Injectable } from '@nestjs/common'
import { UsersService } from '@src/users/users.service'
import { AUTH_INSTANCE_KEY } from './symbols'
import type { Auth } from 'better-auth'

@Injectable()
export class AuthService<T extends { api: T['api'] } = Auth> {
  constructor(
    @Inject(AUTH_INSTANCE_KEY)
    private readonly auth: T,
    private readonly usersService: UsersService,
    private readonly em: EntityManager,
  ) {}

  /**
   * Returns the API endpoints provided by the auth instance
   */
  get api() {
    return this.auth.api
  }

  /**
   * Returns the complete auth instance
   * Access this for plugin-specific functionality
   */
  get instance(): T {
    return this.auth
  }
}
