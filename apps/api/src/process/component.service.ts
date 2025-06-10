import { EntityManager, ref } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'
import { Change } from '@src/changes/change.entity'
import { ChangeService } from '@src/changes/change.service'
import { CursorOptions } from '@src/common/transform'
import { addTr, addTrReq, tr } from '@src/db/i18n'
import { Region } from '@src/geo/region.entity'
import { ClsService } from 'nestjs-cls'
import { I18nService } from 'nestjs-i18n'
import { Component, ComponentsTags } from './component.entity'
import {
  ComponentRecycle,
  CreateComponentInput,
  UpdateComponentInput,
} from './component.model'
import { Material } from './material.entity'
import { Process } from './process.entity'
import { RecyclingStream, StreamScore, StreamScoreRating } from './stream.model'
import { TagService } from './tag.service'

@Injectable()
export class ComponentService {
  constructor(
    private readonly em: EntityManager,
    private readonly changeService: ChangeService,
    private readonly tagService: TagService,
    private readonly cls: ClsService,
    private readonly i18n: I18nService,
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
    const component = await this.em.findOne(
      Component,
      { id: componentId },
      { populate: ['primary_material', 'materials'] },
    )
    if (!component) {
      throw new Error(`Component with ID "${componentId}" not found`)
    }
    const region = await this.em.findOne(Region, { id: regionId })
    if (!region) {
      throw new Error(`Region with ID "${regionId}" not found`)
    }
    const regionSearch = region.hierarchyIDs()

    const materialSearch: string[] = []
    materialSearch.push(component.primary_material.id)
    for (const material of component.materials.getItems()) {
      materialSearch.push(material.id)
    }

    // Search for processes that match this component
    const processes = await this.em.find(Process, {
      material: { id: { $in: materialSearch } },
      region: { id: { $in: regionSearch } },
    })

    const recycle: ComponentRecycle[] = []
    const lang = this.cls.get('lang')
    if (processes.length > 0) {
      const r = new ComponentRecycle()
      const processMatch = processes[0]
      r.stream = new RecyclingStream()
      r.stream.name = tr(processMatch.name, lang)
      r.stream.desc = tr(processMatch.desc, lang)
      r.stream.score = this.calculateScore(processMatch)
      r.stream.container = processMatch.instructions.container
      recycle.push(r)
    }
    return recycle
  }

  async recycleScore(componentId: string, regionId?: string) {
    const recycle = await this.recycle(componentId, regionId)
    if (!recycle) {
      return null
    }
    const score = new StreamScore()
    let totalScore = 0
    let validScores = 0
    for (const r of recycle) {
      if (r.stream && r.stream.score) {
        if (r.stream.score.score) {
          totalScore += r.stream.score.score
          validScores++
        }
      }
    }
    score.score = validScores > 0 ? totalScore / validScores : undefined
    score.rating =
      validScores > 0 ? StreamScoreRating.GOOD : StreamScoreRating.UNKNOWN
    score.rating_f = this.i18n.t(`stream.score_rating.${score.rating}`)
    return score
  }

  calculateScore(process: Process) {
    const score = new StreamScore()
    if (process.efficiency && process.efficiency.efficiency) {
      score.score = process.efficiency.efficiency * 100
      score.rating = StreamScoreRating.GOOD
    } else {
      score.rating = StreamScoreRating.UNKNOWN
    }
    score.rating_f = this.i18n.t(`stream.score_rating.${score.rating}`)
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
