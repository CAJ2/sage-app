import { EntityManager, ref } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'
import { Change } from '@src/changes/change.entity'
import { EditService } from '@src/changes/edit.service'
import { CursorOptions } from '@src/common/transform'
import { addTr, addTrReq } from '@src/db/i18n'
import { Region } from '@src/geo/region.entity'
import { I18nService } from 'nestjs-i18n'
import {
  Component,
  ComponentsMaterials,
  ComponentsTags,
} from './component.entity'
import { CreateComponentInput, UpdateComponentInput } from './component.model'
import { Material } from './material.entity'
import { StreamService } from './stream.service'
import { TagService } from './tag.service'

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
          'primary_material',
          'materials',
          'component_sources',
          'component_tags',
          'component_materials',
        ],
      },
    )
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

  async tags(componentId: string) {
    const component = await this.em.findOne(
      Component,
      { id: componentId },
      { populate: ['component_tags', 'component_tags.tag'] },
    )
    if (!component) {
      throw new Error(`Component with ID "${componentId}" not found`)
    }
    return component.component_tags.getItems().map((tag) => {
      return {
        ...tag.tag,
        meta: tag.meta,
      }
    })
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
    const change = await this.editService.findOneOrCreate(
      input.change_id,
      input.change,
      userID,
    )
    await this.setFields(component, input, change)
    await this.editService.createEntityEdit(change, component)
    await this.em.persistAndFlush(change)
    await this.editService.checkMerge(change, input)
    return {
      component,
      change,
    }
  }

  async update(input: UpdateComponentInput, userID: string) {
    const { entity: component, change } =
      await this.editService.findOneWithChangeInput(input, userID, Component, {
        id: input.id,
      })
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
    await this.editService.beginUpdateEntityEdit(change, component)
    await this.setFields(component, input, change)
    await this.editService.updateEntityEdit(change, component)
    await this.em.persistAndFlush(change)
    await this.editService.checkMerge(change, input)
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
    if (input.name_tr) {
      component.name = addTrReq(component.name, input.lang, input.name_tr)
    }
    if (input.desc) {
      component.desc = addTr(component.desc, input.lang, input.desc)
    }
    if (input.desc_tr) {
      component.desc = addTr(component.desc, input.lang, input.desc_tr)
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
      component.materials = await this.editService.setOrAddPivot(
        component.id,
        change?.id,
        component.materials,
        Component,
        ComponentsMaterials,
        input.materials,
      )
    }
    if (input.tags || input.add_tags) {
      for (const tag of input.tags || input.add_tags || []) {
        await this.tagService.validateTagInput(tag)
      }
      component.component_tags = await this.editService.setOrAddPivot(
        component.id,
        change?.id,
        component.component_tags,
        Component,
        ComponentsTags,
        input.tags,
        input.add_tags,
      )
    }
    if (input.remove_tags) {
      component.component_tags = await this.editService.removeFromPivot(
        change?.id,
        component.component_tags,
        Component,
        ComponentsTags,
        input.remove_tags,
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
