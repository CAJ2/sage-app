import { EntityManager, ref } from '@mikro-orm/postgresql'
import { Injectable, NotFoundException } from '@nestjs/common'
import { CursorOptions } from '@src/common/transform'
import { Change, ChangeStatus } from './change.entity'
import { CreateChangeInput, UpdateChangeInput } from './change.model'
import { Source } from './source.entity'

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

  async create(input: CreateChangeInput, userID: string) {
    const change = new Change()
    change.title = input.title
    change.description = input.description
    change.user.id = userID
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
}
