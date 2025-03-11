import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Test, TestingModule } from '@nestjs/testing'
import { UsersService } from '@src/users/users.service'
import { AuthModule } from './auth.module'
import { AuthService } from './auth.service'

describe('AuthService', () => {
  let module: TestingModule
  let service: AuthService

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [MikroOrmModule.forRoot(), AuthModule.registerAsync()],
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
