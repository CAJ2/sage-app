import { BaseEntity } from '@mikro-orm/core'
import type { EntityDTO, FindOptions, Loaded, ObjectQuery, QueryOrderMap } from '@mikro-orm/core'
import { EntityManager } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import type { ClassConstructor, ClassTransformOptions, TransformFnParams } from 'class-transformer'
import { validateOrReject } from 'class-validator'
import { GraphQLError } from 'graphql'
import _ from 'lodash'
import { ClsService } from 'nestjs-cls'

import { BaseModel, ModelRegistry } from '@src/graphql/base.model'

import {
  DEFAULT_PAGE_SIZE,
  EdgeType,
  IPaginationArgs,
  OrderDirection,
  PaginatedType,
  PaginationArgsSchema,
} from '../graphql/paginated'

export type EntityDTOCtx<T> = EntityDTO<T> & {
  _lang?: string[]
}

export interface Cursor<T, F extends string> {
  items: Loaded<T, never, F>[]
  count: number
}

export interface CursorOptions<T> {
  // Where clause for the query
  where: ObjectQuery<T>
  // Options for the query
  options: FindOptions<T, any>
}

@Injectable()
export class TransformService {
  constructor(private readonly cls: ClsService) {}

  async entityToModel<T extends BaseEntity, S extends BaseModel<T>>(
    model: new () => S,
    entity: Loaded<T, never>,
  ): Promise<S> {
    const entityObj: EntityDTOCtx<T> = entity.toObject()
    ;(entityObj as any)._lang = this.cls.get('lang')
    const inst = plainToInstance(model, entityObj, {
      lang: this.cls.get('lang'),
    } as ClassTransformOptions)
    specialCases(inst, entityObj)
    await validateOrReject(inst).catch((errors) => {
      throw new GraphQLError(errors.toString())
    })
    inst.entity = entity
    return inst
  }

  async objectToModel<T, S extends object>(model: new () => S, object: T): Promise<S> {
    const obj = object as EntityDTOCtx<T>
    ;(obj as any)._lang = this.cls.get('lang')
    const inst = plainToInstance(model, obj, {
      lang: this.cls.get('lang'),
    } as ClassTransformOptions)
    specialCases(inst, obj)
    await validateOrReject(inst).catch((errors) => {
      throw new GraphQLError(errors.toString())
    })
    return inst
  }

  async entitiesToModels<T extends BaseEntity, S extends BaseModel<T>>(
    model: new () => S,
    entities: Loaded<T, never>[],
  ): Promise<S[]> {
    const models: S[] = []
    for (const entity of entities) {
      const inst = await this.entityToModel(model, entity)
      models.push(inst)
    }
    return models
  }

  async objectsToModels<T, S extends object>(model: new () => S, objects: T[]): Promise<S[]> {
    const models: S[] = []
    for (const obj of objects) {
      const inst = await this.objectToModel(model, obj)
      models.push(inst)
    }
    return models
  }

  async paginationArgs<T extends IPaginationArgs>(
    cls: ClassConstructor<T> & { schema: PaginationArgsSchema },
    argsObj: T,
  ): Promise<[T, CursorOptions<any>]> {
    const result = await cls.schema.safeParseAsync(argsObj)
    if (!result.success) {
      throw new GraphQLError(result.error.toString())
    }
    const args = plainToInstance(cls, result.data)
    const where: ObjectQuery<any> = {}
    const orderByField = args.orderBy()[0] || 'id'
    let decoded = ''
    if (args.after || args.before) {
      try {
        decoded = Buffer.from((args.after || args.before) as string, 'base64').toString('utf8')
      } catch (e) {
        throw new GraphQLError('Invalid cursor')
      }
    }
    let orderDirection = args.orderDir()[0] || 'ASC'
    if ((args.after && orderDirection === 'ASC') || (args.before && orderDirection === 'DESC')) {
      where[orderByField] = { $gte: decoded }
    } else if (args.after || args.before) {
      where[orderByField] = { $lte: decoded }
    }
    if (args.before || args.last) {
      // Need to flip order direction, then reverse the results
      orderDirection =
        orderDirection === OrderDirection.DESC ? OrderDirection.ASC : OrderDirection.DESC
    }
    const options: CursorOptions<any> = {
      where,
      options: {
        orderBy: {
          [orderByField]: orderDirection,
        } as QueryOrderMap<any>,
        limit: (args.first || args.last || DEFAULT_PAGE_SIZE) + 2,
      },
    }
    return [args, options]
  }

  async entityToPaginated<
    T extends BaseEntity,
    U extends BaseModel<T>,
    S extends PaginatedType<U, T>,
  >(
    model: new () => U,
    PageModel: new () => S,
    cursor: Cursor<T, '*'>,
    options: IPaginationArgs,
  ): Promise<PaginatedType<U, T>> {
    const page: S = new PageModel()
    const nodes: U[] = []
    const edges: EdgeType<U, T>[] = []
    const flip = options.before || options.last
    cursor.items = flip ? cursor.items.reverse() : cursor.items
    for (const item of cursor.items) {
      const cls = await this.entityToModel(model, item)
      nodes.push(cls)
      const itemOrderField = (item as any)[options.orderBy()[0] || 'id']
      const cid = Buffer.from(
        _.isString(itemOrderField) ? itemOrderField : itemOrderField.id,
      ).toString('base64')
      edges.push({ cursor: cid, node: cls })
    }
    const pageSize = options.first || options.last || DEFAULT_PAGE_SIZE
    let hasPreviousPage = false
    let hasNextPage = false
    let extraNode = false
    if (edges.length === pageSize + 2) {
      const idx = flip ? edges.length - 1 : 0
      if (edges[idx].cursor === (options.after || options.before)) {
        hasPreviousPage = true
        hasNextPage = true
      } else {
        hasNextPage = !!options.first
        hasPreviousPage = !!options.last
        extraNode = true
      }
    } else if (edges.length <= pageSize + 1 && edges.length > 0) {
      const idx = flip ? edges.length - 1 : 0
      if (edges[idx].cursor === (options.after || options.before)) {
        hasPreviousPage = !!options.after
        hasNextPage = !!options.before
      } else if (edges.length > pageSize) {
        hasNextPage = !!options.first
        hasPreviousPage = !!options.last
      }
    }
    if (hasPreviousPage) {
      edges.shift()
      nodes.shift()
      if (extraNode) {
        edges.shift()
        nodes.shift()
      }
    }
    if (hasNextPage) {
      edges.pop()
      nodes.pop()
      if (extraNode) {
        edges.pop()
        nodes.pop()
      }
    }
    page.edges = edges
    page.nodes = nodes
    page.totalCount = cursor.count
    page.pageInfo = {
      startCursor: edges[0]?.cursor,
      endCursor: edges[edges.length - 1]?.cursor,
      hasPreviousPage,
      hasNextPage,
    }
    return page
  }

  async loadCursor<T extends BaseEntity>(
    em: EntityManager,
    entity: new () => T,
    relation: string,
    opts: CursorOptions<T>,
  ): Promise<Cursor<T, '*'>> {
    const [items, totalCount] = await em.findAndCount(entity, opts.where, opts.options)
    return {
      items,
      count: totalCount,
    }
  }

  getCurrentLang() {
    const lang: string[] | undefined = this.cls.get('lang')
    return lang ? lang[0] : undefined
  }

  async objectsToPaginated<T, S extends PaginatedType<any, any>>(
    PageModel: new () => S,
    cursor: { items: EntityDTO<T>[]; count: number },
    skipTransform?: boolean,
  ): Promise<PaginatedType<any, any>> {
    const entities: any[] = []
    if (skipTransform) {
      entities.push(...cursor.items)
    } else {
      for (const obj of cursor.items) {
        if (!(obj as any)._type) {
          continue
        }
        ;(obj as any)._lang = this.cls.get('lang')
        const inst: object = plainToInstance((obj as any)._type, obj, {
          lang: this.cls.get('lang'),
        } as ClassTransformOptions)
        specialCases(inst, obj)
        await validateOrReject(inst).catch((errors) => {
          throw new GraphQLError(errors.toString())
        })
        entities.push(inst)
      }
    }
    const page = new PageModel()
    page.edges = entities.map((node) => ({
      cursor: Buffer.from(node.id || '').toString('base64'),
      node,
    }))
    page.nodes = entities
    page.totalCount = cursor.count
    page.pageInfo = {
      hasPreviousPage: entities.length < cursor.count,
      hasNextPage: false,
    }
    return page
  }
}

export function transformUnion(field: string): (params: TransformFnParams) => object {
  return (params: TransformFnParams) => {
    const obj = params.obj as any
    if (!obj || !obj[field]) {
      return {}
    }
    const constr = ModelRegistry[obj[field]]
    if (!constr) {
      throw new Error(`Model ${obj[field]} not found in registry`)
    }
    params.value._lang = params.obj._lang || []
    const instance = plainToInstance(constr, params.value, {
      lang: params.obj._lang,
    } as ClassTransformOptions)
    specialCases(instance, params.value)
    return instance
  }
}

export function entityToModelRegistry(entity: string, obj: object, lang: string[]) {
  if (!obj) {
    return {}
  }
  const constr = ModelRegistry[entity]
  if (!constr) {
    throw new Error(`Model ${entity} not found in registry`)
  }
  ;(obj as any)._lang = lang
  const instance = plainToInstance(constr, obj, {
    lang,
  } as ClassTransformOptions)
  specialCases(instance, obj)
  return instance
}

function specialCases(instance: any, obj: any) {
  // Transform special cases like translation objects
  _.each(obj, (value, key) => {
    if (_.has(instance, key) && instance[key] instanceof BaseModel) {
      _.each(value, (v, k) => {
        if (k.endsWith('Tr')) {
          ;(instance[key] as any)[k] = v
        }
      })
    }
    if (key.endsWith('Tr')) {
      ;(instance as any)[key] = value
    }
  })
  if ((instance as any).transform) {
    ;(instance as any).transform(obj)
  }
  callTransform(instance, obj)
}

function callTransform(obj: any, src: any, depth = 0, maxDepth = 5) {
  if (!obj || depth > maxDepth) return

  // If the object itself has a transform method, call it
  if (typeof obj.transform === 'function') {
    obj.transform(src)
  }

  // Iterate over all properties
  for (const key of Object.keys(obj)) {
    const value = obj[key]
    const srcValue = src ? src[key] : undefined

    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        callTransform(value[i], srcValue ? srcValue[i] : undefined, depth + 1, maxDepth)
      }
    } else if (value && typeof value === 'object') {
      callTransform(value, srcValue, depth + 1, maxDepth)
    }
  }
}
