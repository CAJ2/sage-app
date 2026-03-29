import { BaseEntity, EntityManager, ref, wrap } from '@mikro-orm/postgresql'
import type {
  Collection,
  EntityDTO,
  EntityMetadata,
  EntityName,
  FilterQuery,
  FindOneOptions,
  Loaded,
  Reference,
  RequiredEntityData,
} from '@mikro-orm/postgresql'
import { Injectable, NotFoundException } from '@nestjs/common'
import _ from 'lodash'

import { AuthUserService } from '@src/auth/authuser.service'
import {
  CreateChangeInput,
  DeleteInput,
  IChangeInputWithLang,
  isUsingChange,
} from '@src/changes/change-ext.model'
import { Change, ChangeEdits, ChangeStatus } from '@src/changes/change.entity'
import { MergeInput, UpdateChangeInput } from '@src/changes/change.model'
import { Source } from '@src/changes/source.entity'
import { BadRequestErr, NotFoundErr } from '@src/common/exceptions'
import { MetaService } from '@src/common/meta.service'
import { User } from '@src/users/users.entity'

export interface IEntityService {
  findOneByID<T extends BaseEntity>(id: string): Promise<T | null>
}

type PivotInput = { id: string; [key: string]: any } | { id: string; [key: string]: any }[]

@Injectable()
export class EditService {
  constructor(
    private readonly em: EntityManager,
    private readonly authUser: AuthUserService,
    private readonly metaService: MetaService,
  ) {}

  async findOne(id: string) {
    const change = await this.em.findOne(Change, { id }, { populate: ['user', 'sources', 'edits'] })

    if (!change) {
      throw new NotFoundException(`Change with ID "${id}" not found`)
    }

    return change
  }

  async findOneOrCreate(id?: string, input?: CreateChangeInput, userID?: string) {
    if (!id && !input) {
      throw NotFoundErr('Must provide either a Change ID or Change input')
    }
    if (id && input) {
      throw BadRequestErr('Cannot provide both a Change ID and Change input')
    }
    if (!userID) {
      throw BadRequestErr('Must provide a user ID')
    }

    if (id) {
      const change = await this.em.findOne(
        Change,
        { id, user: userID },
        { populate: ['edits', 'user', 'sources'] },
      )
      if (!change) {
        throw NotFoundErr(`Change with ID "${id}" not found`)
      }
      return change
    }

    const newChange = await this.create(input!, userID)
    return newChange
  }

  async findEntityEdits<T extends BaseEntity>(
    changeID: string,
    entity: EntityName<T>,
  ): Promise<ChangeEdits[]> {
    const change = await this.em.findOne(Change, { id: changeID }, { populate: ['edits'] })
    if (!change) {
      throw NotFoundErr(`Change with ID "${changeID}" not found`)
    }
    return change.edits.filter((edit) => edit.entityName === entity.toString())
  }

  async create(input: CreateChangeInput, userID: string) {
    const change = new Change()
    change.title = input.title
    change.description = input.description
    change.user = ref(User, userID)
    change.status = input.status || ChangeStatus.DRAFT

    if (input.sources && input.sources.length > 0) {
      const sources = await this.em.find(
        Source,
        {
          id: { $in: input.sources },
        },
        { fields: ['id'] },
      )
      for (const source of sources) {
        change.sources.add(ref(source.id))
      }
    }

    await this.em.persist(change).flush()
    return change
  }

  async update(input: UpdateChangeInput) {
    const change = await this.findOne(input.id)
    if (!this.authUser.sameUserOrAdmin(change.user.id)) {
      throw BadRequestErr('You can only update your own changes')
    }

    if (input.title) change.title = input.title
    if (input.description) change.description = input.description
    if (input.status) change.status = input.status
    if (input.sources) {
      const removed = change.sources.filter((source) => !input.sources!.includes(source.id))
      for (const source of removed) {
        change.sources.remove(source)
      }
      for (const sourceID of input.sources) {
        if (!change.sources.contains(ref(sourceID))) {
          const source = await this.em.findOne(Source, { id: sourceID })
          if (source) {
            change.sources.add(source)
          }
        }
      }
    }

    await this.em.persist(change).flush()
    return change
  }

  async setOrAddCollection<T extends object & { id: string }, U extends { id: string }>(
    collection: Collection<T>,
    entity: EntityName<T>,
    toSet?: U | U[],
    toAdd?: U | U[],
  ): Promise<Collection<T>> {
    if (toSet) {
      if (Array.isArray(toSet)) {
        const foundItems = await this.em.find(
          entity,
          { id: { $in: toSet.map((item) => item.id) } } as any,
          { populate: false },
        )
        if (foundItems.length !== toSet.length) {
          const foundIds = foundItems.map((item) => item.id)
          throw NotFoundErr(
            `No ${entity} found for IDs: ${toSet
              .map((item) => item.id)
              .filter((id) => !_.includes(foundIds, id))
              .join(', ')}`,
          )
        }
        collection.set(foundItems)
      } else {
        const foundItem = await this.em.findOne(entity, { id: toSet.id } as any, {
          populate: false,
        })
        if (!foundItem) {
          throw NotFoundErr(`No ${entity} found for ID: ${toSet.id}`)
        }
        collection.set([foundItem])
      }
    }
    if (toAdd) {
      if (Array.isArray(toAdd)) {
        const foundItems = await this.em.find(
          entity,
          { id: { $in: toAdd.map((item) => item.id) } } as any,
          { populate: false },
        )
        if (foundItems.length !== toAdd.length) {
          const foundIds = foundItems.map((item) => item.id)
          throw NotFoundErr(
            `No ${entity} found for IDs: ${toAdd
              .map((item) => item.id)
              .filter((id) => !_.includes(foundIds, id))
              .join(', ')}`,
          )
        }
        collection.add(foundItems)
      } else {
        const foundItem = await this.em.findOne(entity, { id: toAdd.id } as any, {
          populate: false,
        })
        if (!foundItem) {
          throw NotFoundErr(`No ${entity} found for ID: ${toAdd.id}`)
        }
        collection.add(foundItem)
      }
    }
    return collection
  }

  async removeFromCollection<T extends object & { id: string }>(
    collection: Collection<T>,
    entity: EntityName<T>,
    toRemove?: string | string[],
  ): Promise<Collection<T>> {
    if (toRemove) {
      if (Array.isArray(toRemove)) {
        const foundItems = await this.em.find(entity, { id: { $in: toRemove } } as any, {
          populate: false,
        })
        if (foundItems.length !== toRemove.length) {
          const foundIds = foundItems.map((item) => item.id)
          throw NotFoundErr(
            `No ${entity} found for IDs: ${toRemove
              .filter((id) => !_.includes(foundIds, id))
              .join(', ')}`,
          )
        }
        collection.remove(foundItems)
      } else {
        const foundItem = await this.em.findOne(entity, { id: toRemove } as any, {
          populate: false,
        })
        if (!foundItem) {
          throw NotFoundErr(`No ${entity} found for ID: ${toRemove}`)
        }
        collection.remove(foundItem)
      }
    }
    return collection
  }

  async setOrAddPivot<U extends BaseEntity & { id: string }, T extends object>(
    id: string,
    change: Change | undefined,
    collection: Collection<T>,
    collEntity: EntityName<U>,
    pivotEntity: EntityName<T>,
    toSet?: PivotInput,
    toAdd?: PivotInput,
  ): Promise<Collection<T>> {
    const pivotMeta = this.em.getMetadata().get(pivotEntity)
    const pivotEntityStr = pivotMeta.name
    const collEntityStr = this.em.getMetadata().get(collEntity).name
    if (!pivotEntityStr || !collEntityStr) {
      throw new Error(`Bad pivot entities: ${pivotEntityStr}, ${collEntityStr}`)
    }
    let collField: string | undefined
    let relField: string | undefined
    let relEntity: EntityName<U> | undefined
    for (const prop of pivotMeta.primaryKeys) {
      const target = pivotMeta.properties[prop].targetMeta
      if (!target) {
        throw new Error(`No target meta found for property: ${prop}`)
      }
      if (target.name !== collEntityStr) {
        relField = prop
        relEntity = target.className as EntityName<U>
      } else {
        collField = prop
      }
    }
    if (!collField || !relField || !relEntity) {
      throw new Error(
        `Could not determine collection field or relation field for pivot entity: ${pivotEntityStr}`,
      )
    }
    if (toSet) {
      if (Array.isArray(toSet) && toSet.length > 0) {
        if (change) {
          for (const item of toSet) {
            await this.findRefWithChange(change, relEntity, { id: item.id } as any)
          }
        } else {
          const foundItems = await this.em.find(
            relEntity,
            { id: { $in: toSet.map((item) => item.id) } } as any,
            { populate: false },
          )
          if (foundItems.length !== toSet.length) {
            const foundIds = foundItems.map((item) => item.id)
            throw NotFoundErr(
              `No ${relEntity} found for IDs: ${toSet
                .map((item) => item.id)
                .filter((id) => !_.includes(foundIds, id))
                .join(', ')}`,
            )
          }
        }
        const toSetEntities = toSet.map((item) => {
          const newEntity = this.em.create(
            pivotEntity,
            {
              [collField]: id,
              [relField]: item.id,
              ..._.omit(item, 'id'),
            } as any,
            {
              managed: !!change,
              persist: !change,
            },
          )
          if (!change) {
            this.em.persist(newEntity)
          }
          return newEntity
        })
        if (!collection.isInitialized()) {
          await collection.init({ ref: true })
        }
        const existing = collection.getItems()
        for (const pivotItem of existing) {
          collection.removeWithoutPropagation(pivotItem)
          if (!change) {
            this.em.remove(pivotItem)
          }
        }
        collection.add(toSetEntities)
      } else if (!Array.isArray(toSet) && toSet.id) {
        if (change) {
          await this.findRefWithChange(change, relEntity, { id: toSet.id } as any)
        } else {
          const foundItem = await this.em.findOne(relEntity, { id: toSet.id } as any, {
            populate: false,
          })
          if (!foundItem) {
            throw NotFoundErr(`No ${relEntity} found for ID: ${toSet.id}`)
          }
        }
        const toSetEntity = this.em.create(
          pivotEntity,
          {
            [collField]: id,
            [relField]: toSet.id,
            ..._.omit(toSet, 'id'),
          } as any,
          {
            managed: !!change,
            persist: !change,
          },
        )
        if (!change) {
          this.em.persist(toSetEntity)
        }
        if (!collection.isInitialized()) {
          await collection.init({ ref: true })
        }
        const existing = collection.getItems()
        for (const pivotItem of existing) {
          collection.removeWithoutPropagation(pivotItem)
          if (!change) {
            this.em.remove(pivotItem)
          }
        }
        collection.add([toSetEntity])
      }
    }
    if (toAdd) {
      if (Array.isArray(toAdd) && toAdd.length > 0) {
        if (change) {
          for (const item of toAdd) {
            await this.findRefWithChange(change, relEntity, { id: item.id } as any)
          }
        } else {
          const foundItems = await this.em.find(
            relEntity,
            { id: { $in: toAdd.map((item) => item.id) } } as any,
            { populate: false },
          )
          if (foundItems.length !== toAdd.length) {
            const foundIds = foundItems.map((item) => item.id)
            throw NotFoundErr(
              `No ${relEntity} found for IDs: ${toAdd
                .map((item) => item.id)
                .filter((id) => !_.includes(foundIds, id))
                .join(', ')}`,
            )
          }
        }
        const toAddEntities: T[] = []
        for (const item of toAdd) {
          const existing = id
            ? !change
              ? await this.em.findOne(
                  pivotEntity,
                  { [collField]: id, [relField]: item.id } as any,
                  {
                    populate: false,
                  },
                )
              : null
            : null
          if (existing) {
            const extraFields = _.omit(item, 'id')
            if (Object.keys(extraFields).length > 0) {
              this.em.assign(existing, extraFields as any)
            }
            continue
          }
          const newEntity = this.em.create(
            pivotEntity,
            {
              [collField]: id,
              [relField]: item.id,
              ..._.omit(item, 'id'),
            } as any,
            {
              managed: !!change,
              persist: !change,
            },
          )
          if (!change) {
            this.em.persist(newEntity)
          }
          toAddEntities.push(newEntity)
        }
        if (toAddEntities.length > 0) {
          collection.add(toAddEntities)
        }
      } else if (!Array.isArray(toAdd) && toAdd.id) {
        if (change) {
          await this.findRefWithChange(change, relEntity, { id: toAdd.id } as any)
        } else {
          const foundItem = await this.em.findOne(relEntity, { id: toAdd.id } as any, {
            populate: false,
          })
          if (!foundItem) {
            throw NotFoundErr(`No ${relEntity} found for ID: ${toAdd.id}`)
          }
        }
        const existing = id
          ? !change
            ? await this.em.findOne(pivotEntity, { [collField]: id, [relField]: toAdd.id } as any, {
                populate: false,
              })
            : null
          : null
        if (existing) {
          const extraFields = _.omit(toAdd, 'id')
          if (Object.keys(extraFields).length > 0) {
            this.em.assign(existing, extraFields as any)
          }
        } else {
          const toAddEntity = this.em.create(
            pivotEntity,
            {
              [collField]: id,
              [relField]: toAdd.id,
              ..._.omit(toAdd, 'id'),
            } as any,
            {
              managed: !!change,
              persist: !change,
            },
          )
          if (!change) {
            this.em.persist(toAddEntity)
          }
          collection.add([toAddEntity])
        }
      }
    }
    return collection
  }

  async removeFromPivot<U extends BaseEntity & { id: string }, T extends object>(
    change: Change | undefined,
    collection: Collection<T>,
    collEntity: EntityName<U>,
    pivotEntity: EntityName<T>,
    toRemove?: string | string[],
  ): Promise<Collection<T>> {
    const pivotMeta = this.em.getMetadata().get(pivotEntity)
    const pivotEntityStr = pivotMeta.name
    const collEntityStr = this.em.getMetadata().get(collEntity).name
    if (!pivotEntityStr || !collEntityStr) {
      throw new Error(`Bad pivot entities: ${pivotEntityStr}, ${collEntityStr}`)
    }
    let collField: string | undefined
    let relField: string | undefined
    let relEntity: EntityName<U> | undefined
    for (const prop of pivotMeta.primaryKeys) {
      const target = pivotMeta.properties[prop].targetMeta
      if (!target) {
        throw new Error(`No target meta found for property: ${prop}`)
      }
      if (target.name !== collEntityStr) {
        relField = prop
        relEntity = target.className as EntityName<U>
      } else {
        collField = prop
      }
    }
    if (!collField || !relField || !relEntity) {
      throw new Error(
        `Could not determine collection field or relation field for pivot entity: ${pivotEntityStr}`,
      )
    }
    if (toRemove) {
      if (Array.isArray(toRemove)) {
        if (!collection.isInitialized()) {
          await collection.init({ ref: true })
        }
        if (!change) {
          const foundItems = await this.em.find(relEntity, { id: { $in: toRemove } } as any, {
            populate: false,
          })
          if (foundItems.length !== toRemove.length) {
            const foundIds = foundItems.map((item) => item.id)
            throw NotFoundErr(
              `No ${relEntity} found for IDs: ${toRemove
                .filter((id) => !_.includes(foundIds, id))
                .join(', ')}`,
            )
          }
        }
        const pivotItems = collection.getItems().filter((item: any) => {
          const itemRelId = item[relField]?.id || item[relField]
          return toRemove.includes(itemRelId)
        })
        for (const pivotItem of pivotItems) {
          collection.removeWithoutPropagation(pivotItem)
          if (!change) {
            this.em.remove(pivotItem)
          }
        }
      } else {
        if (!change) {
          const foundItem = await this.em.findOne(relEntity, { id: toRemove } as any, {
            populate: false,
          })
          if (!foundItem) {
            throw NotFoundErr(`No ${relEntity} found for ID: ${toRemove}`)
          }
        }
        if (!collection.isInitialized()) {
          await collection.init({ ref: true })
        }
        // Find the actual pivot entity to remove
        const pivotItem = collection.getItems().find((item: any) => {
          const itemRelId = item[relField]?.id || item[relField]
          return itemRelId === toRemove
        })
        if (pivotItem) {
          collection.removeWithoutPropagation(pivotItem)
          if (!change) {
            this.em.remove(pivotItem)
          }
        }
      }
    }
    return collection
  }

  async findRefWithChange<T extends BaseEntity>(
    change: Change,
    model: EntityName<T>,
    where: FilterQuery<T> & { id: string },
    options?: FindOneOptions<T, never, '*', never>,
  ): Promise<{ id: string } & Reference<Loaded<T>>> {
    // First check if it exists in the change
    const entityName = this.em.getMetadata().get(model).name
    const edit = change.edits.find((e) => {
      if (e.entityName === entityName && e.entityID === where.id) {
        return true
      }
      return false
    })
    if (edit) {
      return this.em.getReference(model, edit.entityID as any) as any
    }
    // If not, check if it exists in the database
    const entity = await this.em.findOne<T>(model, where as FilterQuery<T>, options)
    if (!entity) {
      throw NotFoundErr(`${entityName} with ID "${where.id}" not found`)
    }
    // TODO: Type this correctly?
    return entity.toReference() as unknown as { id: string } & Reference<Loaded<T>>
  }

  async findOneWithChangeInput<T extends BaseEntity, H extends string>(
    input: IChangeInputWithLang,
    userID: string,
    model: EntityName<T>,
    where: FilterQuery<T> & { id: string },
    options?: FindOneOptions<T, H, '*', never>,
  ): Promise<{ entity: Loaded<T, never, '*', never>; change?: Change }> {
    if (!input.changeID && !input.change) {
      if (!this.authUser.admin()) {
        throw BadRequestErr('Admin privileges are required to directly edit')
      }
      const entity = await this.em.findOne<T, H>(model, where as FilterQuery<T>, options)
      return { entity: entity as Loaded<T> }
    }
    const change = await this.findOneOrCreate(input.changeID, input.change, userID)
    const meta = this.em.getMetadata().get(model)
    // First check if it exists in the change
    const edit = change.edits.find((e) => {
      if (e.entityName === meta.name && e.entityID === where.id) {
        return true
      }
      return false
    })
    if (edit) {
      if (edit.changes || edit.original) {
        const entity = this.em.create(
          model,
          (edit.changes || edit.original) as RequiredEntityData<T>,
          {
            managed: true,
            persist: false,
          },
        )
        return { entity: entity as Loaded<T>, change }
      } else {
        throw NotFoundErr(`Edit for entity "${meta.name}" with ID "${where.id}" not found`)
      }
    }
    // If not, check if it exists in the database
    if (!options) {
      options = { disableIdentityMap: isUsingChange(input) }
    }
    const entity = await this.em.findOne<T, H>(model, where as FilterQuery<T>, options)
    if (!entity) {
      throw NotFoundErr(`${meta.name} with ID "${where.id}" not found`)
    }
    return { entity: entity as Loaded<T>, change }
  }

  async deleteOneWithChange<T extends BaseEntity & { id: string }>(
    input: DeleteInput,
    model: EntityName<T>,
  ) {
    const userID = this.authUser.userID()
    if (!userID) {
      throw BadRequestErr('User ID is required for delete operation')
    }
    const change = await this.findOneOrCreate(input.changeID, input.change, userID)
    if (!this.authUser.sameUserOrAdmin(change.user.id)) {
      throw BadRequestErr('You can only delete your own changes')
    }
    const meta = this.em.getMetadata().get(model)
    if (!meta.name) {
      throw NotFoundErr(`Entity "${model}" not found in metadata`)
    }
    // First check if it exists in the change
    const edit = change.edits.find((e) => {
      if (e.entityName === meta.name && e.entityID === input.id) {
        return true
      }
      return false
    })
    if (edit) {
      if (!edit.original) {
        // The edit is currently a create, so discard the edit entirely
        change.edits.remove(edit)
      } else if (edit.changes) {
        edit.changes = undefined // Turn the edit into a delete
      }
      await this.em.persist(change).flush()
      return
    }
    // If not, check if it exists in the database
    const options = { disableIdentityMap: isUsingChange(input) }
    const entity = await this.em.findOne<T>(model, { id: input.id } as FilterQuery<T>, options)
    if (!entity) {
      throw NotFoundErr(`${meta.name} with ID "${input.id}" not found`)
    }
    const newEdit = new ChangeEdits()
    newEdit.entityName = meta.name
    newEdit.entityID = input.id
    newEdit.userID = userID
    newEdit.original = this.entityToChangePOJO(meta.name, entity as BaseEntity & { id: string })
    change.edits.add(newEdit)
    await this.em.persist(change).flush()
    return { id: input.id }
  }

  async beginUpdateEntityEdit(change: Change, entity: BaseEntity & { id: string }) {
    if (!this.authUser.sameUserOrAdmin(change.user.id)) {
      throw BadRequestErr('You can only update edits for your own changes')
    }
    let edit = change.edits.find(
      (e) => e.entityName === entity.constructor.name && e.entityID === entity.id,
    )
    if (!edit) {
      edit = new ChangeEdits()
      edit.entityName = entity.constructor.name
      edit.entityID = entity.id
      edit.userID = this.authUser.userID()!
      edit.original = this.entityToChangePOJO(entity.constructor.name, entity)
      change.edits.add(edit)
    }
  }

  async updateEntityEdit(change: Change, entity: BaseEntity & { id: string }) {
    const edit = change.edits.find(
      (e) => e.entityName === entity.constructor.name && e.entityID === entity.id,
    )
    if (!edit) {
      throw NotFoundErr(
        `Edit for entity "${entity.constructor.name}" with ID "${entity.id}" not found`,
      )
    }
    edit.changes = this.entityToChangePOJO(entity.constructor.name, entity)
  }

  async createEntityEdit(change: Change, entity: BaseEntity & { id: string }) {
    if (!this.authUser.sameUserOrAdmin(change.user.id)) {
      throw BadRequestErr('You can only create edits for your own changes')
    }
    const entityName = entity.constructor.name
    if (!entityName) {
      throw BadRequestErr('Entity name is required for edit creation')
    }
    const edit = new ChangeEdits()
    edit.entityName = entityName
    edit.entityID = entity.id
    edit.userID = this.authUser.userID()!
    edit.changes = this.entityToChangePOJO(entityName, entity)
    change.edits.add(edit)
  }

  private applyEntityCreate(entityName: string, pojo: Record<string, any>): void {
    const meta = this.em.getMetadata().get(entityName)
    const { flattenArrayRefs, flattenToId } = this.categorizePOJORelations(meta)
    const pivotFieldNames = new Set(flattenArrayRefs.map((r) => r.name))
    const scalarData: Record<string, any> = {}
    for (const [key, val] of Object.entries(pojo)) {
      if (pivotFieldNames.has(key)) continue
      scalarData[key] = flattenToId.includes(key) ? this.toRelationReference(meta, key, val) : val
    }
    this.em.create(meta.class, scalarData as any, { persist: true })
    for (const { name, targetMeta } of flattenArrayRefs) {
      if (!(name in pojo)) continue
      const items: any[] = Array.isArray(pojo[name]) ? pojo[name] : []
      for (const itemData of items) {
        const restored = this.unflattenNestedRefs(itemData, targetMeta)
        this.em.create(targetMeta.class, restored, { persist: true })
      }
    }
  }

  private async applyEntityUpdate(
    entityName: string,
    entityID: string,
    pojo: Record<string, any>,
  ): Promise<BaseEntity> {
    const meta = this.em.getMetadata().get(entityName)
    const { flattenArrayRefs, flattenToId } = this.categorizePOJORelations(meta)
    const populateFields = flattenArrayRefs.map((r) => r.name)
    const entity = populateFields.length
      ? await this.em.findOne(
          entityName,
          { id: entityID } as any,
          {
            populate: populateFields,
          } as any,
        )
      : await this.em.findOne(entityName, { id: entityID } as any)
    if (!entity) {
      throw NotFoundErr(`${entityName} with ID "${entityID}" not found`)
    }

    for (const { name, targetMeta } of flattenArrayRefs) {
      if (!(name in pojo)) continue
      const collection = (entity as any)[name] as Collection<any>
      if (!collection.isInitialized()) {
        await collection.init({ ref: true })
      }
      const existing = collection.getItems()
      const existingByKey = new Map<string, any>()
      for (const item of existing) {
        existingByKey.set(
          this.getPrimaryKeySignature(item as Record<string, any>, targetMeta),
          item,
        )
      }

      const newItems: any[] = Array.isArray(pojo[name]) ? pojo[name] : []
      const incomingByKey = new Map<string, Record<string, any>>()
      for (const itemData of newItems) {
        const restored = this.unflattenNestedRefs(itemData, targetMeta)
        incomingByKey.set(this.getPrimaryKeySignature(restored, targetMeta), restored)
      }

      for (const [key, existingItem] of existingByKey.entries()) {
        const incomingItem = incomingByKey.get(key)
        if (!incomingItem) {
          this.em.remove(existingItem)
          continue
        }
        this.em.assign(existingItem, incomingItem as any)
        incomingByKey.delete(key)
      }

      for (const incomingItem of incomingByKey.values()) {
        const pivotEntity = this.em.create(targetMeta.class, incomingItem)
        this.em.persist(pivotEntity)
      }
    }

    const pivotFieldNames = new Set(flattenArrayRefs.map((r) => r.name))
    const scalarData: Record<string, any> = {}
    for (const [key, val] of Object.entries(pojo)) {
      if (pivotFieldNames.has(key)) continue
      scalarData[key] = flattenToId.includes(key) ? this.toRelationReference(meta, key, val) : val
    }
    this.em.assign(entity as any, scalarData)
    return entity as BaseEntity
  }

  async checkMerge(change: Change, mergeInput: MergeInput) {
    if (change.status === ChangeStatus.APPROVED && mergeInput.apply) {
      await this.merge(change)
    }
  }

  async mergeID(changeID: string) {
    const change = await this.em.findOne(Change, { id: changeID }, { populate: ['edits'] })
    if (!change) {
      throw NotFoundErr(`Change with ID "${changeID}" not found`)
    }
    if (change.status !== ChangeStatus.APPROVED) {
      throw BadRequestErr(`Change with ID "${changeID}" is not approved and cannot be merged`)
    }
    return this.merge(change)
  }

  async merge(change: Change) {
    await this.em.begin()
    try {
      const historyItems: Array<{
        name: string
        userID: string
        original: EntityDTO<BaseEntity> | undefined
        changes: EntityDTO<BaseEntity> | undefined
      }> = []

      const createEdits = change.edits.filter((e) => !!e.entityID && !e.original && !!e.changes)
      const otherEdits = change.edits.filter((e) => !!e.entityID && (!!e.original || !e.changes))

      const createByID = new Map(createEdits.map((edit) => [edit.entityID!, edit]))
      const createIDs = new Set(createByID.keys())
      const orderedCreates: ChangeEdits[] = []
      const visitedCreates = new Set<string>()
      const visitingCreates = new Set<string>()

      const visitCreate = (edit: ChangeEdits) => {
        const id = edit.entityID!
        if (visitedCreates.has(id)) return
        if (visitingCreates.has(id)) return
        visitingCreates.add(id)
        const deps = this.getCreateDependencies(
          edit.entityName,
          edit.changes as Record<string, any>,
          createIDs,
          id,
        )
        for (const depID of deps) {
          const depEdit = createByID.get(depID)
          if (depEdit) {
            visitCreate(depEdit)
          }
        }
        visitingCreates.delete(id)
        visitedCreates.add(id)
        orderedCreates.push(edit)
      }

      for (const edit of createEdits) {
        visitCreate(edit)
      }

      for (const edit of orderedCreates) {
        this.applyEntityCreate(edit.entityName, edit.changes as Record<string, any>)
        historyItems.push({
          name: edit.entityName,
          userID: change.user.id,
          original: edit.original,
          changes: edit.changes,
        })
      }

      for (const edit of otherEdits) {
        const entity = await this.em.findOne(edit.entityName, { id: edit.entityID })
        if (!entity && edit.original) {
          throw NotFoundErr(`Entity with ID "${edit.entityID}" not found in "${edit.entityName}"`)
        }
        if (entity && edit.original && !edit.changes) {
          this.em.remove(entity)
        } else if (entity && edit.original && edit.changes) {
          await this.applyEntityUpdate(
            edit.entityName,
            edit.entityID!,
            edit.changes as Record<string, any>,
          )
        } else {
          throw BadRequestErr(`Edit for entity "${edit.entityName}" is invalid`)
        }
        historyItems.push({
          name: edit.entityName,
          userID: change.user.id,
          original: edit.original,
          changes: edit.changes,
        })
      }

      await this.em.flush()

      for (const { name, userID, original, changes } of historyItems) {
        this.createHistory<BaseEntity>(name, userID, original, changes)
      }

      change.status = ChangeStatus.MERGED
      await this.em.commit()
      return { change }
    } catch (error) {
      await this.em.rollback()
      change.status = ChangeStatus.REJECTED
      await this.em.persist(change).flush()
      throw error
    }
  }

  async createHistory<T>(
    name: EntityName<T>,
    userID: string,
    original: EntityDTO<T> | undefined,
    changes: EntityDTO<T> | undefined,
  ) {
    const historyMeta = this.em.getMetadata().get(name + 'History')
    if (!historyMeta) {
      return
    }
    if (original && changes && _.isEqual(original, changes)) {
      return
    }
    const id = (changes as any).id || (original as any).id
    const pk0 = historyMeta.primaryKeys[0]
    const parentEntityClass = historyMeta.properties[pk0].type
    this.em.create(historyMeta.className, {
      [pk0]: ref(this.em.getMetadata().get(parentEntityClass).class, id),
      datetime: new Date(),
      user: ref(User, userID),
      original,
      changes,
    })
  }

  entityToChangePOJO(
    entityName: EntityName<any>,
    entity: BaseEntity & { id: string },
  ): EntityDTO<BaseEntity> {
    const meta = this.em.getMetadata().get(entityName)
    if (!meta) {
      throw NotFoundErr(`Entity "${entityName}" not found in metadata`)
    }
    const { flattenArrayRefs, flattenToId, changeOmit } = this.categorizePOJORelations(meta)

    const pojo: any = _.cloneDeep(entity.toPOJO())

    flattenToId.forEach((name) => {
      if (pojo[name] && _.isObject(pojo[name]) && _.has(pojo[name], 'id')) {
        pojo[name] = (pojo[name] as any).id
      }
    })

    flattenArrayRefs.forEach(({ name }) => {
      if (!pojo[name]) return
      if (Array.isArray(pojo[name])) {
        pojo[name] = pojo[name].map((item: any) => (item ? this.flattenNestedRefs(item) : item))
      } else if (_.isObject(pojo[name])) {
        pojo[name] = this.flattenNestedRefs(pojo[name] as Record<string, any>)
      }
    })

    return _.omit(pojo, [...changeOmit, 'createdAt', 'updatedAt'])
  }

  private categorizePOJORelations(meta: EntityMetadata): {
    flattenArrayRefs: Array<{ name: string; targetMeta: EntityMetadata }>
    flattenToId: string[]
    changeOmit: string[]
  } {
    const pivotEntityNames = new Set<string>()
    meta.relations.forEach((rel) => {
      if (rel.kind === 'm:n' && rel.pivotEntity && !rel.mappedBy) {
        pivotEntityNames.add(rel.pivotEntity as string)
      }
    })

    const flattenArrayRefs: Array<{ name: string; targetMeta: EntityMetadata }> = []
    const flattenToId: string[] = []
    const changeOmit: string[] = []

    meta.relations.forEach((rel) => {
      if (rel.name.startsWith('history')) {
        changeOmit.push(rel.name)
        return
      }
      switch (rel.kind) {
        case 'm:n':
          changeOmit.push(rel.name)
          break
        case '1:m': {
          const targetName = rel.targetMeta?.className
          const isPivot = !!targetName && pivotEntityNames.has(targetName)
          const isTree = !!rel.targetMeta && this.isTreeEntity(rel.targetMeta)
          if ((isPivot || isTree) && rel.targetMeta) {
            flattenArrayRefs.push({ name: rel.name, targetMeta: rel.targetMeta })
          } else {
            changeOmit.push(rel.name)
          }
          break
        }
        case 'm:1':
          if (rel.primary) {
            changeOmit.push(rel.name)
          } else {
            flattenToId.push(rel.name)
          }
          break
        case '1:1':
          flattenToId.push(rel.name)
          break
      }
    })

    return {
      flattenArrayRefs,
      flattenToId,
      changeOmit,
    }
  }

  /** Returns true if every primary M:1 on this entity points to the same entity type
   *  (closure table / edge table pattern: CategoryTree, CategoryEdge, etc.) */
  private isTreeEntity(meta: EntityMetadata): boolean {
    const primaryM1s = meta.relations.filter((r) => r.kind === 'm:1' && r.primary)
    if (primaryM1s.length < 2) return false
    const targets = new Set(primaryM1s.map((r) => r.targetMeta?.className))
    return targets.size === 1
  }

  /** Shallow-clones an object, replacing any value of the form {id: '...'} with just the ID string.
   *  Handles M:1 refs inside pivot/tree entity rows (e.g. VariantsOrgs.region). */
  private flattenNestedRefs(item: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {}
    for (const [key, val] of Object.entries(item)) {
      result[key] =
        val && _.isObject(val) && !Array.isArray(val) && _.has(val, 'id') ? (val as any).id : val
    }
    return result
  }

  /** Reverse of flattenNestedRefs: shallow-clones an object, converting any string value back to
   *  {id: value} when the field name corresponds to a relation in the target entity's metadata. */
  private unflattenNestedRefs(
    item: Record<string, any>,
    targetMeta: EntityMetadata,
  ): Record<string, any> {
    const relFields = new Set(targetMeta.relations.map((r) => r.name))
    const result: Record<string, any> = {}
    for (const [key, val] of Object.entries(item)) {
      result[key] = typeof val === 'string' && relFields.has(key) ? { id: val } : val
    }
    return result
  }

  private getPrimaryKeySignature(item: Record<string, any>, targetMeta: EntityMetadata): string {
    return targetMeta.primaryKeys
      .map((key) => {
        const val = item[key]
        if (val && _.isObject(val) && !Array.isArray(val) && _.has(val, 'id')) {
          return String((val as any).id)
        }
        return String(val)
      })
      .join('::')
  }

  private toRelationReference(meta: EntityMetadata, fieldName: string, value: unknown): unknown {
    if (typeof value !== 'string') {
      return value
    }
    const relation = meta.relations.find((rel) => rel.name === fieldName)
    if (!relation?.targetMeta) {
      return { id: value }
    }
    return this.em.getReference(relation.targetMeta.class, value as any)
  }

  private getCreateDependencies(
    entityName: string,
    pojo: Record<string, any>,
    createIDs: Set<string>,
    selfID?: string,
  ): string[] {
    const meta = this.em.getMetadata().get(entityName)
    const { flattenArrayRefs, flattenToId } = this.categorizePOJORelations(meta)
    const deps = new Set<string>()

    for (const field of flattenToId) {
      const val = pojo[field]
      if (typeof val === 'string' && createIDs.has(val)) {
        deps.add(val)
      }
    }

    for (const { name, targetMeta } of flattenArrayRefs) {
      const rows = Array.isArray(pojo[name]) ? pojo[name] : pojo[name] ? [pojo[name]] : []
      const relationFields = targetMeta.relations
        .filter((rel) => rel.kind === 'm:1' || rel.kind === '1:1')
        .map((rel) => rel.name)
      for (const row of rows) {
        if (!row || !_.isObject(row)) continue
        for (const relName of relationFields) {
          const relVal = (row as any)[relName]
          if (typeof relVal === 'string' && createIDs.has(relVal)) {
            deps.add(relVal)
          }
        }
      }
    }

    if (selfID) {
      deps.delete(selfID)
    }
    return [...deps]
  }

  /**
   * Reverse of entityToChangePOJO: takes a stored POJO from a ChangeEdit, restores the
   * flattened relation fields to {id: string} ref objects, and returns the initialized entity.
   *
   * The returned entity is suitable for passing directly to ZService.entityToModel.
   */
  async changePOJOToEntity(
    entityName: EntityName<any>,
    pojo: Record<string, any>,
  ): Promise<BaseEntity> {
    const meta = this.em.getMetadata().get(entityName)
    if (!meta) {
      throw NotFoundErr(`Entity "${entityName}" not found in metadata`)
    }
    const { flattenArrayRefs, flattenToId } = this.categorizePOJORelations(meta)

    // Build restored POJO from the plain JSON (avoid cloneDeep on MikroORM entities)
    const restored: Record<string, any> = { ...pojo }

    // Restore m:1/1:1 string IDs → {id: string}
    flattenToId.forEach((name) => {
      if (typeof restored[name] === 'string') {
        restored[name] = { id: restored[name] }
      }
    })

    // Restore 1:M array items: string relation values → {id: string}
    flattenArrayRefs.forEach(({ name, targetMeta }) => {
      if (!restored[name]) return
      if (Array.isArray(restored[name])) {
        restored[name] = restored[name].map((item: any) =>
          item ? this.unflattenNestedRefs(item, targetMeta) : item,
        )
      } else if (_.isObject(restored[name])) {
        restored[name] = this.unflattenNestedRefs(restored[name] as Record<string, any>, targetMeta)
      }
    })

    // Fetch entity from DB so we get a properly typed, initialized entity
    const strEntityName = typeof entityName === 'string' ? entityName : entityName.name
    const entityServiceResult = this.metaService.findEntityService(strEntityName)
    if (!entityServiceResult) {
      throw NotFoundErr(`No entity service found for "${entityName}"`)
    }
    const [, entityService] = entityServiceResult
    const id = typeof pojo.id === 'string' ? pojo.id : undefined
    const dbEntity = id ? await entityService.findOneByID(id) : null

    if (dbEntity) {
      // Create a disconnected entity from the POJO to avoid modifying the current identity map
      const forked = this.em.fork()
      const createdEntity = forked.create(entityName, restored)
      const assignedEntity = wrap(createdEntity).assign(restored, { em: forked }) as BaseEntity
      forked.clear()
      return assignedEntity
    }

    // Entity not yet persisted (draft create) — create an in-memory instance from the POJO,
    // bypassing the EM to avoid identity map conflicts with the constructor-generated PK.
    const entity = this.em.create(meta.class, restored, { persist: false, managed: false })
    return entity
  }
}
