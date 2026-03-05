import { MikroOrmModule } from '@mikro-orm/nestjs'
import { MikroORM } from '@mikro-orm/postgresql'
import { Test, TestingModule } from '@nestjs/testing'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { BaseSeeder } from '@src/db/seeds/BaseSeeder'
import { ADMIN_USER_ID, UserSeeder } from '@src/db/seeds/UserSeeder'
import { clearDatabase } from '@src/db/test.utils'
import { MIKRO_TEST_CONFIG } from '@src/mikro-orm-test.config'
import { User } from '@src/users/users.entity'
import { UsersService } from '@src/users/users.service'

describe('UsersService (integration)', () => {
  let module: TestingModule
  let service: UsersService
  let orm: MikroORM

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [MikroOrmModule.forRoot(MIKRO_TEST_CONFIG)],
      providers: [UsersService],
    }).compile()

    service = module.get<UsersService>(UsersService)
    orm = module.get<MikroORM>(MikroORM)

    await clearDatabase(orm, 'public', ['users'])
    await orm.seeder.seed(BaseSeeder, UserSeeder)
  })

  afterAll(async () => {
    await module.close()
  })

  describe('findOneByID', () => {
    it('returns the admin user by ID', async () => {
      const user = await service.findOneByID(ADMIN_USER_ID!)
      expect(user).toBeTruthy()
      expect(user?.username).toBe('admin')
      expect(user?.email).toBe('admin@sageleaf.app')
      expect(user?.name).toBe('Admin')
    })

    it('returns null for an unknown ID', async () => {
      const user = await service.findOneByID('00000000-0000-0000-0000-000000000000')
      expect(user).toBeNull()
    })
  })

  describe('findByUsernameOrEmail', () => {
    it('finds a user by email', async () => {
      const user = await service.findByUsernameOrEmail('admin@sageleaf.app')
      expect(user?.username).toBe('admin')
    })

    it('finds a user by username', async () => {
      const user = await service.findByUsernameOrEmail('admin')
      expect(user?.username).toBe('admin')
    })

    it('returns null when no match', async () => {
      const user = await service.findByUsernameOrEmail('nobody@nowhere.com')
      expect(user).toBeNull()
    })
  })

  describe('create', () => {
    // Use a unique email per run to avoid conflicts from previous test runs
    const uniqueEmail = `svc-test-${Date.now()}@example.com`

    it('creates and persists a new user', async () => {
      orm.em.clear()
      const newUser = new User(uniqueEmail, `svcuser${Date.now()}`, 'Service Test User')
      newUser.displayUsername = 'SvcTestUser'
      newUser.createdAt = new Date()
      newUser.updatedAt = new Date()

      const saved = await service.create(newUser)
      expect(saved.email).toBe(uniqueEmail)
      expect(saved.id).toBeDefined()
    })

    it('throws BAD_REQUEST when email already exists', async () => {
      orm.em.clear()
      // admin@sageleaf.app is guaranteed to exist from the seeder
      const duplicate = new User('admin@sageleaf.app', 'otheradmin2', 'Other Admin')
      duplicate.displayUsername = 'OtherAdmin2'
      duplicate.createdAt = new Date()
      duplicate.updatedAt = new Date()

      await expect(service.create(duplicate)).rejects.toMatchObject({
        extensions: { code: 'BAD_REQUEST' },
      })
    })
  })
})
