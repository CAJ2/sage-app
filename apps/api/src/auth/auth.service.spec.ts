import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Test, TestingModule } from '@nestjs/testing'

import { AuthModule } from '@src/auth/auth.module'
import { AuthService } from '@src/auth/auth.service'
import { CommonModule } from '@src/common/common.module'
import { MIKRO_TEST_CONFIG } from '@src/mikro-orm-test.config'
import { UsersService } from '@src/users/users.service'

describe('AuthService', () => {
  let module: TestingModule
  let service: AuthService

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [CommonModule, MikroOrmModule.forRoot(MIKRO_TEST_CONFIG), AuthModule],
      providers: [AuthService, UsersService],
    }).compile()

    service = module.get<AuthService>(AuthService)
  })

  afterEach(async () => {
    await module.close()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
