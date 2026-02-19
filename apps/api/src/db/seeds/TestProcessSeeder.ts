import type { EntityManager } from '@mikro-orm/core'
import { Seeder } from '@mikro-orm/seeder'

import { Region } from '@src/geo/region.entity'
import { Process, ProcessIntent } from '@src/process/process.entity'
import { Org } from '@src/users/org.entity'

export const PROCESS_IDS = [
  'proc1_AAAAAAAAAAAAAAA',
  'proc2_BBBBBBBBBBBBBBB',
  'proc3_CCCCCCCCCCCCCCC',
]

export const ORG_IDS = ['org1_AAAAAAAAAAAAAAAA', 'org2_BBBBBBBBBBBBBBBB']

export const REGION_IDS = ['wof__AAAAAAAAAAAAAAAA', 'wof__BBBBBBBBBBBBBBBB']

export class TestProcessSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    // Create test regions
    for (const id of REGION_IDS) {
      em.create(Region, {
        id,
        name: { en: `Region ${id}`, sv: `Region ${id} Svenska` },
        properties: {},
        placetype: 'region',
        adminLevel: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    // Create test orgs
    for (const id of ORG_IDS) {
      em.create(Org, {
        id,
        name: `Test Org ${id}`,
        slug: id.toLowerCase(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    // Create test processes
    for (let i = 0; i < PROCESS_IDS.length; i++) {
      const processId = PROCESS_IDS[i]
      em.create(Process, {
        id: processId,
        name: { en: `Process ${i + 1}`, sv: `Process ${i + 1} Svenska` },
        desc: { en: `Description for process ${i + 1}`, sv: `Beskrivning för process ${i + 1}` },
        intent: ProcessIntent.RECYCLE,
        instructions: {},
        efficiency: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    await em.flush()
  }
}
