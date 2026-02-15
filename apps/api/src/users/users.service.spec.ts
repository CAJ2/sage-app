import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Test, TestingModule } from '@nestjs/testing'

import { MIKRO_TEST_CONFIG } from '@src/mikro-orm-test.config'

import { UsersService } from './users.service'

describe('UsersService', () => {
  let module: TestingModule
  let service: UsersService

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [MikroOrmModule.forRoot(MIKRO_TEST_CONFIG)],
      providers: [UsersService],
    }).compile()

    service = module.get<UsersService>(UsersService)
  })

  afterEach(async () => {
    if (module) {
      await module.close()
    }
  })

  test('should be defined', () => {
    expect(service).toBeDefined()
  })
})
