import { EntityManager } from '@mikro-orm/core'
import type { Loaded } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'
import _ from 'lodash'

import { BadRequestErr } from '@src/common/exceptions'
import { ComponentService } from '@src/process/component.service'
import { ProcessService } from '@src/process/process.service'
import { ProgramService } from '@src/process/program.service'
import { CategoryService } from '@src/product/category.service'
import { ItemService } from '@src/product/item.service'
import { VariantService } from '@src/product/variant.service'

export interface IEntityService {
  findOneByID<T, U extends Loaded<T, any>>(id: string): Promise<U | null>
}

@Injectable()
export class ChangeMapService {
  private serviceMap: Record<string, IEntityService> = {}

  private populateCache: Record<string, string[]> = {}
  private changeOmitCache: Record<string, string[]> = {}

  constructor(
    private readonly em: EntityManager,
    private readonly categoryService: CategoryService,
    private readonly itemService: ItemService,
    private readonly variantService: VariantService,
    private readonly componentService: ComponentService,
    private readonly processService: ProcessService,
    private readonly programService: ProgramService,
  ) {
    this.serviceMap['Category'] = this.categoryService as IEntityService
    this.serviceMap['Item'] = this.itemService as IEntityService
    this.serviceMap['Variant'] = this.variantService as IEntityService
    this.serviceMap['Component'] = this.componentService as IEntityService
    this.serviceMap['Process'] = this.processService as IEntityService
    this.serviceMap['Program'] = this.programService as IEntityService
  }

  findEditServices(entityName?: string) {
    if (!entityName) {
      return _.map(this.serviceMap, (service, key) => ({
        name: key,
        service,
      }))
    }
    if (!this.serviceMap[entityName]) {
      throw BadRequestErr(`No service registered for entity: ${entityName}`)
    }
    return [{ name: entityName, service: this.serviceMap[entityName] }]
  }

  private computePopulateCache(entityName: string) {
    const meta = this.em.getMetadata().get(entityName)
    if (!meta) {
      throw new Error(`Entity ${entityName} not found in metadata`)
    }
    meta.relations.forEach((rel) => {
      // Skip history and tree relations
      if (rel.name.startsWith('history') || ['ancestors', 'descendants'].includes(rel.name)) {
        return
      }
      // Populate 1:m relations
      if (!rel.pivotEntity && rel.kind === '1:m') {
        if (!this.populateCache[entityName]) {
          this.populateCache[entityName] = []
        }
        this.populateCache[entityName].push(rel.name)
      }
      // Do not store m:n relations with pivot entities
      // Instead the 1:m relation with pivot entity data is stored
      if (rel.pivotEntity && rel.kind === 'm:n') {
        if (!this.changeOmitCache[entityName]) {
          this.changeOmitCache[entityName] = []
        }
        this.changeOmitCache[entityName].push(rel.name)
      }
    })
  }
}
