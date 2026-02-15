import type { EntityManager } from '@mikro-orm/core'
import { Seeder } from '@mikro-orm/seeder'

import { Account } from '@src/auth/account.entity'
import { User } from '@src/users/users.entity'

export class UserSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const admin = await em.findOne(User, {
      username: 'admin',
    })
    if (!admin) {
      const adminUser = em.create(User, {
        username: 'admin',
        email: 'admin@sageleaf.app',
        emailVerified: true,
        name: 'Admin',
        displayUsername: 'Admin',
        createdAt: new Date(),
        updatedAt: new Date(),
        lang: 'en',
        role: 'admin',
      })
      em.create(Account, {
        accountId: adminUser.id,
        providerId: 'credential',
        password:
          '13c406b3c54c794dfa092d869b95753f:6695802a1452f75fcf29d5319cdea4dc3635232c71d63cb33181b9aefc35b1e8454a2f1e3f7537f87415406e3b391d8a0ae7ec59aa3b3678903369260c1b8e34',
        user: em.getReference(User, adminUser.id),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    const user = await em.findOne(User, {
      username: 'user',
    })
    if (!user) {
      const normalUser = em.create(User, {
        username: 'user',
        email: 'user@sageleaf.app',
        emailVerified: true,
        name: 'User',
        displayUsername: 'User',
        createdAt: new Date(),
        updatedAt: new Date(),
        lang: 'en',
        role: 'user',
      })
      em.create(Account, {
        accountId: normalUser.id,
        providerId: 'credential',
        password:
          '13c406b3c54c794dfa092d869b95753f:6695802a1452f75fcf29d5319cdea4dc3635232c71d63cb33181b9aefc35b1e8454a2f1e3f7537f87415406e3b391d8a0ae7ec59aa3b3678903369260c1b8e34',
        user: em.getReference(User, normalUser.id),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }
  }
}
