import { EntityManager, ref } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'
import { Change } from '@src/changes/change.entity'
import { DeleteInput } from '@src/changes/change.model'
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
          'primaryMaterial',
          'materials',
          'componentSources',
          'componentTags',
          'componentMaterials',
        ],
      },
    )
  }

  async primaryMaterial(id: string, component?: Component) {
    if (component) {
      return component.primaryMaterial.load()
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
      { populate: ['componentTags', 'componentTags.tag'] },
    )
    if (!component) {
      throw new Error(`Component with ID "${componentId}" not found`)
    }
    return component.componentTags.getItems().map((tag) => {
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
      input.changeID,
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
    if (!change) {
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

  async delete(input: DeleteInput) {
    const deleted = await this.editService.deleteOneWithChange(input, Component)
    if (!deleted) {
      throw new Error(`Component with ID "${input.id}" not found`)
    }
    return deleted
  }

  async setFields(
    component: Component,
    input: Partial<CreateComponentInput & UpdateComponentInput>,
    change?: Change,
  ) {
    if (input.name) {
      component.name = addTrReq(component.name, input.lang, input.name)
    }
    if (input.nameTr) {
      component.name = addTrReq(component.name, input.lang, input.nameTr)
    }
    if (input.desc) {
      component.desc = addTr(component.desc, input.lang, input.desc)
    }
    if (input.descTr) {
      component.desc = addTr(component.desc, input.lang, input.descTr)
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
        throw new Error(
          `Material with ID "${input.primaryMaterial.id}" not found`,
        )
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
