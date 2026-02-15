import type { EntityManager } from '@mikro-orm/core'
import { Seeder } from '@mikro-orm/seeder'
import { Org } from '@src/users/org.entity'

export class OrgSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const org = await em.findOne(Org, {
      slug: 'sage',
    })
    if (!org) {
      em.create(Org, {
        name: 'Sage',
        slug: 'sage',
        desc: {
          en: 'Sage is a circular economy database',
        },
        metadata: '{}',
        updatedAt: new Date(),
        createdAt: new Date(),
      })
    }
  }
}
