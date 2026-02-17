import { MikroOrmModule } from '@mikro-orm/nestjs'
import { MikroORM } from '@mikro-orm/postgresql'
import { Test, TestingModule } from '@nestjs/testing'

import { AuthModule } from '@src/auth/auth.module'
import { EditsModule } from '@src/changes/edits.module'
import { CommonModule } from '@src/common/common.module'
import { BaseSeeder } from '@src/db/seeds/BaseSeeder'
import { TestMaterialSeeder } from '@src/db/seeds/TestMaterialSeeder'
import {
  COMPONENT_IDS,
  ITEM_IDS,
  TestVariantSeeder,
  VARIANT_IDS,
} from '@src/db/seeds/TestVariantSeeder'
import { ADMIN_USER_ID, UserSeeder } from '@src/db/seeds/UserSeeder'
import { clearDatabase } from '@src/db/test.utils'
import { MIKRO_TEST_CONFIG } from '@src/mikro-orm-test.config'
import { ProcessModule } from '@src/process/process.module'

import { VariantService } from './variant.service'

describe('VariantService', () => {
  let module: TestingModule
  let service: VariantService
  let orm: MikroORM

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        CommonModule,
        MikroOrmModule.forRoot(MIKRO_TEST_CONFIG),
        AuthModule,
        EditsModule,
        ProcessModule,
      ],
      providers: [VariantService],
    }).compile()

    service = module.get<VariantService>(VariantService)
    orm = module.get<MikroORM>(MikroORM)

    await clearDatabase(orm, 'public', ['users'])
    await orm.getSeeder().seed(BaseSeeder, UserSeeder, TestMaterialSeeder, TestVariantSeeder)
  }, 60000)

  afterAll(async () => {
    if (module) {
      await module.close()
    }
  })

  test('should be defined', () => {
    expect(service).toBeDefined()
  })

  test('should find one variant by ID', async () => {
    const result = await service.findOneByID(VARIANT_IDS[0])
    expect(result).toBeDefined()
    expect(result?.id).toBe(VARIANT_IDS[0])
  })

  test('should find variants with options', async () => {
    const result = await service.find({
      where: { id: VARIANT_IDS[1] },
      options: {},
    })
    expect(result.items).toHaveLength(1)
    expect(result.items[0].id).toBe(VARIANT_IDS[1])
  })

  test('should retrieve items for a variant', async () => {
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

  test('should retrieve components for a variant', async () => {
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

  test('should create a new variant', async () => {
    const input = {
      nameTr: [{ lang: 'en', text: 'New Variant', auto: false }],
      descTr: [{ lang: 'en', text: 'Description for new variant', auto: false }],
    }
    const result = await service.create(input, ADMIN_USER_ID!)
    expect(result).toBeDefined()
    expect(result.variant.name).toStrictEqual({ en: 'New Variant' })
    expect(result.variant.desc).toStrictEqual({ en: 'Description for new variant' })
  })
})
