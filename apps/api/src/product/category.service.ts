import { EntityManager } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'
import { Change } from '@src/changes/change.entity'
import { CursorOptions } from '@src/common/transform'
import { setTranslatedField } from '@src/db/i18n'
import { Category, CategoryTree } from './category.entity'
import { CreateCategoryInput } from './category.model'

@Injectable()
export class CategoryService {
  constructor(private readonly em: EntityManager) {}

  async find(opts: CursorOptions<Category>) {
    const categories = await this.em.find(Category, opts.where, opts.options)
    const count = await this.em.count(Category, opts.where)
    return {
      items: categories,
      count,
    }
  }

  async findOneByID(id: string) {
    return await this.em.findOne(Category, { id })
  }

  async findRoot() {
    const root = await this.em.findOne(
      CategoryTree,
      { ancestor: 'CATEGORY_ROOT', depth: 0 },
      { populate: ['ancestor'] },
    )
    if (!root) {
      return null
    }
    return root.ancestor as Category
  }

  async findDirectAncestors(childID: string, opts: CursorOptions<Category>) {
    const ancestors = await this.em
      .createQueryBuilder(CategoryTree)
      .joinAndSelect('ancestor', 'ancestor')
      .where({
        descendant: childID,
        ancestor: { $ne: childID },
      })
      .andWhere({ depth: 1, ancestor: opts.where.id })
      .limit(opts.options.limit)
      .getResult()
    return {
      items: ancestors.map((a) => a.ancestor) as Category[],
      count: ancestors.length,
    }
  }

  async findDirectDescendants(parentID: string, opts: CursorOptions<Category>) {
    const descendants = await this.em
      .createQueryBuilder(CategoryTree)
      .joinAndSelect('descendant', 'descendant')
      .where({
        ancestor: parentID,
        descendant: { $ne: parentID },
      })
      .andWhere({ depth: 1, descendant: opts.where.id })
      .limit(opts.options.limit)
      .getResult()
    return {
      items: descendants.map((d) => d.descendant) as Category[],
      count: descendants.length,
    }
  }

  async findAll(opts: CursorOptions<Category>) {
    const categories = await this.em.find(Category, opts.where, opts.options)
    const count = await this.em.count(Category, opts.where)
    return {
      items: categories,
      count,
    }
  }

  async create(input: CreateCategoryInput) {
    const category = new Category()
    setTranslatedField(category.name, input.lang, input.name)
    if (input.desc_short) {
      setTranslatedField(category.desc_short, input.lang, input.desc_short)
    }
    if (input.desc) {
      setTranslatedField(category.desc, input.lang, input.desc)
    }
    category.image_url = input.image_url
    const change = new Change()
    await this.em.persistAndFlush(change)
    return {
      change,
      category,
    }
  }
}
