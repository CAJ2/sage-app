import { EntityManager, ref } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'

import { DeleteInput, isUsingChange } from '@src/changes/change-ext.model'
import { Change } from '@src/changes/change.entity'
import { EditService } from '@src/changes/edit.service'
import { Source } from '@src/changes/source.entity'
import { I18nService } from '@src/common/i18n.service'
import { CursorOptions } from '@src/common/transform'
import { Region } from '@src/geo/region.entity'
import {
  Component,
  ComponentHistory,
  ComponentsMaterials,
  ComponentsSources,
  ComponentsTags,
} from '@src/process/component.entity'
import { CreateComponentInput, UpdateComponentInput } from '@src/process/component.model'
import { Material } from '@src/process/material.entity'
import { StreamService } from '@src/process/stream.service'
import { Tag } from '@src/process/tag.entity'
import { TagService } from '@src/process/tag.service'

@Injectable()
export class ComponentService {
  constructor(
    private readonly em: EntityManager,
    private readonly editService: EditService,
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

  async findOneByID(id: string, withChange?: string) {
    return await this.em.findOne(
      Component,
      { id },
      {
        populate: [
          'region',
          'primaryMaterial',
          'materials',
          'componentSources',
          'componentTags',
          'componentMaterials',
        ],
      },
    )
  }

  async primaryMaterial(id: string) {
    const component = await this.em.findOne(Component, { id }, { populate: ['primaryMaterial'] })
    if (!component) {
      return null
    }
    return component.primaryMaterial.load()
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

  async tags(componentId: string, opts: CursorOptions<Tag>) {
    opts.where.components = this.em.getReference(Component, componentId)
    const tagDefs = await this.em.find(Tag, opts.where, opts.options)
    const componentTags = await this.em.find(
      ComponentsTags,
      { component: componentId },
      { limit: opts.options.limit },
    )
    const combinedTags = []
    for (const ct of componentTags) {
      const tagDef = tagDefs.find((t) => t.id === ct.tag.id)
      if (tagDef) {
        tagDef.meta = ct.meta
        combinedTags.push(tagDef)
      }
    }
    const count = await this.em.count(ComponentsTags, { component: opts.where.components })
    return { items: combinedTags, count }
  }

  async recycle(componentId: string, regionId?: string) {
    const recycle = await this.streamService.recycleComponent(componentId, regionId)
    return recycle
  }

  async recycleScore(componentId: string, regionId?: string) {
    const score = await this.streamService.recycleComponentScore(componentId, regionId)
    return score
  }

  async create(input: CreateComponentInput, userID: string) {
    const component = new Component()
    if (!isUsingChange(input)) {
      await this.setFields(component, input)
      await this.editService.createHistory(
        Component.name,
        userID,
        undefined,
        this.editService.entityToChangePOJO(Component.name, component),
      )
      await this.em.persist(component).flush()
      return {
        component,
        change: null,
      }
    }
    const change = await this.editService.findOneOrCreate(input.changeID, input.change, userID)
    await this.setFields(component, input, change)
    await this.editService.createEntityEdit(change, component)
    await this.em.persist(change).flush()
    await this.editService.checkMerge(change, input)
    return {
      component,
      change,
    }
  }

  async update(input: UpdateComponentInput, userID: string) {
    const { entity: component, change } = await this.editService.findOneWithChangeInput(
      input,
      userID,
      Component,
      {
        id: input.id,
      },
      { populate: ['materials', 'tags', 'componentTags', 'componentSources'] },
    )
    if (!component) {
      throw new Error(`Component with ID "${input.id}" not found`)
    }
    if (!change) {
      const original = this.editService.entityToChangePOJO(Component.name, component)
      await this.setFields(component, input)
      await this.editService.createHistory(
        Component.name,
        userID,
        original,
        this.editService.entityToChangePOJO(Component.name, component),
      )
      await this.em.persist(component).flush()
      return {
        component,
        change: null,
      }
    }
    await this.editService.beginUpdateEntityEdit(change, component)
    await this.setFields(component, input, change)
    await this.editService.updateEntityEdit(change, component)
    await this.em.persist(change).flush()
    await this.editService.checkMerge(change, input)
    return {
      component,
      change,
    }
  }

  async delete(input: DeleteInput) {
    const deleted = await this.editService.deleteOneWithChange(input, Component)
    if (!deleted) {
      throw new Error(`Component with ID "${input.id}" not found`)
    }
    return deleted
  }

  async sources(componentID: string, opts: CursorOptions<ComponentsSources>) {
    opts.where.component = this.em.getReference(Component, componentID)
    opts.options.populate = ['source']
    const items = await this.em.find(ComponentsSources, opts.where, opts.options)
    const count = await this.em.count(ComponentsSources, { component: opts.where.component })
    return { items, count }
  }

  async history(componentID: string, opts: CursorOptions<ComponentHistory>) {
    const items = await this.em.find(
      ComponentHistory,
      { component: componentID },
      {
        populate: ['user'],
        orderBy: { datetime: 'ASC' },
        limit: opts.options.limit,
        offset: opts.options.offset,
      },
    )
    const count = await this.em.count(ComponentHistory, { component: componentID })
    return { items, count }
  }

  async setFields(
    component: Component,
    input: Partial<CreateComponentInput & UpdateComponentInput>,
    change?: Change,
  ) {
    if (!change && input.addSources) {
      for (const source of input.addSources) {
        const sourceEntity = await this.em.findOneOrFail(Source, { id: source.id })
        const existing = component.componentSources.find((cs) => cs.source.id === source.id)
        if (existing) {
          existing.meta = source.meta
          this.em.persist(existing)
        } else {
          const pivot = new ComponentsSources()
          pivot.component = component
          pivot.source = sourceEntity
          pivot.meta = source.meta
          this.em.persist(pivot)
        }
      }
    }
    if (!change && input.removeSources) {
      for (const sourceId of input.removeSources) {
        const existing = component.componentSources.find((cs) => cs.source.id === sourceId)
        if (existing) {
          this.em.remove(existing)
        }
      }
    }
    if (input.name) {
      component.name = this.i18n.addTrReq(component.name, input.name, input.lang)
    }
    if (input.nameTr) {
      component.name = this.i18n.addTrReq(component.name, input.nameTr, input.lang)
    }
    if (input.desc) {
      component.desc = this.i18n.addTr(component.desc, input.desc, input.lang)
    }
    if (input.descTr) {
      component.desc = this.i18n.addTr(component.desc, input.descTr, input.lang)
    }
    if (input.visual) {
      component.visual = { ...component.visual, ...input.visual }
    }
    if (input.physical) {
      component.physical = { ...component.physical, ...input.physical }
    }
    if (input.imageURL) {
      component.visual = { image: input.imageURL }
    }
    if (input.primaryMaterial) {
      const material = await this.em.findOne(Material, {
        id: input.primaryMaterial.id,
      })
      if (!material) {
        throw new Error(`Material with ID "${input.primaryMaterial.id}" not found`)
      }
      component.primaryMaterial = ref(Material, material.id)
    }
    if (input.materials) {
      component.componentMaterials = await this.editService.setOrAddPivot(
        component.id,
        change?.id,
        component.componentMaterials,
        Component,
        ComponentsMaterials,
        input.materials,
      )
    }
    if (input.tags || input.addTags) {
      for (const tag of input.tags || input.addTags || []) {
        await this.tagService.validateTagInput(tag)
      }
      component.componentTags = await this.editService.setOrAddPivot(
        component.id,
        change?.id,
        component.componentTags,
        Component,
        ComponentsTags,
        input.tags,
        input.addTags,
      )
    }
    if (input.removeTags) {
      component.componentTags = await this.editService.removeFromPivot(
        change?.id,
        component.componentTags,
        Component,
        ComponentsTags,
        input.removeTags,
      )
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
