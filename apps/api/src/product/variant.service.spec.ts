import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthModule } from '@src/auth/auth.module'
import { ChangesModule } from '@src/changes/changes.module'
import { ProcessModule } from '@src/process/process.module'
import { VariantService } from './variant.service'

describe('VariantService', () => {
  let module: TestingModule
  let service: VariantService

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        MikroOrmModule.forRoot(),
        AuthModule.registerAsync(),
        ChangesModule,
        ProcessModule,
      ],
      providers: [VariantService],
    }).compile()

    service = module.get<VariantService>(VariantService)
  })

  afterEach(async () => {
    await module.close()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
