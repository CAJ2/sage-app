import { EntityManager } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'
import { CursorOptions } from '@src/common/transform'
import { Tag } from './tag.entity'
import { CreateTagInput, UpdateTagInput } from './tag.model'

@Injectable()
export class TagService {
  constructor(private readonly em: EntityManager) {}

  async find(opts: CursorOptions<Tag>) {
    const tags = await this.em.find(Tag, opts.where, opts.options)
    const count = await this.em.count(Tag, opts.where)
    return {
      items: tags,
      count,
    }
  }

  async findOneByID(id: string) {
    return await this.em.findOne(Tag, { id })
  }

  async create(input: CreateTagInput) {
    const tag = new Tag()
    await this.em.persistAndFlush(tag)
    return tag
  }

  async update(input: UpdateTagInput) {
    const tag = await this.em.findOne(Tag, { id: input.id })
    if (!tag) {
      throw new Error(`Tag with ID "${input.id}" not found`)
    }
    this.em.assign(tag, input)
    await this.em.persistAndFlush(tag)
    return tag
  }
}
