import { EntityManager } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'
import { CursorOptions } from '@src/common/transform'
import { Category } from './category.entity'
import { Item } from './item.entity'
import { Variant } from './variant.entity'

@Injectable()
export class ItemService {
  constructor(private readonly em: EntityManager) {}

  async find(opts: CursorOptions<Item>) {
    const items = await this.em.find(Item, opts.where, opts.options)
    const count = await this.em.count(Item, opts.where)
    return {
      items,
      count,
    }
  }

  async findOneByID(id: string) {
    return await this.em.findOne(Item, { id })
  }

  async categories(itemID: string, opts: CursorOptions<Category>) {
    opts.where.items = this.em.getReference(Item, itemID)
    const categories = await this.em.find(Category, opts.where, opts.options)
    const count = await this.em.count(Category, { items: opts.where.items })
    return {
      items: categories,
      count,
    }
  }

  async variants(itemID: string, opts: CursorOptions<Variant>) {
    opts.where.item = this.em.getReference(Item, itemID)
    const variants = await this.em.find(Variant, opts.where, opts.options)
    const count = await this.em.count(Variant, { item: opts.where.item })
    return {
      items: variants,
      count,
    }
  }
}
