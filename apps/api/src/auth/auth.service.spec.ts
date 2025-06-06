import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Test, TestingModule } from '@nestjs/testing'
import { CommonModule } from '@src/common/common.module'
import { UsersService } from '@src/users/users.service'
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n'
import { AuthModule } from './auth.module'
import { AuthService } from './auth.service'
const path = require('path')

describe('AuthService', () => {
  let module: TestingModule
  let service: AuthService

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        MikroOrmModule.forRoot(),
        AuthModule.registerAsync(),
        CommonModule,
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
      ],
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
