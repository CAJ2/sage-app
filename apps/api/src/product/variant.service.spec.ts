import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthModule } from '@src/auth/auth.module'
import { ChangesModule } from '@src/changes/changes.module'
import { EditsModule } from '@src/changes/edits.module'
import {
  COMPONENT_IDS,
  ITEM_IDS,
  VARIANT_IDS,
} from '@src/db/seeds/TestVariantSeeder'
import { ProcessModule } from '@src/process/process.module'
import { ClsModule } from 'nestjs-cls'
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
          },
          resolvers: [
            new QueryResolver(['lang', 'locale']),
            new HeaderResolver(['x-lang', 'x-locale']),
            AcceptLanguageResolver,
          ],
        }),
        AuthModule.registerAsync(),
        ClsModule.forRoot({
          global: true,
        }),
        ChangesModule,
        EditsModule,
        ProcessModule,
      ],
      providers: [VariantService],
    }).compile()

    service = module.get<VariantService>(VariantService)
  }, 10000)

  afterEach(async () => {
    await module.close()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('Query', () => {
    it('should find one variant by ID', async () => {
      const result = await service.findOneByID(VARIANT_IDS[0])
      expect(result).toBeDefined()
      expect(result?.id).toBe(VARIANT_IDS[0])
    })

    it('should find variants with options', async () => {
      const result = await service.find({
        where: { id: VARIANT_IDS[1] },
        options: {},
      })
      expect(result.items).toHaveLength(1)
      expect(result.items[0].id).toBe(VARIANT_IDS[1])
    })

    it('should retrieve items for a variant', async () => {
      const result = await service.items(VARIANT_IDS[2], {
        where: {},
        options: {
          orderBy: { id: 'DESC' },
        },
      })
      expect(result.items).toHaveLength(2)
      expect(result.items[0].id).toBe(ITEM_IDS[0])
      expect(result.items[1].id).toBe(ITEM_IDS[1])
    })

    it('should retrieve components for a variant', async () => {
      const result = await service.components(VARIANT_IDS[0], {
        where: {},
        options: {
          orderBy: { component: 'ASC' },
        },
      })
      expect(result.items).toHaveLength(2)
      expect(result.items[0].component.id).toBe(COMPONENT_IDS[0])
      expect(result.items[1].component.id).toBe(COMPONENT_IDS[1])
    })
  })
})
