import type { EntityManager } from '@mikro-orm/core'
import { Seeder } from '@mikro-orm/seeder'

import { Region } from '@src/geo/region.entity'

export const TEST_REGION_ID = 'wof_85633793'

export class TestRegionSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const region = em.create(Region, {
      id: TEST_REGION_ID,
      name: { en: 'Test Region' },
      placetype: 'country',
      properties: {
        hierarchy: [],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    await em.persistAndFlush(region)
  }
}
