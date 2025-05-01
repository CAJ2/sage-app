import { EntityManager } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'
import { Change } from '@src/changes/change.entity'
import { ChangeService } from '@src/changes/change.service'
import { CursorOptions } from '@src/common/transform'
import { setTranslatedField } from '@src/db/i18n'
import { Region } from '@src/geo/region.entity'
import { Component } from '@src/process/component.entity'
import { Tag } from '@src/process/tag.entity'
import { Org } from '@src/users/org.entity'
import { Item } from './item.entity'
import { Variant } from './variant.entity'
import { CreateVariantInput, UpdateVariantInput } from './variant.model'

@Injectable()
export class VariantService {
  constructor(
    private readonly em: EntityManager,
    private readonly changeService: ChangeService,
  ) {}

  async findOneByID(id: string) {
    return await this.em.findOne(Variant, { id })
  }

  async find(opts: CursorOptions<Variant>) {
    const variants = await this.em.find(Variant, opts.where, opts.options)
    const count = await this.em.count(Variant, opts.where)
    return {
      items: variants,
      count,
    }
  }

  async create(input: CreateVariantInput, userID: string) {
    const variant = new Variant()
    const change = await this.changeService.findOneOrCreate(
      input.change_id,
      input.change,
      userID,
    )
    this.setFields(change, variant, input)
    await this.changeService.createEntityEdit(change, variant)
    await this.em.persistAndFlush(change)
    await this.changeService.checkMerge(change, input)
    return { variant, change }
  }

  async update(input: UpdateVariantInput, userID: string) {
    const variant = await this.em.findOne(
      Variant,
      { id: input.id },
      { disableIdentityMap: true },
    )
    const change = await this.changeService.findOneOrCreate(
      input.change_id,
      input.change,
      userID,
    )
    if (!variant) {
      throw new Error('Variant not found')
    }
    this.setFields(change, variant, input)
    await this.changeService.createEntityEdit(change, variant)
    await this.em.persistAndFlush(change)
    await this.changeService.checkMerge(change, input)
    return { variant, change }
  }

  async setFields(
    change: Change,
    variant: Variant,
    input: Partial<CreateVariantInput & UpdateVariantInput>,
  ) {
    if (input.name) {
      setTranslatedField(variant.name, input.lang, input.name)
    }
    if (input.desc) {
      setTranslatedField(variant.desc, input.lang, input.desc)
    }
    if (input.item_id) {
      const item = await this.changeService.findOneWithChange(change, Item, {
        id: input.item_id,
      })
      variant.item = item
    }
    if (input.region_id) {
      const region = await this.changeService.findOneWithChange(
        change,
        Region,
        { id: input.region_id },
      )
      variant.region = region
    }
    if (input.orgs) {
      for (const org of input.orgs) {
        const orgEntity = await this.changeService.findOneWithChange(
          change,
          Org,
          { id: org.id },
        )
        variant.orgs.add(orgEntity)
      }
    }
    if (input.add_orgs) {
      for (const org of input.add_orgs) {
        const orgEntity = await this.changeService.findOneWithChange(
          change,
          Org,
          { id: org.id },
        )
        variant.orgs.add(orgEntity)
      }
    }
    if (input.remove_orgs) {
      for (const org of input.remove_orgs) {
        const orgEntity = await this.changeService.findOneWithChange(
          change,
          Org,
          { id: org.id },
        )
        variant.orgs.remove(orgEntity)
      }
    }
    if (input.tags) {
      for (const tag of input.tags) {
        const tagEntity = await this.changeService.findOneWithChange(
          change,
          Tag,
          { id: tag.id },
        )
        variant.tags.add(tagEntity)
      }
    }
    if (input.add_tags) {
      for (const tag of input.add_tags) {
        const tagEntity = await this.changeService.findOneWithChange(
          change,
          Tag,
          { id: tag.id },
        )
        variant.tags.add(tagEntity)
      }
    }
    if (input.remove_tags) {
      for (const tag of input.remove_tags) {
        const tagEntity = await this.changeService.findOneWithChange(
          change,
          Tag,
          { id: tag.id },
        )
        variant.tags.remove(tagEntity)
      }
    }
    if (input.components) {
      for (const component of input.components) {
        const comp = await this.changeService.findOneWithChange(
          change,
          Component,
          { id: component.id },
        )
        variant.components.add(comp)
      }
    }
    if (input.add_components) {
      for (const component of input.add_components) {
        const comp = await this.changeService.findOneWithChange(
          change,
          Component,
          { id: component.id },
        )
        variant.components.add(comp)
      }
    }
  }
}
