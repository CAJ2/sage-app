import { Seeder } from '@mikro-orm/seeder'
import { Org } from '@src/users/org.entity'
import type { EntityManager } from '@mikro-orm/core'

export class OrgSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    em.create(Org, {
      name: 'Sage',
      slug: 'sage',
      desc: {
        en: {
          text: 'Sage is a circular economy database',
        },
      },
      metadata: '{}',
      updated_at: new Date(),
      created_at: new Date(),
    })
  }
}
