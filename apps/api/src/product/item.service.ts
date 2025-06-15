import { EntityManager } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'
import { Change } from '@src/changes/change.entity'
import { ChangeService } from '@src/changes/change.service'
import { mapOrderBy } from '@src/common/db.utils'
import { MeiliService } from '@src/common/meilisearch.service'
import { CursorOptions } from '@src/common/transform'
import { addTr, addTrReq } from '@src/db/i18n'
import { Tag } from '@src/process/tag.entity'
import { TagService } from '@src/process/tag.service'
import { Category } from './category.entity'
import { Item, ItemsTags } from './item.entity'
import { CreateItemInput, UpdateItemInput } from './item.model'
import { Variant } from './variant.entity'

@Injectable()
export class ItemService {
  constructor(
    private readonly em: EntityManager,
    private readonly changeService: ChangeService,
    private readonly tagService: TagService,
    private readonly searchService: MeiliService,
  ) {}

  async findOneByID(id: string) {
    return await this.em.findOne(Item, { id })
  }

  async find(opts: CursorOptions<Item>) {
    const items = await this.em.find(Item, opts.where, opts.options)
    const count = await this.em.count(Item, opts.where)
    return {
      items,
      count,
    }
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

  async tagsList(itemID: string) {
    const tagDefs = await this.em.find(Tag, { items: itemID })
    const tags = await this.em.find(
      ItemsTags,
      { item: itemID },
      {
        orderBy: { tag: 'ASC' },
      },
    )
    const combinedTags = []
    for (const tag of tags) {
      const tagDef = tagDefs.find((t) => t.id === tag.tag.id)
      if (tagDef) {
        tagDef.meta = tag.meta
        combinedTags.push(tagDef)
      }
    }
    return combinedTags
  }

  async tags(itemID: string, opts: CursorOptions<Tag>) {
    opts.where.items = this.em.getReference(Item, itemID)
    const tagDefs = await this.em.find(Tag, opts.where, opts.options)
    const tags = await this.em.find(
      ItemsTags,
      { item: itemID },
      {
        orderBy: mapOrderBy(opts.options.orderBy, { id: 'tag' }),
        limit: opts.options.limit,
      },
    )
    const combinedTags = []
    for (const tag of tags) {
      const tagDef = tagDefs.find((t) => t.id === tag.tag.id)
      if (tagDef) {
        tagDef.meta = tag.meta
        combinedTags.push(tagDef)
      }
    }
    const count = await this.em.count(ItemsTags, { item: opts.where.items })
    return {
      items: combinedTags,
      count,
    }
  }

  async variants(itemID: string, opts: CursorOptions<Variant>) {
    opts.where.items = this.em.getReference(Item, itemID)
    const variants = await this.em.find(Variant, opts.where, opts.options)
    const count = await this.em.count(Variant, { items: opts.where.items })
    return {
      items: variants,
      count,
    }
  }

  async create(input: CreateItemInput, userID: string) {
    const item = new Item()
    if (!input.useChange()) {
      this.setFields(item, input)
      await this.em.persistAndFlush(item)
      await this.searchService.addDocs(item)
      return { item }
    }
    const change = await this.changeService.findOneOrCreate(
      input.change_id,
      input.change,
      userID,
    )
    await this.setFields(item, input, change)
    await this.changeService.createEntityEdit(change, item)
    await this.em.persistAndFlush(change)
    await this.changeService.checkMerge(change, input)
    return { item, change }
  }

  async update(input: UpdateItemInput, userID: string) {
    const item = await this.em.findOne(
      Item,
      { id: input.id },
      {
        disableIdentityMap: input.useChange(),
        populate: ['categories', 'item_tags'],
      },
    )
    if (!item) {
      throw new Error('Item not found')
    }
    if (!input.useChange()) {
      this.setFields(item, input)
      await this.em.persistAndFlush(item)
      await this.searchService.addDocs(item)
      return { item }
    }
    const change = await this.changeService.findOneOrCreate(
      input.change_id,
      input.change,
      userID,
    )
    await this.changeService.beginUpdateEntityEdit(change, item)
    await this.setFields(item, input, change)
    await this.changeService.updateEntityEdit(change, item)
    await this.em.persistAndFlush(change)
    await this.changeService.checkMerge(change, input)
    return { item, change }
  }

  async setFields(
    item: Item,
    input: Partial<CreateItemInput & UpdateItemInput>,
    change?: Change,
  ) {
    if (input.name) {
      item.name = addTrReq(item.name, input.lang, input.name)
    }
    if (input.desc) {
      item.desc = addTr(item.desc, input.lang, input.desc)
    }
    if (input.image_url) {
      if (!item.files) {
        item.files = {}
      }
      item.files['image'] = { url: input.image_url }
    }
    if (!item.source) {
      item.source = {}
    }
    if (input.categories || input.add_categories) {
      for (const category of input.categories || input.add_categories || []) {
        if (!change) {
          const cat = await this.em.findOneOrFail(Category, { id: category.id })
          item.categories.add(cat)
          continue
        }
        const cat = await this.changeService.findOneWithChange(
          change,
          Category,
          { id: category.id },
        )
        item.categories.add(cat)
      }
    }
    if (input.remove_categories) {
      for (const category of input.remove_categories) {
        if (!change) {
          const cat = await this.em.findOneOrFail(Category, { id: category.id })
          item.categories.remove(cat)
          continue
        }
        const cat = await this.changeService.findOneWithChange(
          change,
          Category,
          { id: category.id },
        )
        item.categories.remove(cat)
      }
    }
    if (input.tags || input.add_tags) {
      for (const tag of input.tags || input.add_tags || []) {
        const tagEntity = await this.em.findOneOrFail(Tag, { id: tag.id })
        const tagDef = await this.tagService.validateTagInput(tag)
        const tagInst = new ItemsTags()
        tagInst.tag = tagEntity
        tagInst.item = item
        tagInst.meta = tagDef.meta
        if (item.item_tags.contains(tagInst)) {
          item.item_tags.remove(tagInst)
        }
        item.item_tags.add(tagInst)
      }
    }
    if (input.remove_tags) {
      for (const tag of input.remove_tags) {
        const tagEntity = await this.em.findOneOrFail(Tag, { id: tag.id })
        item.tags.remove(tagEntity)
      }
    }
  }
}
