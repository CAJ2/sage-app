import type { EntityManager } from '@mikro-orm/core'
import { Seeder } from '@mikro-orm/seeder'

import { Material, MATERIAL_ROOT } from '@src/process/material.entity'
import { Category, CATEGORY_ROOT } from '@src/product/category.entity'
import { Org } from '@src/users/org.entity'

export class BaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    // Create root category if it doesn't exist
    const categoryRoot = await em.findOne(Category, {
      id: CATEGORY_ROOT,
    })
    if (!categoryRoot) {
      em.create(Category, {
        id: CATEGORY_ROOT,
        name: {
          xx: CATEGORY_ROOT,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    // Create root material if it doesn't exist
    const materialRoot = await em.findOne(Material, {
      id: MATERIAL_ROOT,
    })
    if (!materialRoot) {
      em.create(Material, {
        id: MATERIAL_ROOT,
        name: {
          xx: MATERIAL_ROOT,
        },
        source: {},
        technical: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

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
