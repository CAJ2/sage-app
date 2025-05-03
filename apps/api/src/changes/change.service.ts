import { BaseEntity, EntityManager, ref } from '@mikro-orm/postgresql'
import { Injectable, NotFoundException } from '@nestjs/common'
import { BadRequestErr, NotFoundErr } from '@src/common/exceptions'
import { CursorOptions } from '@src/common/transform'
import { User } from '@src/users/users.entity'
import _ from 'lodash'
import { Change, ChangeStatus, Edit } from './change.entity'
import {
  CreateChangeInput,
  MergeInput,
  UpdateChangeInput,
} from './change.model'
import { Source } from './source.entity'
import type {
  EntityName,
  FilterQuery,
  Loaded,
  Reference,
} from '@mikro-orm/postgresql'

@Injectable()
export class ChangeService {
  constructor(private readonly em: EntityManager) {}

  async find(opts: CursorOptions<Change>) {
    const changes = await this.em.find(Change, opts.where, opts.options)
    const count = await this.em.count(Change, opts.where)
    return {
      items: changes,
      count,
    }
  }

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

  async sources(changeID: string, opts: CursorOptions<Source>) {
    opts.where.changes = this.em.getReference(Change, changeID)
    const sources = await this.em.find(Source, opts.where, opts.options)
    const count = await this.em.count(Source, { changes: opts.where.changes })
    return {
      items: sources,
      count,
    }
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
      const change = await this.findOne(id)
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
    change.metadata = input.metadata

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
    if (input.metadata) {
      change.metadata = input.metadata
    }

    await this.em.persistAndFlush(change)
    return change
  }

  async remove(id: string) {
    const change = await this.findOne(id)
    await this.em.removeAndFlush(change)
  }

  async findOneWithChange<T extends BaseEntity>(
    change: Change,
    model: EntityName<T>,
    where: FilterQuery<T> & { id: string },
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
    const entity = await this.em.findOne<T>(model, where as FilterQuery<T>)
    if (!entity) {
      const entityName = model.toString()
      throw NotFoundErr(`${entityName} with ID "${where.id}" not found`)
    }
    // TODO: Type this correctly?
    return entity.toReference() as unknown as { id: string } & Reference<
      Loaded<T>
    >
  }

  async createEntityEdit(change: Change, entity: BaseEntity) {
    const edit = new Edit()
    edit.entity_name = entity.constructor.name
    edit.changes = entity.toPOJO()
    change.edits.push(edit)
  }

  async checkMerge(change: Change, mergeInput: MergeInput) {
    if (change.status === ChangeStatus.APPROVED && mergeInput.apply) {
      await this.merge(change)
    }
  }

  async merge(change: Change) {
    await this.em.begin()
    try {
      for (const edit of change.edits) {
        if (edit.id) {
          // This is an update
          const entity = await this.em.findOne(edit.entity_name, {
            id: edit.id,
          })
          if (!entity) {
            throw NotFoundErr(
              `Entity with ID "${edit.id}" not found in "${edit.entity_name}"`,
            )
          }
          if (edit.original) {
            _.merge(entity, edit.changes)
          }
          // TODO: Insert history
        } else if (edit.changes) {
          // This is a create
          this.em.create(edit.entity_name, edit.changes)
          // TODO: Insert history
        }
      }
      change.status = ChangeStatus.MERGED
      await this.em.commit()
    } catch (error) {
      await this.em.rollback()
      change.status = ChangeStatus.REJECTED
      await this.em.persistAndFlush(change)
      throw error
    }
  }
}
