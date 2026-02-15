import { Injectable } from '@nestjs/common'
import type { Session, User } from 'better-auth'
import { ClsService } from 'nestjs-cls'

@Injectable()
export class AuthUserService {
  constructor(private readonly cls: ClsService) {}

  userID(): string | null {
    const session = this.getSession()
    if (!session) {
      return null
    }
    return session.user.id
  }

  sameUserOrAdmin(userID: string): boolean {
    const session = this.getSession()
    if (!session) {
      return false
    }
    return session.user.id === userID || session.user.role === 'admin'
  }

  admin(): boolean {
    const session = this.getSession()
    if (!session) {
      return false
    }
    return session.user.role === 'admin'
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
