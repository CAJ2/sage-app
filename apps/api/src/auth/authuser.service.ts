import { Injectable } from '@nestjs/common'
import type { Session, User } from 'better-auth'
import { ClsService } from 'nestjs-cls'

@Injectable()
export class AuthUserService {
  constructor(private readonly cls: ClsService) {}

  userID(): string | null {
    return this.getUser()?.id ?? null
  }

  sameUserOrAdmin(userID: string): boolean {
    const user = this.getUser()
    if (!user) return false
    return user.id === userID || user.role === 'admin'
  }

  admin(): boolean {
    const user = this.getUser()
    if (!user) return false
    return user.role === 'admin'
  }

  private getUser(): (User & { role: string | null }) | null {
    const session = this.getSession()
    if (session) return session.user
    // API key auth stores user directly without a session
    return (this.cls.get('user') as (User & { role: string | null }) | null) ?? null
  }

  private getSession(): {
    session: Session
    user: User & { role: string | null }
  } | null {
    return this.cls.get('session') as {
      session: Session
      user: User & { role: string | null }
    } | null
  }
}
