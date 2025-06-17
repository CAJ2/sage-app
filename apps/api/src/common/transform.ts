import { BaseEntity } from '@mikro-orm/core'
import { EntityManager } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'
import { BaseModel, ModelRegistry } from '@src/graphql/base.model'
import { plainToInstance } from 'class-transformer'
import { validateOrReject } from 'class-validator'
import { GraphQLError } from 'graphql'
import _ from 'lodash'
import { ClsService } from 'nestjs-cls'
import {
  DEFAULT_PAGE_SIZE,
  EdgeType,
  OrderDirection,
  PaginatedType,
  PaginationArgsType,
} from '../graphql/paginated'
import type {
  EntityDTO,
  FindOptions,
  Loaded,
  ObjectQuery,
  QueryOrderMap,
} from '@mikro-orm/core'
import type { TransformFnParams } from 'class-transformer'

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
  options: FindOptions<T>
}

@Injectable()
export class TransformService {
  constructor(private readonly cls: ClsService) {}

  async entityToModel<T extends BaseEntity, S extends BaseModel<T>>(
    entity: Loaded<T, never>,
    model: new () => S,
  ): Promise<S> {
    const entityObj: EntityDTOCtx<T> = entity.toObject()
    entityObj._lang = this.cls.get('lang')
    const inst = plainToInstance(model, entityObj)
    // Transform special cases like translation objects
    _.each(entityObj, (value, key) => {
      if (key.endsWith('_tr')) {
        ;(inst as any)[key] = value
      }
    })
    if ((inst as any).transform) {
      ;(inst as any).transform(entityObj)
    }
    await validateOrReject(inst).catch((errors) => {
      throw new GraphQLError(errors.toString())
    })
    inst.entity = entity
    return inst
  }

  async objectToModel<T, S extends object>(
    object: T,
    model: new () => S,
  ): Promise<S> {
    const obj = object as EntityDTOCtx<T>
    obj._lang = this.cls.get('lang')
    const inst = plainToInstance(model, obj)
    // Transform special cases like translation objects
    _.each(obj, (value, key) => {
      if (key.endsWith('_tr')) {
        ;(inst as any)[key] = value
      }
    })
    if ((inst as any).transform) {
      ;(inst as any).transform(obj)
    }
    await validateOrReject(inst).catch((errors) => {
      throw new GraphQLError(errors.toString())
    })
    return inst
  }

  async entitiesToModels<T extends BaseEntity, S extends BaseModel<T>>(
    entities: Loaded<T, never>[],
    model: new () => S,
  ): Promise<S[]> {
    const models: S[] = []
    for (const entity of entities) {
      const inst = await this.entityToModel(entity, model)
      models.push(inst)
    }
    return models
  }

  paginationArgs(args: PaginationArgsType) {
    args.validate()
    const where: ObjectQuery<any> = {}
    const orderByField = args.orderBy()[0] || 'id'
    let decoded = ''
    if (args.after || args.before) {
      try {
        decoded = Buffer.from(
          (args.after || args.before) as string,
          'base64',
        ).toString('utf8')
      } catch (e) {
        throw new GraphQLError('Invalid cursor')
      }
    }
    let orderDirection = args.orderDir()[0] || 'ASC'
    if (
      (args.after && orderDirection === 'ASC') ||
      (args.before && orderDirection === 'DESC')
    ) {
      where[orderByField] = { $gte: decoded }
    } else if (args.after || args.before) {
      where[orderByField] = { $lte: decoded }
    }
    if (args.before || args.last) {
      // Need to flip order direction, then reverse the results
      orderDirection =
        orderDirection === OrderDirection.DESC
          ? OrderDirection.ASC
          : OrderDirection.DESC
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
    return options
  }

  async entityToPaginated<
    T extends BaseEntity,
    U extends BaseModel<T>,
    S extends PaginatedType<U, T>,
  >(
    cursor: Cursor<T, '*'>,
    options: PaginationArgsType,
    model: new () => U,
    PageModel: new () => S,
  ): Promise<PaginatedType<U, T>> {
    const page: S = new PageModel()
    const nodes: U[] = []
    const edges: EdgeType<U, T>[] = []
    const flip = options.before || options.last
    cursor.items = flip ? cursor.items.reverse() : cursor.items
    for (const item of cursor.items) {
      const cls = await this.entityToModel(item, model)
      nodes.push(cls)
      const cid = Buffer.from(
        (item as any)[options.orderBy()[0] || 'id'],
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
    const [items, totalCount] = await em.findAndCount(
      entity,
      opts.where,
      opts.options,
    )
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
    cursor: { items: EntityDTO<T>[]; count: number },
    PageModel: new () => S,
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
        const inst: object = plainToInstance((obj as any)._type, obj)
        // Transform special cases like translation objects
        _.each(obj, (value, key) => {
          if (key.endsWith('_tr')) {
            ;(inst as any)[key] = value
          }
        })
        if ((inst as any).transform) {
          ;(inst as any).transform(obj)
        }
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

export function transformUnion(
  field: string,
): (params: TransformFnParams) => object {
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
    const instance = plainToInstance(constr, params.value)
    // Transform special cases like translation objects
    _.each(params.value, (value, key) => {
      if (key.endsWith('_tr')) {
        ;(instance as any)[key] = value
      }
    })
    if ((instance as any).transform) {
      ;(instance as any).transform(obj)
    }
    return instance
  }
}
