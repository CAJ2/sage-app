import { EntityManager } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'
import { tr } from '@src/db/i18n'
import { Region } from '@src/geo/region.entity'
import { ClsService } from 'nestjs-cls'
import { I18nService } from 'nestjs-i18n'
import { Component } from './component.entity'
import { ComponentRecycle } from './component.model'
import { Process } from './process.entity'
import { RecyclingStream, StreamScore, StreamScoreRating } from './stream.model'

@Injectable()
export class StreamService {
  constructor(
    private readonly em: EntityManager,
    private readonly cls: ClsService,
    private readonly i18n: I18nService,
  ) {}

  async recycleComponent(componentId: string, regionId?: string) {
    const component = await this.em.findOne(
      Component,
      { id: componentId },
      { populate: ['primaryMaterial', 'materials'] },
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
    materialSearch.push(component.primaryMaterial.id)
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

  async recycleComponentScore(componentId: string, regionId?: string) {
    const recycle = await this.recycleComponent(componentId, regionId)
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
    score.ratingF = this.i18n.t(`stream.scoreRating.${score.rating}`)
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
    score.ratingF = this.i18n.t(`stream.scoreRating.${score.rating}`)
    return score
  }
}
