import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Test, TestingModule } from '@nestjs/testing'
import { UsersService } from './users.service'

describe('UsersService', () => {
  let module: TestingModule
  let service: UsersService

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [MikroOrmModule.forRoot()],
      providers: [UsersService],
    }).compile()

    service = module.get<UsersService>(UsersService)
  })

  afterEach(async () => {
    await module.close()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
