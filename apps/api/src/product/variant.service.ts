import { EntityManager, ref } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'

import { DeleteInput, isUsingChange } from '@src/changes/change-ext.model'
import { Change } from '@src/changes/change.entity'
import { EditService } from '@src/changes/edit.service'
import { Source } from '@src/changes/source.entity'
import { mapOrderBy } from '@src/common/db.utils'
import { NotFoundErr } from '@src/common/exceptions'
import { I18nService } from '@src/common/i18n.service'
import { CursorOptions } from '@src/common/transform'
import { Region } from '@src/geo/region.entity'
import { Component } from '@src/process/component.entity'
import { StreamScore, StreamScoreRating } from '@src/process/stream.model'
import { StreamService } from '@src/process/stream.service'
import { Tag } from '@src/process/tag.entity'
import { TagService } from '@src/process/tag.service'

import { Item } from './item.entity'
import { Variant, VariantsComponents, VariantsOrgs, VariantsTags } from './variant.entity'
import { CreateVariantInput, UpdateVariantInput } from './variant.model'

@Injectable()
export class VariantService {
  constructor(
    private readonly em: EntityManager,
    private readonly editService: EditService,
    private readonly tagService: TagService,
    private readonly streamService: StreamService,
    private readonly i18n: I18nService,
  ) {}

  async findOneByID(id: string) {
    return await this.em.findOne(
      Variant,
      { id },
      {
        populate: ['variantSources', 'variantItems', 'variantTags', 'variantComponents', 'orgs'],
      },
    )
  }

  async find(opts: CursorOptions<Variant>) {
    const variants = await this.em.find(Variant, opts.where, opts.options)
    const count = await this.em.count(Variant, opts.where)
    return {
      items: variants,
      count,
    }
  }

  async items(variantID: string, opts: CursorOptions<Item>) {
    opts.where.variants = this.em.getReference(Variant, variantID)
    const items = await this.em.find(Item, opts.where, opts.options)
    const count = await this.em.count(Item, { variants: opts.where.variants })
    return {
      items,
      count,
    }
  }

  async orgs(variantID: string, opts: CursorOptions<VariantsOrgs>) {
    opts.where.variant = this.em.getReference(Variant, variantID)
    opts.options.populate = ['org']
    const orgs = await this.em.find(VariantsOrgs, opts.where, opts.options)
    const count = await this.em.count(VariantsOrgs, {
      variant: opts.where.variant,
    })
    return {
      items: orgs,
      count,
    }
  }

  async tags(variantID: string, opts: CursorOptions<Tag>) {
    opts.where.variants = this.em.getReference(Variant, variantID)
    const tagDefs = await this.em.find(Tag, opts.where, opts.options)
    const tags = await this.em.find(
      VariantsTags,
      { variant: variantID },
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
    const count = await this.em.count(VariantsTags, {
      variant: opts.where.variants,
    })
    return {
      items: combinedTags,
      count,
    }
  }

  async components(variantID: string, opts: CursorOptions<VariantsComponents>) {
    opts.where.variant = this.em.getReference(Variant, variantID)
    opts.options.populate = ['component']
    const components = await this.em.find(VariantsComponents, opts.where, opts.options)
    const count = await this.em.count(VariantsComponents, {
      variant: opts.where.variant,
    })
    return {
      items: components,
      count,
    }
  }

  async recycleScore(variantID: string, regionID?: string) {
    const variant = await this.em.findOne(
      Variant,
      { id: variantID },
      { populate: ['region', 'components'] },
    )
    if (!variant) {
      throw new Error(`Variant with ID "${variantID}" not found`)
    }
    const region = await this.em.findOne(Region, { id: regionID })
    if (!region) {
      throw new Error(`Region with ID "${regionID}" not found`)
    }
    if (variant.components.getItems().length === 0) {
      return new StreamScore()
    }
    let totalScore = 0
    for (const component of variant.components.getItems()) {
      const score = await this.streamService.recycleComponentScore(component.id, regionID)
      if (score && score.score) {
        totalScore += score.score
      }
    }
    const variantScore = new StreamScore()
    variantScore.score = Math.floor(totalScore / variant.components.getItems().length)
    variantScore.rating = StreamScoreRating.VERY_GOOD
    variantScore.ratingF = this.i18n.t(`stream.scoreRating.${variantScore.rating}`)
    return variantScore
  }

  async create(input: CreateVariantInput, userID: string) {
    const variant = new Variant()
    if (!isUsingChange(input)) {
      await this.setFields(variant, input)
      await this.em.persistAndFlush(variant)
      return { variant }
    }
    const change = await this.editService.findOneOrCreate(input.changeID, input.change, userID)
    await this.setFields(variant, input, change)
    await this.editService.createEntityEdit(change, variant)
    await this.em.persistAndFlush(change)
    await this.editService.checkMerge(change, input)
    return { variant, change }
  }

  async update(input: UpdateVariantInput, userID: string) {
    const { entity: variant, change } = await this.editService.findOneWithChangeInput(
      input,
      userID,
      Variant,
      {
        id: input.id,
      },
    )
    if (!variant) {
      throw new Error('Variant not found')
    }
    if (!change) {
      await this.setFields(variant, input)
      await this.em.persistAndFlush(variant)
      return { variant }
    }
    await this.editService.beginUpdateEntityEdit(change, variant)
    await this.setFields(variant, input, change)
    await this.editService.updateEntityEdit(change, variant)
    await this.em.persistAndFlush(change)
    await this.editService.checkMerge(change, input)
    return { variant, change }
  }

  async delete(input: DeleteInput) {
    const deleted = await this.editService.deleteOneWithChange(input, Variant)
    if (!deleted) {
      throw NotFoundErr(`Variant with ID "${input.id}" not found`)
    }
    return deleted
  }

  async setFields(
    variant: Variant,
    input: Partial<CreateVariantInput & UpdateVariantInput>,
    change?: Change,
  ) {
    if (input.name) {
      variant.name = this.i18n.addTrReq(variant.name, input.name, input.lang)
    }
    if (input.nameTr) {
      variant.name = this.i18n.addTrReq(variant.name, input.nameTr, input.lang)
    }
    if (input.desc) {
      variant.desc = this.i18n.addTr(variant.desc, input.desc, input.lang)
    }
    if (input.descTr) {
      variant.desc = this.i18n.addTr(variant.desc, input.descTr, input.lang)
    }
    if (input.code) {
      variant.code = input.code
    }
    if (!change && input.addSources) {
      for (const source of input.addSources) {
        const sourceEntity = await this.em.findOneOrFail(Source, {
          id: source.id,
        })
        if (variant.sources.contains(ref(sourceEntity))) {
          variant.sources.remove(ref(sourceEntity))
        }
        variant.sources.add(ref(sourceEntity))
      }
    }
    if (!change && input.removeSources) {
      for (const source of input.removeSources) {
        const sourceEntity = await this.em.findOneOrFail(Source, {
          id: source,
        })
        if (variant.sources.contains(ref(sourceEntity))) {
          variant.sources.remove(ref(sourceEntity))
        }
      }
    }
    if (input.items || input.addItems) {
      for (const item of input.items || input.addItems || []) {
        if (!change) {
          const itemEntity = await this.em.findOneOrFail(Item, { id: item.id })
          if (variant.items.contains(ref(itemEntity))) {
            variant.items.remove(ref(itemEntity))
          }
          variant.items.add(ref(itemEntity))
        } else {
          const itemEntity = await this.editService.findRefWithChange(change, Item, { id: item.id })
          if (variant.items.contains(itemEntity)) {
            variant.items.remove(itemEntity)
          }
          variant.items.add(itemEntity)
        }
      }
    }
    if (input.removeItems) {
      for (const item of input.removeItems) {
        if (!change) {
          const itemEntity = await this.em.findOneOrFail(Item, { id: item })
          if (variant.items.contains(ref(itemEntity))) {
            variant.items.remove(ref(itemEntity))
          }
        } else {
          const itemEntity = await this.editService.findRefWithChange(change, Item, { id: item })
          if (variant.items.contains(itemEntity)) {
            variant.items.remove(itemEntity)
          }
        }
      }
    }
    if (input.region) {
      if (!change) {
        const region = await this.em.findOneOrFail(Region, {
          id: input.region.id,
        })
        variant.region = ref(region)
      } else {
        const region = await this.editService.findRefWithChange(change, Region, {
          id: input.region.id,
        })
        variant.region = region
      }
    }
    if (input.regions || input.addRegions) {
      for (const region of input.regions || input.addRegions || []) {
        const regionEntity = await this.em.findOneOrFail(Region, {
          id: region.id,
        })
        if (variant.regions && variant.regions.includes(regionEntity.id)) {
          variant.regions.push(regionEntity.id)
        }
        if (!variant.regions) {
          variant.regions = []
        }
        variant.regions.push(regionEntity.id)
      }
    }
    if (input.removeRegions) {
      for (const region of input.removeRegions) {
        const regionEntity = await this.em.findOneOrFail(Region, {
          id: region,
        })
        if (variant.regions && variant.regions.includes(regionEntity.id)) {
          variant.regions = variant.regions.filter((r) => r !== regionEntity.id)
        }
      }
    }
    if (input.orgs || input.addOrgs) {
      variant.variantOrgs = await this.editService.setOrAddPivot(
        variant.id,
        change?.id,
        variant.variantOrgs,
        Variant,
        VariantsOrgs,
        input.orgs,
        input.addOrgs,
      )
    }
    if (input.removeOrgs) {
      variant.variantOrgs = await this.editService.removeFromPivot(
        change?.id,
        variant.variantOrgs,
        Variant,
        VariantsOrgs,
        input.removeOrgs,
      )
    }
    if (input.tags || input.addTags) {
      for (const tag of input.tags || input.addTags || []) {
        const tagEntity = await this.em.findOneOrFail(Tag, { id: tag.id })
        const tagDef = await this.tagService.validateTagInput(tag)
        const tagEx = variant.variantTags.find((t) => t.tag.id === tag.id)
        if (tagEx) {
          tagEx.meta = tagDef.meta
          this.em.persist(tagEx)
          continue
        }
        const tagInst = new VariantsTags()
        tagInst.tag = tagEntity
        tagInst.variant = variant
        tagInst.meta = tagDef.meta
        this.em.persist(tagInst)
      }
    }
    if (input.removeTags) {
      for (const tag of input.removeTags) {
        const tagEntity = await this.em.findOneOrFail(Tag, { id: tag })
        variant.tags.remove(ref(tagEntity))
      }
    }
    if (input.components || input.addComponents) {
      for (const component of input.components || input.addComponents || []) {
        if (!change) {
          const comp = await this.em.findOneOrFail(Component, {
            id: component.id,
          })
          if (variant.components.contains(ref(comp))) {
            variant.components.remove(ref(comp))
          }
          variant.components.add(ref(comp))
        } else {
          const comp = await this.editService.findRefWithChange(change, Component, {
            id: component.id,
          })
          variant.components.add(comp)
        }
      }
    }
    if (input.removeComponents) {
      for (const component of input.removeComponents) {
        if (!change) {
          const comp = await this.em.findOneOrFail(Component, {
            id: component,
          })
          variant.components.remove(ref(comp))
        } else {
          const comp = await this.editService.findRefWithChange(change, Component, {
            id: component,
          })
          variant.components.remove(comp)
        }
      }
    }
  }
}
