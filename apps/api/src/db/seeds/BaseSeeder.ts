import { Seeder } from '@mikro-orm/seeder'
import { Material, MATERIAL_ROOT } from '@src/process/material.entity'
import { Category, CATEGORY_ROOT } from '@src/product/category.entity'
import type { EntityManager } from '@mikro-orm/core'

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
        created_at: new Date(),
        updated_at: new Date(),
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
        created_at: new Date(),
        updated_at: new Date(),
      })
    }
  }
}
