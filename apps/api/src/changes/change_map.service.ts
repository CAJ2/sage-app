import { Injectable } from '@nestjs/common'
import { CategorySchemaService } from '@src/product/category.schema'
import { CategoryService } from '@src/product/category.service'
import { ItemSchemaService } from '@src/product/item.schema'
import { ItemService } from '@src/product/item.service'
import _ from 'lodash'
import { Edit as EditModel } from './change.model'
import type { Loaded } from '@mikro-orm/postgresql'

export interface IEntityService {
  findOneByID<T, U extends Loaded<T, any>>(id: string): Promise<U | null>
}

@Injectable()
export class ChangeMapService {
  private serviceMap: Record<string, IEntityService> = {}

  private createEditFns: Record<string, (edit: EditModel) => Promise<any>> = {}

  private updateEditFns: Record<string, (edit: EditModel) => Promise<any>> = {}

  constructor(
    private readonly categoryService: CategoryService,
    private readonly categorySchema: CategorySchemaService,
    private readonly itemService: ItemService,
    private readonly itemSchema: ItemSchemaService,
  ) {
    this.serviceMap['Category'] = this.categoryService as IEntityService
    this.createEditFns['Category'] =
      this.categorySchema.categoryCreateEdit.bind(this.categorySchema)
    this.updateEditFns['Category'] =
      this.categorySchema.categoryUpdateEdit.bind(this.categorySchema)
    this.serviceMap['Item'] = this.itemService as IEntityService
    this.createEditFns['Item'] = this.itemSchema.itemCreateEdit.bind(
      this.itemSchema,
    )
    this.updateEditFns['Item'] = this.itemSchema.itemUpdateEdit.bind(
      this.itemSchema,
    )
  }

  findEditServices(entityName?: string) {
    if (!entityName) {
      return _.map(this.serviceMap, (service, key) => ({
        name: key,
        service,
      }))
    }
    if (!this.serviceMap[entityName]) {
      throw new Error(`No service registered for entity: ${entityName}`)
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
}
