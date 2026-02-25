import { BaseEntity, EntityManager, ref } from '@mikro-orm/postgresql'
import type {
  Collection,
  EntityDTO,
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

  async setOrAddPivot<U extends object & { id: string }, T extends object>(
    id: string,
    changeID: string | undefined,
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
        const toSetEntities = toSet.map((item) => {
          const newEntity = this.em.create(
            pivotEntity,
            {
              [collField]: id,
              [relField]: item.id,
              ..._.omit(item, 'id'),
            } as any,
            {
              managed: !!changeID,
              persist: !changeID,
            },
          )
          if (!changeID) {
            this.em.persist(newEntity)
          }
          return newEntity
        })
        collection.set(toSetEntities)
      } else if (!Array.isArray(toSet) && toSet.id) {
        const foundItem = await this.em.findOne(relEntity, { id: toSet.id } as any, {
          populate: false,
        })
        if (!foundItem) {
          throw NotFoundErr(`No ${relEntity} found for ID: ${toSet.id}`)
        }
        const toSetEntity = this.em.create(
          pivotEntity,
          {
            [collField]: id,
            [relField]: foundItem.id,
            ..._.omit(toSet, 'id'),
          } as any,
          {
            managed: !!changeID,
            persist: !changeID,
          },
        )
        if (!changeID) {
          this.em.persist(toSetEntity)
        }
        collection.set([toSetEntity])
      }
    }
    if (toAdd) {
      if (Array.isArray(toAdd) && toAdd.length > 0) {
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
        const toAddEntities = toAdd.map((item) => {
          const newEntity = this.em.create(
            pivotEntity,
            {
              [collField]: id,
              [relField]: item.id,
              ..._.omit(item, 'id'),
            } as any,
            {
              managed: !!changeID,
              persist: !changeID,
            },
          )
          if (!changeID) {
            this.em.persist(newEntity)
          }
          return newEntity
        })
        collection.add(toAddEntities)
      } else if (!Array.isArray(toAdd) && toAdd.id) {
        const foundItem = await this.em.findOne(relEntity, { id: toAdd.id } as any, {
          populate: false,
        })
        if (!foundItem) {
          throw NotFoundErr(`No ${relEntity} found for ID: ${toAdd.id}`)
        }
        const toAddEntity = this.em.create(
          pivotEntity,
          {
            [collField]: id,
            [relField]: foundItem.id,
            ..._.omit(toAdd, 'id'),
          } as any,
          {
            managed: !!changeID,
            persist: !changeID,
          },
        )
        if (!changeID) {
          this.em.persist(toAddEntity)
        }
        collection.add([toAddEntity])
      }
    }
    return collection
  }

  async removeFromPivot<U extends object & { id: string }, T extends object>(
    changeID: string | undefined,
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
        // Find the actual pivot entities to remove
        const pivotItems = collection.getItems().filter((item: any) => {
          return toRemove.includes(item[relField]?.id || item[relField])
        })
        collection.remove(pivotItems)
      } else {
        const foundItem = await this.em.findOne(relEntity, { id: toRemove } as any, {
          populate: false,
        })
        if (!foundItem) {
          throw NotFoundErr(`No ${relEntity} found for ID: ${toRemove}`)
        }
        // Find the actual pivot entity to remove
        const pivotItem = collection.getItems().find((item: any) => {
          const itemRelId = item[relField]?.id || item[relField]
          return itemRelId === toRemove
        })
        if (pivotItem) {
          collection.remove(pivotItem)
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
    const edit = change.edits.find((e) => {
      if (e.entityName === model && e.entityID === where.id) {
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
      const entityName = model.toString()
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
    edit.changes = _.omit(entity.toPOJO(), ['history'])
    change.edits.add(edit)
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
      for (const edit of change.edits) {
        if (edit.entityID) {
          const entity = await this.em.findOne(edit.entityName, {
            id: edit.entityID,
          })
          if (!entity && edit.original) {
            // TODO: Entity could have been deleted, handle stale edits
            throw NotFoundErr(`Entity with ID "${edit.entityID}" not found in "${edit.entityName}"`)
          }
          if (!entity && !edit.original && edit.changes) {
            // This is a create
            this.em.create(edit.entityName, edit.changes)
          } else if (entity && edit.original && !edit.changes) {
            // This is a delete
            this.em.remove(entity)
          } else if (entity && edit.original && edit.changes) {
            // This is an update — only apply scalar changes to avoid re-inserting existing relations
            const relationNames = new Set(
              this.em
                .getMetadata()
                .get(edit.entityName)
                .relations.map((r) => r.name),
            )
            const scalarChanges = Object.fromEntries(
              Object.entries(edit.changes).filter(([k]) => !relationNames.has(k)),
            )
            this.em.assign(entity, scalarChanges as any)
          } else {
            throw BadRequestErr(`Edit for entity "${edit.entityName}" is invalid`)
          }
          this.createHistory<BaseEntity>(
            edit.entityName,
            change.user.id,
            edit.original,
            edit.changes,
          )
        } else {
          throw BadRequestErr(`Edit for entity "${edit.entityName}" is invalid`)
        }
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
    const id = (changes as any).id || (original as any).id
    this.em.create(historyMeta.className, {
      [historyMeta.primaryKeys[0]]: id,
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
    const flattenRefs: { ref: string; fieldKey: string; foreignKey: string }[] = []
    const changeOmit: string[] = []
    meta.relations.forEach((rel) => {
      // Skip history and tree relations
      if (rel.name.startsWith('history') || ['ancestors', 'descendants'].includes(rel.name)) {
        return
      }
      // Populate 1:m relations
      if (!rel.pivotEntity && rel.kind === '1:m') {
        const refMeta = rel.targetMeta
        if (!refMeta) {
          throw NotFoundErr(`Target meta for relation "${rel.name}" not found`)
        }
        flattenRefs.push({
          ref: rel.name,
          fieldKey: refMeta.primaryKeys[0],
          foreignKey: refMeta.primaryKeys[1],
        })
      }
      // Do not store m:n relations with pivot entities
      // Instead the 1:m relation with pivot entity data is stored
      if (rel.pivotEntity && rel.kind === 'm:n') {
        changeOmit.push(rel.name)
      }
    })
    const pojo: any = _.cloneDeep(entity.toPOJO())
    flattenRefs.forEach((ref) => {
      if (pojo[ref.ref] && Array.isArray(pojo[ref.ref])) {
        pojo[ref.ref] = pojo[ref.ref].map((item: any) => {
          if (!item) return item
          if (!_.isString(item[ref.fieldKey]) && _.has(item[ref.fieldKey], 'id')) {
            item[ref.fieldKey] = item[ref.fieldKey].id
          }
          if (!_.isString(item[ref.foreignKey]) && _.has(item[ref.foreignKey], 'id')) {
            item[ref.foreignKey] = item[ref.foreignKey].id
          }
          return item
        })
      } else if (pojo[ref.ref] && pojo[ref.ref][ref.fieldKey]) {
        pojo[ref.ref] = {
          [ref.fieldKey]: _.isString(pojo[ref.ref][ref.fieldKey])
            ? pojo[ref.ref][ref.fieldKey]
            : pojo[ref.ref][ref.fieldKey].id,
          [ref.foreignKey]: _.isString(pojo[ref.ref][ref.foreignKey])
            ? pojo[ref.ref][ref.foreignKey]
            : pojo[ref.ref][ref.foreignKey].id,
          ..._.omit(pojo[ref.ref], [ref.fieldKey, ref.foreignKey]),
        }
      }
    })
    return _.omit(pojo, [...changeOmit, 'createdAt', 'updatedAt'])
  }
}
