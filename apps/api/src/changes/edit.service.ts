import { BaseEntity, EntityManager, ref } from '@mikro-orm/postgresql'
import { Injectable, NotFoundException } from '@nestjs/common'
import { BadRequestErr, NotFoundErr } from '@src/common/exceptions'
import { User } from '@src/users/users.entity'
import _ from 'lodash'
import { Change, ChangeStatus, Edit } from './change.entity'
import {
  CreateChangeInput,
  IChangeInputWithLang,
  MergeInput,
  UpdateChangeInput,
} from './change.model'
import { Source } from './source.entity'
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

export interface IEntityService {
  findOneByID<T extends BaseEntity>(id: string): Promise<T | null>
}

@Injectable()
export class EditService {
  constructor(private readonly em: EntityManager) {}

  async findOne(id: string) {
    const change = await this.em.findOne(
      Change,
      { id },
      { populate: ['user', 'sources', 'edits'] },
    )

    if (!change) {
      throw new NotFoundException(`Change with ID "${id}" not found`)
    }

    return change
  }

  async findOneOrCreate(
    id?: string,
    input?: CreateChangeInput,
    userID?: string,
  ) {
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
      const change = await this.em.findOne(Change, { id, user: userID })
      if (!change) {
        throw NotFoundErr(`Change with ID "${id}" not found`)
      }
      return change
    }

    const newChange = await this.create(input!, userID)
    return newChange
  }

  async create(input: CreateChangeInput, userID: string) {
    const change = new Change()
    change.title = input.title
    change.description = input.description
    change.user = ref(User, userID)
    change.status = input.status || ChangeStatus.DRAFT

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

    await this.em.persistAndFlush(change)
    return change
  }

  async update(input: UpdateChangeInput) {
    const change = await this.findOne(input.id)

    if (input.title) change.title = input.title
    if (input.description) change.description = input.description
    if (input.status) change.status = input.status
    if (input.sources) {
      const removed = change.sources.filter(
        (source) => !input.sources!.includes(source.id),
      )
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

    await this.em.persistAndFlush(change)
    return change
  }

  async setOrAddCollection<
    T extends object & { id: string },
    U extends { id: string },
  >(
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
        const foundItem = await this.em.findOne(
          entity,
          { id: toSet.id } as any,
          { populate: false },
        )
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
        const foundItem = await this.em.findOne(
          entity,
          { id: toAdd.id } as any,
          { populate: false },
        )
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
        const foundItems = await this.em.find(
          entity,
          { id: { $in: toRemove } } as any,
          { populate: false },
        )
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
        const foundItem = await this.em.findOne(
          entity,
          { id: toRemove } as any,
          { populate: false },
        )
        if (!foundItem) {
          throw NotFoundErr(`No ${entity} found for ID: ${toRemove}`)
        }
        collection.remove(foundItem)
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
      if (e.entity_name === model && e.id === where.id) {
        return true
      }
      return false
    })
    if (edit) {
      return this.em.getReference(model, edit.id as any) as any
    }
    // If not, check if it exists in the database
    const entity = await this.em.findOne<T>(
      model,
      where as FilterQuery<T>,
      options,
    )
    if (!entity) {
      const entityName = model.toString()
      throw NotFoundErr(`${entityName} with ID "${where.id}" not found`)
    }
    // TODO: Type this correctly?
    return entity.toReference() as unknown as { id: string } & Reference<
      Loaded<T>
    >
  }

  async findOneWithChangeInput<T extends BaseEntity>(
    input: IChangeInputWithLang,
    userID: string,
    model: EntityName<T>,
    where: FilterQuery<T> & { id: string },
    options?: FindOneOptions<T, never, '*', never>,
  ): Promise<{ entity: Loaded<T, never, '*', never>; change: Change }> {
    const change = await this.findOneOrCreate(
      input.change_id,
      input.change,
      userID,
    )
    const meta = this.em.getMetadata().get(model)
    // First check if it exists in the change
    const edit = change.edits.find((e) => {
      if (e.entity_name === meta.name && e.id === where.id) {
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
        throw NotFoundErr(
          `Edit for entity "${meta.name}" with ID "${where.id}" not found`,
        )
      }
    }
    // If not, check if it exists in the database
    if (!options) {
      options = { disableIdentityMap: input.useChange() }
    }
    const entity = await this.em.findOne<T>(
      model,
      where as FilterQuery<T>,
      options,
    )
    if (!entity) {
      throw NotFoundErr(`${meta.name} with ID "${where.id}" not found`)
    }
    return { entity: entity as Loaded<T>, change }
  }

  async beginUpdateEntityEdit(
    change: Change,
    entity: BaseEntity & { id: string },
  ) {
    let edit = change.edits.find(
      (e) => e.entity_name === entity.constructor.name && e.id === entity.id,
    )
    if (!edit) {
      edit = {
        entity_name: entity.constructor.name,
        id: entity.id,
        original: _.omit(entity.toPOJO(), ['history']),
      }
      change.edits.push(edit)
    }
  }

  async updateEntityEdit(change: Change, entity: BaseEntity & { id: string }) {
    const edit = change.edits.find(
      (e) => e.entity_name === entity.constructor.name && e.id === entity.id,
    )
    if (!edit) {
      throw NotFoundErr(
        `Edit for entity "${entity.constructor.name}" with ID "${entity.id}" not found`,
      )
    }
    edit.changes = _.omit(entity.toPOJO(), ['history'])
  }

  async createEntityEdit(change: Change, entity: BaseEntity & { id: string }) {
    const entityName = entity.constructor.name
    if (!entityName) {
      throw BadRequestErr('Entity name is required for edit creation')
    }
    const edit: Edit = {
      entity_name: entityName,
      id: entity.id,
      changes: _.omit(entity.toPOJO(), ['history']),
    }
    change.edits.push(edit)
  }

  async checkMerge(change: Change, mergeInput: MergeInput) {
    if (change.status === ChangeStatus.APPROVED && mergeInput.apply) {
      await this.merge(change)
    }
  }

  async mergeID(changeID: string) {
    const change = await this.em.findOne(Change, { id: changeID })
    if (!change) {
      throw NotFoundErr(`Change with ID "${changeID}" not found`)
    }
    if (change.status !== ChangeStatus.APPROVED) {
      throw BadRequestErr(
        `Change with ID "${changeID}" is not approved and cannot be merged`,
      )
    }
    return this.merge(change)
  }

  async merge(change: Change) {
    await this.em.begin()
    try {
      for (const edit of change.edits) {
        if (edit.id) {
          const entity = await this.em.findOne(edit.entity_name, {
            id: edit.id,
          })
          if (!entity && edit.original) {
            // TODO: Entity could have been deleted, handle stale edits
            throw NotFoundErr(
              `Entity with ID "${edit.id}" not found in "${edit.entity_name}"`,
            )
          }
          if (!entity && !edit.original && edit.changes) {
            // This is a create
            this.em.create(edit.entity_name, edit.changes)
            this.createHistory<BaseEntity>(
              edit.entity_name,
              change.user.id,
              undefined,
              edit.changes,
            )
          } else if (entity && edit.original && !edit.changes) {
            // This is a delete
            this.em.remove(entity)
          } else if (entity && edit.original && edit.changes) {
            // This is an update
            _.merge(entity, edit.changes)
          } else {
            throw BadRequestErr(
              `Edit for entity "${edit.entity_name}" is invalid`,
            )
          }
          this.createHistory<BaseEntity>(
            edit.entity_name,
            change.user.id,
            edit.original,
            edit.changes,
          )
        } else {
          throw BadRequestErr(
            `Edit for entity "${edit.entity_name}" is invalid`,
          )
        }
      }
      change.status = ChangeStatus.MERGED
      await this.em.commit()
      return { change }
    } catch (error) {
      await this.em.rollback()
      change.status = ChangeStatus.REJECTED
      await this.em.persistAndFlush(change)
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
      throw NotFoundErr(`Entity "${name}" not found in metadata`)
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
}
