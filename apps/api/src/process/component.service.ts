import { EntityManager, ref } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'
import { Change } from '@src/changes/change.entity'
import { ChangeService } from '@src/changes/change.service'
import { CursorOptions } from '@src/common/transform'
import { addTr, addTrReq } from '@src/db/i18n'
import { Region } from '@src/geo/region.entity'
import { I18nService } from 'nestjs-i18n'
import { Component, ComponentsTags } from './component.entity'
import { CreateComponentInput, UpdateComponentInput } from './component.model'
import { Material } from './material.entity'
import { StreamService } from './stream.service'
import { TagService } from './tag.service'

@Injectable()
export class ComponentService {
  constructor(
    private readonly em: EntityManager,
    private readonly changeService: ChangeService,
    private readonly tagService: TagService,
    private readonly i18n: I18nService,
    private readonly streamService: StreamService,
  ) {}

  async find(opts: CursorOptions<Component>) {
    const components = await this.em.find(Component, opts.where, opts.options)
    const count = await this.em.count(Component, opts.where)
    return {
      items: components,
      count,
    }
  }

  async findOneByID(id: string) {
    return await this.em.findOne(Component, { id })
  }

  async primary_material(id: string, component?: Component) {
    if (component) {
      return component.primary_material.load()
    }
    return null
  }

  async materials(componentId: string) {
    const component = await this.em.findOne(
      Component,
      { id: componentId },
      { populate: ['materials'] },
    )
    if (!component) {
      throw new Error(`Component with ID "${componentId}" not found`)
    }
    return component.materials.getItems()
  }

  async recycle(componentId: string, regionId?: string) {
    const recycle = await this.streamService.recycleComponent(
      componentId,
      regionId,
    )
    return recycle
  }

  async recycleScore(componentId: string, regionId?: string) {
    const score = await this.streamService.recycleComponentScore(
      componentId,
      regionId,
    )
    return score
  }

  async create(input: CreateComponentInput, userID: string) {
    const component = new Component()
    if (!input.useChange()) {
      await this.setFields(component, input)
      await this.em.persistAndFlush(component)
      return {
        component,
        change: null,
      }
    }
    const change = await this.changeService.findOneOrCreate(
      input.change_id,
      input.change,
      userID,
    )
    await this.setFields(component, input, change)
    await this.changeService.createEntityEdit(change, component)
    await this.em.persistAndFlush(change)
    await this.changeService.checkMerge(change, input)
    return {
      component,
      change,
    }
  }

  async update(input: UpdateComponentInput, userID: string) {
    const component = await this.em.findOne(Component, { id: input.id })
    if (!component) {
      throw new Error(`Component with ID "${input.id}" not found`)
    }
    if (!input.useChange()) {
      await this.setFields(component, input)
      await this.em.persistAndFlush(component)
      return {
        component,
        change: null,
      }
    }
    const change = await this.changeService.findOneOrCreate(
      input.change_id,
      input.change,
      userID,
    )
    await this.setFields(component, input, change)
    await this.changeService.createEntityEdit(change, component)
    await this.em.persistAndFlush(change)
    await this.changeService.checkMerge(change, input)
    return {
      component,
      change,
    }
  }

  async setFields(
    component: Component,
    input: Partial<CreateComponentInput & UpdateComponentInput>,
    change?: Change,
  ) {
    if (input.name) {
      component.name = addTrReq(component.name, input.lang, input.name)
    }
    if (input.desc) {
      component.desc = addTr(component.desc, input.lang, input.desc)
    }
    if (input.image_url) {
      component.visual = { image: input.image_url }
    }
    if (input.primary_material) {
      const material = await this.em.findOne(Material, {
        id: input.primary_material.id,
      })
      if (!material) {
        throw new Error(
          `Material with ID "${input.primary_material.id}" not found`,
        )
      }
      component.primary_material = ref(Material, material.id)
    }
    if (input.materials) {
      const materials = await this.em.find(Material, {
        id: { $in: input.materials.map((m) => m.id) },
      })
      if (materials.length !== input.materials.length) {
        throw new Error(
          `Materials with IDs "${input.materials
            .map((m) => m.id)
            .filter((id) => !materials.find((m) => m.id === id))
            .join(', ')}" not found`,
        )
      }
      component.materials.set(materials)
    }
    if (input.tags) {
      for (const tag of input.tags) {
        const tagDef = await this.tagService.validateTagInput(tag)
        const componentTag = new ComponentsTags()
        componentTag.tag = tagDef
        componentTag.component = component
        componentTag.meta = tag.meta
        component.component_tags.add(componentTag)
      }
    }
    if (input.add_tags) {
      for (const tag of input.add_tags) {
        const tagDef = await this.tagService.validateTagInput(tag)
        const componentTag = new ComponentsTags()
        componentTag.tag = tagDef
        componentTag.component = component
        componentTag.meta = tag.meta
        component.component_tags.add(componentTag)
      }
    }
    if (input.remove_tags) {
      for (const tag of input.remove_tags) {
        const componentTag = await this.em.findOne(ComponentsTags, {
          tag: { id: tag.id },
          component: { id: component.id },
        })
        if (componentTag) {
          component.component_tags.remove(componentTag)
        }
      }
    }
    if (input.region) {
      const region = await this.em.findOne(Region, { id: input.region.id })
      if (!region) {
        throw new Error(`Region with ID "${input.region.id}" not found`)
      }
      component.region = ref(Region, region.id)
    }
  }
}
