import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthModule } from '@src/auth/auth.module'
import { ChangesModule } from '@src/changes/changes.module'
import { ProcessModule } from '@src/process/process.module'
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n'
import { VariantService } from './variant.service'
const path = require('path')

describe('VariantService', () => {
  let module: TestingModule
  let service: VariantService

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        MikroOrmModule.forRoot(),
        I18nModule.forRoot({
          fallbackLanguage: 'en',
          loaderOptions: {
            path: path.join(__dirname, '../i18n/'),
            watch: true,
          },
          resolvers: [
            new QueryResolver(['lang', 'locale']),
            new HeaderResolver(['x-lang', 'x-locale']),
            AcceptLanguageResolver,
          ],
        }),
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
