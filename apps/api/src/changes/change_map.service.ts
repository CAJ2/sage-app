import { EntityManager } from '@mikro-orm/core'
import type { Loaded } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'
import _ from 'lodash'

import type { Edit as EditModel } from '@src/changes/change.model'
import { BadRequestErr } from '@src/common/exceptions'
import { ComponentSchemaService } from '@src/process/component.schema'
import { ComponentService } from '@src/process/component.service'
import { ProcessSchemaService } from '@src/process/process.schema'
import { ProcessService } from '@src/process/process.service'
import { CategorySchemaService } from '@src/product/category.schema'
import { CategoryService } from '@src/product/category.service'
import { ItemSchemaService } from '@src/product/item.schema'
import { ItemService } from '@src/product/item.service'
import { VariantSchemaService } from '@src/product/variant.schema'
import { VariantService } from '@src/product/variant.service'

export interface IEntityService {
  findOneByID<T, U extends Loaded<T, any>>(id: string): Promise<U | null>
}

@Injectable()
export class ChangeMapService {
  private serviceMap: Record<string, IEntityService> = {}

  private createEditFns: Record<string, (edit: EditModel) => Promise<any>> = {}

  private updateEditFns: Record<string, (edit: EditModel) => Promise<any>> = {}

  private populateCache: Record<string, string[]> = {}
  private changeOmitCache: Record<string, string[]> = {}

  constructor(
    private readonly em: EntityManager,
    private readonly categoryService: CategoryService,
    private readonly categorySchema: CategorySchemaService,
    private readonly itemService: ItemService,
    private readonly itemSchema: ItemSchemaService,
    private readonly variantService: VariantService,
    private readonly variantSchema: VariantSchemaService,
    private readonly componentService: ComponentService,
    private readonly componentSchema: ComponentSchemaService,
    private readonly processService: ProcessService,
    private readonly processSchema: ProcessSchemaService,
  ) {
    this.serviceMap['Category'] = this.categoryService as IEntityService
    this.createEditFns['Category'] = this.categorySchema.categoryCreateEdit.bind(
      this.categorySchema,
    )
    this.updateEditFns['Category'] = this.categorySchema.categoryUpdateEdit.bind(
      this.categorySchema,
    )
    this.serviceMap['Item'] = this.itemService as IEntityService
    this.createEditFns['Item'] = this.itemSchema.itemCreateEdit.bind(this.itemSchema)
    this.updateEditFns['Item'] = this.itemSchema.itemUpdateEdit.bind(this.itemSchema)
    this.serviceMap['Variant'] = this.variantService as IEntityService
    this.createEditFns['Variant'] = this.variantSchema.variantCreateEdit.bind(this.variantSchema)
    this.updateEditFns['Variant'] = this.variantSchema.variantUpdateEdit.bind(this.variantSchema)
    this.serviceMap['Component'] = this.componentService as IEntityService
    this.createEditFns['Component'] = this.componentSchema.componentCreateEdit.bind(
      this.componentSchema,
    )
    this.updateEditFns['Component'] = this.componentSchema.componentUpdateEdit.bind(
      this.componentSchema,
    )
    this.serviceMap['Process'] = this.processService as IEntityService
    this.createEditFns['Process'] = this.processSchema.processCreateEdit.bind(this.processSchema)
    this.updateEditFns['Process'] = this.processSchema.processUpdateEdit.bind(this.processSchema)
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

  createEdit(entity: string, edit: EditModel) {
    const createFn = this.createEditFns[entity]
    if (!createFn) {
      throw new Error(`No create function registered for entity: ${entity}`)
    }
    return createFn(edit)
  }

  updateEdit(entity: string, edit: EditModel) {
    const updateFn = this.updateEditFns[entity]
    if (!updateFn) {
      throw new Error(`No update function registered for entity: ${entity}`)
    }
    return updateFn(edit)
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
