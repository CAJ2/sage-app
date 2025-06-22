import { EntityManager, ref } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'
import { Change } from '@src/changes/change.entity'
import { EditService } from '@src/changes/edit.service'
import { Source } from '@src/changes/source.entity'
import { mapOrderBy } from '@src/common/db.utils'
import { CursorOptions } from '@src/common/transform'
import { addTr, addTrReq } from '@src/db/i18n'
import { Region } from '@src/geo/region.entity'
import { Component } from '@src/process/component.entity'
import { StreamScore, StreamScoreRating } from '@src/process/stream.model'
import { StreamService } from '@src/process/stream.service'
import { Tag } from '@src/process/tag.entity'
import { TagService } from '@src/process/tag.service'
import { Org } from '@src/users/org.entity'
import { I18nService } from 'nestjs-i18n'
import { Item } from './item.entity'
import { Variant, VariantsTags } from './variant.entity'
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
        populate: [
          'variant_sources',
          'variant_items',
          'variant_tags',
          'variants_components',
          'orgs',
        ],
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

  async orgs(variantID: string, opts: CursorOptions<Org>) {
    opts.where.variants = this.em.getReference(Variant, variantID)
    const orgs = await this.em.find(Org, opts.where, opts.options)
    const count = await this.em.count(Org, { variants: opts.where.variants })
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

  async components(variantID: string, opts: CursorOptions<Component>) {
    opts.where.variants = this.em.getReference(Variant, variantID)
    const components = await this.em.find(Component, opts.where, opts.options)
    const count = await this.em.count(Component, {
      variants: opts.where.variants,
    })
    return {
      items: components,
      count,
    }
  }

  async recycle_score(variantID: string, regionID?: string) {
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
      const score = await this.streamService.recycleComponentScore(
        component.id,
        regionID,
      )
      if (score && score.score) {
        totalScore += score.score
      }
    }
    const variantScore = new StreamScore()
    variantScore.score = Math.floor(
      totalScore / variant.components.getItems().length,
    )
    variantScore.rating = StreamScoreRating.VERY_GOOD
    variantScore.rating_f = this.i18n.t(
      `stream.score_rating.${variantScore.rating}`,
    )
    return variantScore
  }

  async create(input: CreateVariantInput, userID: string) {
    const variant = new Variant()
    if (!input.useChange()) {
      await this.setFields(variant, input)
      await this.em.persistAndFlush(variant)
      return { variant }
    }
    const change = await this.editService.findOneOrCreate(
      input.change_id,
      input.change,
      userID,
    )
    await this.setFields(variant, input, change)
    await this.editService.createEntityEdit(change, variant)
    await this.em.persistAndFlush(change)
    await this.editService.checkMerge(change, input)
    return { variant, change }
  }

  async update(input: UpdateVariantInput, userID: string) {
    const variant = await this.em.findOne(
      Variant,
      { id: input.id },
      {
        disableIdentityMap: input.useChange(),
        populate: [
          'items',
          'orgs',
          'region',
          'tags',
          'variant_tags',
          'components',
        ],
      },
    )
    if (!variant) {
      throw new Error('Variant not found')
    }
    if (!input.useChange()) {
      await this.setFields(variant, input)
      await this.em.persistAndFlush(variant)
      return { variant }
    }
    const change = await this.editService.findOneOrCreate(
      input.change_id,
      input.change,
      userID,
    )
    await this.editService.beginUpdateEntityEdit(change, variant)
    await this.setFields(variant, input, change)
    await this.editService.updateEntityEdit(change, variant)
    await this.em.persistAndFlush(change)
    await this.editService.checkMerge(change, input)
    return { variant, change }
  }

  async setFields(
    variant: Variant,
    input: Partial<CreateVariantInput & UpdateVariantInput>,
    change?: Change,
  ) {
    if (input.name) {
      variant.name = addTrReq(variant.name, input.lang, input.name)
    }
    if (input.name_tr) {
      variant.name = addTrReq(variant.name, input.lang, input.name_tr)
    }
    if (input.desc) {
      variant.desc = addTr(variant.desc, input.lang, input.desc)
    }
    if (input.desc_tr) {
      variant.desc = addTr(variant.desc, input.lang, input.desc_tr)
    }
    if (input.code) {
      variant.code = input.code
    }
    if (!change && input.add_sources) {
      for (const source of input.add_sources) {
        const sourceEntity = await this.em.findOneOrFail(Source, {
          id: source.id,
        })
        if (variant.sources.contains(ref(sourceEntity))) {
          variant.sources.remove(ref(sourceEntity))
        }
        variant.sources.add(ref(sourceEntity))
      }
    }
    if (!change && input.remove_sources) {
      for (const source of input.remove_sources) {
        const sourceEntity = await this.em.findOneOrFail(Source, {
          id: source,
        })
        if (variant.sources.contains(ref(sourceEntity))) {
          variant.sources.remove(ref(sourceEntity))
        }
      }
    }
    if (input.items || input.add_items) {
      for (const item of input.items || input.add_items || []) {
        if (!change) {
          const itemEntity = await this.em.findOneOrFail(Item, { id: item.id })
          if (variant.items.contains(ref(itemEntity))) {
            variant.items.remove(ref(itemEntity))
          }
          variant.items.add(ref(itemEntity))
        } else {
          const itemEntity = await this.editService.findRefWithChange(
            change,
            Item,
            { id: item.id },
          )
          if (variant.items.contains(itemEntity)) {
            variant.items.remove(itemEntity)
          }
          variant.items.add(itemEntity)
        }
      }
    }
    if (input.remove_items) {
      for (const item of input.remove_items) {
        if (!change) {
          const itemEntity = await this.em.findOneOrFail(Item, { id: item })
          if (variant.items.contains(ref(itemEntity))) {
            variant.items.remove(ref(itemEntity))
          }
        } else {
          const itemEntity = await this.editService.findRefWithChange(
            change,
            Item,
            { id: item },
          )
          if (variant.items.contains(itemEntity)) {
            variant.items.remove(itemEntity)
          }
        }
      }
    }
    if (input.region_id) {
      if (!change) {
        const region = await this.em.findOneOrFail(Region, {
          id: input.region_id,
        })
        variant.region = ref(region)
      } else {
        const region = await this.editService.findRefWithChange(
          change,
          Region,
          { id: input.region_id },
        )
        variant.region = region
      }
    }
    if (input.regions || input.add_regions) {
      for (const region of input.regions || input.add_regions || []) {
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
    if (input.remove_regions) {
      for (const region of input.remove_regions) {
        const regionEntity = await this.em.findOneOrFail(Region, {
          id: region,
        })
        if (variant.regions && variant.regions.includes(regionEntity.id)) {
          variant.regions = variant.regions.filter((r) => r !== regionEntity.id)
        }
      }
    }
    if (input.orgs || input.add_orgs) {
      for (const org of input.orgs || input.add_orgs || []) {
        if (!change) {
          const orgEntity = await this.em.findOneOrFail(Org, { id: org.id })
          if (variant.orgs.contains(ref(orgEntity))) {
            variant.orgs.remove(ref(orgEntity))
          }
          variant.orgs.add(ref(orgEntity))
        } else {
          const orgEntity = await this.editService.findRefWithChange(
            change,
            Org,
            { id: org.id },
          )
          if (variant.orgs.contains(orgEntity)) {
            variant.orgs.remove(orgEntity)
          }
          variant.orgs.add(orgEntity)
        }
      }
    }
    if (input.remove_orgs) {
      for (const org of input.remove_orgs) {
        if (!change) {
          const orgEntity = await this.em.findOneOrFail(Org, { id: org })
          variant.orgs.remove(ref(orgEntity))
        } else {
          const orgEntity = await this.editService.findRefWithChange(
            change,
            Org,
            { id: org },
          )
          if (variant.orgs.contains(orgEntity)) {
            variant.orgs.remove(orgEntity)
          }
        }
      }
    }
    if (input.tags || input.add_tags) {
      for (const tag of input.tags || input.add_tags || []) {
        const tagEntity = await this.em.findOneOrFail(Tag, { id: tag.id })
        const tagDef = await this.tagService.validateTagInput(tag)
        const tagEx = variant.variant_tags.find((t) => t.tag.id === tag.id)
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
    if (input.remove_tags) {
      for (const tag of input.remove_tags) {
        const tagEntity = await this.em.findOneOrFail(Tag, { id: tag })
        variant.tags.remove(ref(tagEntity))
      }
    }
    if (input.components || input.add_components) {
      for (const component of input.components || input.add_components || []) {
        if (!change) {
          const comp = await this.em.findOneOrFail(Component, {
            id: component.id,
          })
          if (variant.components.contains(ref(comp))) {
            variant.components.remove(ref(comp))
          }
          variant.components.add(ref(comp))
        } else {
          const comp = await this.editService.findRefWithChange(
            change,
            Component,
            { id: component.id },
          )
          variant.components.add(comp)
        }
      }
    }
    if (input.remove_components) {
      for (const component of input.remove_components) {
        if (!change) {
          const comp = await this.em.findOneOrFail(Component, {
            id: component,
          })
          variant.components.remove(ref(comp))
        } else {
          const comp = await this.editService.findRefWithChange(
            change,
            Component,
            { id: component },
          )
          variant.components.remove(comp)
        }
      }
    }
  }
}
