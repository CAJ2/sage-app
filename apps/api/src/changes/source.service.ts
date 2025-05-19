import { EntityManager, ref } from '@mikro-orm/postgresql'
import { Injectable, NotFoundException } from '@nestjs/common'
import { CursorOptions } from '@src/common/transform'
import { User } from '@src/users/users.entity'
import { Source } from './source.entity'
import { CreateSourceInput, UpdateSourceInput } from './source.model'

@Injectable()
export class SourceService {
  constructor(private readonly em: EntityManager) {}

  async find(opts: CursorOptions<Source>) {
    const sources = await this.em.find(Source, opts.where, opts.options)
    const count = await this.em.count(Source, opts.where)
    return {
      items: sources,
      count,
    }
  }

  async findOne(id: string) {
    const source = await this.em.findOne(
      Source,
      { id },
      { populate: ['user', 'changes'] },
    )

    if (!source) {
      throw new NotFoundException(`Source with ID "${id}" not found`)
    }

    return source
  }

  async create(input: CreateSourceInput, userID: string) {
    const source = new Source()
    source.user = ref(User, userID)
    await this.setFields(source, input)
    await this.em.persistAndFlush(source)
    return source
  }

  async update(input: UpdateSourceInput) {
    const source = await this.findOne(input.id)
    await this.setFields(source, input)
    await this.em.persistAndFlush(source)
    return source
  }

  async markProcessed(id: string) {
    const source = await this.findOne(id)
    source.processed_at = new Date()
    await this.em.persistAndFlush(source)
    return source
  }

  async remove(id: string) {
    const source = await this.findOne(id)
    await this.em.removeAndFlush(source)
    return true
  }

  async setFields(
    source: Source,
    input: Partial<CreateSourceInput & UpdateSourceInput>,
  ) {
    if (input.type) source.type = input.type
    if (input.location) source.location = input.location
    if (input.content) {
      source.content = input.content
    }
    if (input.content_url) {
      source.content_url = input.content_url
    }
    if (input.metadata) {
      source.metadata = input.metadata
    }
  }
}
