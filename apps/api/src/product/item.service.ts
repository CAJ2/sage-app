import { EntityManager } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'
import { DeleteInput, isUsingChange } from '@src/changes/change-ext.model'
import { Change } from '@src/changes/change.entity'
import { EditService } from '@src/changes/edit.service'
import { mapOrderBy } from '@src/common/db.utils'
import { NotFoundErr } from '@src/common/exceptions'
import { I18nService } from '@src/common/i18n.service'
import { MeiliService } from '@src/common/meilisearch.service'
import { CursorOptions } from '@src/common/transform'
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
    private readonly editService: EditService,
    private readonly tagService: TagService,
    private readonly searchService: MeiliService,
    private readonly i18n: I18nService,
  ) {}

  async findOneByID(id: string) {
    return await this.em.findOne(
      Item,
      { id },
      { populate: ['categories', 'itemTags'] },
    )
  }

  async find(opts: CursorOptions<Item>) {
    opts.options.populate = ['categories', 'itemTags']
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
    if (!isUsingChange(input)) {
      await this.setFields(item, input)
      await this.em.persistAndFlush(item)
      await this.searchService.addDocs(item)
      return { item }
    }
    const change = await this.editService.findOneOrCreate(
      input.changeID,
      input.change,
      userID,
    )
    await this.setFields(item, input, change)
    await this.editService.createEntityEdit(change, item)
    await this.em.persistAndFlush(change)
    await this.editService.checkMerge(change, input)
    return { item, change }
  }

  async update(input: UpdateItemInput, userID: string) {
    const { entity: item, change } =
      await this.editService.findOneWithChangeInput(input, userID, Item, {
        id: input.id,
      })
    if (!item) {
      throw new Error('Item not found')
    }
    if (!change) {
      await this.setFields(item, input)
      await this.em.persistAndFlush(item)
      await this.searchService.addDocs(item)
      return { item }
    }
    await this.editService.beginUpdateEntityEdit(change, item)
    await this.setFields(item, input, change)
    await this.editService.updateEntityEdit(change, item)
    await this.em.persistAndFlush(change)
    await this.editService.checkMerge(change, input)
    return { item, change }
  }

  async delete(input: DeleteInput) {
    const deleted = await this.editService.deleteOneWithChange(input, Item)
    if (!deleted) {
      throw NotFoundErr(`Item with ID "${input.id}" not found`)
    }
    return deleted
  }

  async setFields(
    item: Item,
    input: Partial<CreateItemInput & UpdateItemInput>,
    change?: Change,
  ) {
    if (input.name) {
      item.name = this.i18n.addTrReq(item.name, input.name, input.lang)
    }
    if (input.nameTr) {
      item.name = this.i18n.addTrReq(item.name, input.nameTr, input.lang)
    }
    if (input.desc) {
      item.desc = this.i18n.addTr(item.desc, input.desc, input.lang)
    }
    if (input.descTr) {
      item.desc = this.i18n.addTr(item.desc, input.descTr, input.lang)
    }
    if (input.imageURL) {
      if (!item.files) {
        item.files = {}
      }
      item.files.thumbnail = input.imageURL
    }
    if (!item.source) {
      item.source = {}
    }
    if (input.categories || input.addCategories) {
      item.categories = await this.editService.setOrAddCollection(
        item.categories,
        Category,
        input.categories,
        input.addCategories,
      )
    }
    if (input.removeCategories) {
      item.categories = await this.editService.removeFromCollection(
        item.categories,
        Category,
        input.removeCategories,
      )
    }
    if (input.tags || input.addTags) {
      for (const tag of input.tags || input.addTags || []) {
        const tagEntity = await this.em.findOneOrFail(Tag, { id: tag.id })
        const tagDef = await this.tagService.validateTagInput(tag)
        const tagInst = new ItemsTags()
        tagInst.tag = tagEntity
        tagInst.item = item
        tagInst.meta = tagDef.meta
        if (input.tags) {
          item.itemTags.set([])
        }
        if (item.itemTags.contains(tagInst)) {
          item.itemTags.remove(tagInst)
        }
        item.itemTags.add(tagInst)
      }
    }
    if (input.removeTags) {
      item.tags = await this.editService.removeFromCollection(
        item.tags,
        Tag,
        input.removeTags,
      )
    }
  }
}
