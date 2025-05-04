import { EntityManager } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'
import { Change } from '@src/changes/change.entity'
import { ChangeService } from '@src/changes/change.service'
import { CursorOptions } from '@src/common/transform'
import { addTr, addTrReq } from '@src/db/i18n'
import {
  Category,
  CATEGORY_ROOT,
  CategoryEdge,
  CategoryTree,
} from './category.entity'
import { CreateCategoryInput } from './category.model'

@Injectable()
export class CategoryService {
  constructor(
    private readonly em: EntityManager,
    private readonly changeService: ChangeService,
  ) {}

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
    const root = await this.em.findOne(Category, { id: CATEGORY_ROOT })
    return root as Category
  }

  async findParents(childID: string, opts: CursorOptions<Category>) {
    const parents = await this.em
      .createQueryBuilder(CategoryEdge)
      .joinAndSelect('parent', 'parent')
      .where({
        child: childID,
      })
      .limit(opts.options.limit)
      .getResult()
    return {
      items: parents.map((p) => p.parent) as Category[],
      count: parents.length,
    }
  }

  async findChildren(parentID: string, opts: CursorOptions<Category>) {
    const children = await this.em
      .createQueryBuilder(CategoryEdge)
      .joinAndSelect('child', 'child')
      .where({
        parent: parentID,
      })
      .limit(opts.options.limit)
      .getResult()
    return {
      items: children.map((c) => c.child) as Category[],
      count: children.length,
    }
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

  async create(input: CreateCategoryInput, userID: string) {
    const category = new Category()
    const change = await this.changeService.findOneOrCreate(
      input.change_id,
      input.change,
      userID,
    )
    this.setFields(change, category, input)
    await this.changeService.createEntityEdit(change, category)
    await this.em.persistAndFlush(change)
    await this.changeService.checkMerge(change, input)
    return {
      change,
      category,
    }
  }

  async setFields(
    change: Change,
    category: Category,
    input: CreateCategoryInput,
  ) {
    if (input.name) {
      category.name = addTrReq(category.name, input.lang, input.name)
    }
    if (input.desc_short) {
      category.desc_short = addTr(
        category.desc_short,
        input.lang,
        input.desc_short,
      )
    }
    if (input.desc) {
      category.desc = addTr(category.desc, input.lang, input.desc)
    }
    if (input.image_url) {
      category.image_url = input.image_url
    }
  }
}
