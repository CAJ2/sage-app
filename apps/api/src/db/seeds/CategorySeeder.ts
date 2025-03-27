import { Seeder } from '@mikro-orm/seeder'
import {
  Category,
  CATEGORY_ROOT,
  CategoryTree,
} from '@src/product/category.entity'
import type { EntityManager } from '@mikro-orm/core'

export class CategorySeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const root = em.create(Category, {
      id: CATEGORY_ROOT,
      name: {
        default: CATEGORY_ROOT,
      },
      created_at: new Date(),
      updated_at: new Date(),
    })
    em.create(CategoryTree, {
      ancestor: root,
      descendant: root,
      depth: 0,
    })
  }
}
