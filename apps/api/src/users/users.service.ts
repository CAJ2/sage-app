import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { DB } from '@src/db.service'

export interface IdentityFields {
  created_at: Date
  id: string
  provider: string
  subject: string
  type: string
  updated_at: Date
}
const identitySelect = Prisma.validator<Prisma.IdentitySelect>()({
  created_at: true,
  id: true,
  multifactor: true,
  profile_data: true,
  provider: true,
  subject: true,
  type: true,
  updated_at: true,
})

@Injectable()
export class UsersService {
  constructor (private readonly db: DB) {}

  async findOneByID (id: string) {
    return await this.db.user.findUnique({
      select: {
        identities: {
          select: identitySelect,
        },
      },
      where: {
        id,
      },
    })
  }

  async findByUsernameOrEmail (usernameOrEmail: string) {
    let user = await this.db.user.findUnique({
      include: {
        identities: {
          select: identitySelect,
        },
      },
      where: {
        email: usernameOrEmail,
      },
    })
    if (!user) {
      user = await this.db.user.findUnique({
        include: {
          identities: {
            select: identitySelect,
          },
        },
        where: {
          username: usernameOrEmail,
        },
      })
    }
    return user
  }

  async findByUsernameOrEmailAuth (usernameOrEmail: string) {
    let user = await this.db.user.findUnique({
      include: {
        identities: true,
      },
      where: {
        email: usernameOrEmail,
      },
    })
    if (!user) {
      user = await this.db.user.findUnique({
        include: {
          identities: true,
        },
        where: {
          username: usernameOrEmail,
        },
      })
    }
    return user
  }

  async findIdentities (id: string): Promise<IdentityFields[] | null> {
    const identities = await this.db.user
      .findUnique({
        where: {
          id,
        },
      })
      .identities({
        select: {
          created_at: true,
          id: true,
          provider: true,
          subject: true,
          type: true,
          updated_at: true,
        },
      })
    return identities
  }
}
