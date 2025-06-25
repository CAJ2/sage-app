import { EntityManager } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'
import { Change } from '@src/changes/change.entity'
import { DeleteInput } from '@src/changes/change.model'
import { EditService } from '@src/changes/edit.service'
import { NotFoundErr } from '@src/common/exceptions'
import { CursorOptions } from '@src/common/transform'
import { addTr, addTrReq } from '@src/db/i18n'
import {
  Category,
  CATEGORY_ROOT,
  CategoryEdge,
  CategoryTree,
} from './category.entity'
import { CreateCategoryInput, UpdateCategoryInput } from './category.model'
import { Item } from './item.entity'

@Injectable()
export class CategoryService {
  constructor(
    private readonly em: EntityManager,
    private readonly editService: EditService,
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
    return await this.em.findOne(
      Category,
      { id },
      { populate: ['parents', 'children'] },
    )
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

  async items(categoryID: string, opts: CursorOptions<Item>) {
    opts.where.categories = this.em.getReference(Category, categoryID)
    const items = await this.em.find(Item, opts.where, opts.options)
    const count = await this.em.count(Item, opts.where)
    return {
      items,
      count,
    }
  }

  async create(input: CreateCategoryInput, userID: string) {
    const category = new Category()
    const change = await this.editService.findOneOrCreate(
      input.change_id,
      input.change,
      userID,
    )
    await this.setFields(category, input, change)
    await this.editService.createEntityEdit(change, category)
    await this.em.persistAndFlush(change)
    await this.editService.checkMerge(change, input)
    return {
      change,
      category,
    }
  }

  async update(input: UpdateCategoryInput, userID: string) {
    const { entity: category, change } =
      await this.editService.findOneWithChangeInput(input, userID, Category, {
        id: input.id,
      })
    if (!category) {
      throw new Error(`Category with ID "${input.id}" not found`)
    }
    if (!input.useChange()) {
      await this.setFields(category, input)
      await this.em.persistAndFlush(category)
      return {
        category,
        change: null,
      }
    }
    await this.editService.beginUpdateEntityEdit(change, category)
    await this.setFields(category, input, change)
    await this.editService.updateEntityEdit(change, category)
    await this.em.persistAndFlush(change)
    await this.editService.checkMerge(change, input)
    return {
      change,
      category,
    }
  }

  async delete(input: DeleteInput) {
    const deleted = await this.editService.deleteOneWithChange(input, Category)
    if (!deleted) {
      throw NotFoundErr(`Category with ID "${input.id}" not found`)
    }
    return deleted
  }

  async setFields(
    category: Category,
    input: Partial<CreateCategoryInput & UpdateCategoryInput>,
    change?: Change,
  ) {
    if (input.name) {
      category.name = addTrReq(category.name, input.lang, input.name)
    }
    if (input.name_tr) {
      category.name = addTrReq(category.name, input.lang, input.name_tr)
    }
    if (input.desc_short) {
      category.desc_short = addTr(
        category.desc_short,
        input.lang,
        input.desc_short,
      )
    }
    if (input.desc_short_tr) {
      category.desc_short = addTr(
        category.desc_short,
        input.lang,
        input.desc_short_tr,
      )
    }
    if (input.desc) {
      category.desc = addTr(category.desc, input.lang, input.desc)
    }
    if (input.desc_tr) {
      category.desc = addTr(category.desc, input.lang, input.desc_tr)
    }
    if (input.image_url) {
      category.image_url = input.image_url
    }
  }
}
