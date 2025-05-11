import { EntityManager } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'
import { CursorOptions } from '@src/common/transform'
import Ajv from 'ajv/dist/2020'
import { Tag } from './tag.entity'
import { CreateTagDefinitionInput, UpdateTagDefinitionInput } from './tag.model'

const ajv = new Ajv({
  allErrors: true,
  strict: false,
  useDefaults: true,
  removeAdditional: true,
})

export interface TagInput {
  id: string
  meta?: Record<string, any>
}

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

  async create(input: CreateTagDefinitionInput) {
    const tag = new Tag()
    await this.em.persistAndFlush(tag)
    return tag
  }

  async update(input: UpdateTagDefinitionInput) {
    const tag = await this.em.findOne(Tag, { id: input.id })
    if (!tag) {
      throw new Error(`Tag with ID "${input.id}" not found`)
    }
    this.em.assign(tag, input)
    await this.em.persistAndFlush(tag)
    return tag
  }

  async validateTagInput(input: TagInput): Promise<Tag> {
    const tag = await this.em.findOne(Tag, { id: input.id })
    if (!tag) {
      throw new Error(`Tag with ID "${input.id}" not found`)
    }
    if (input.meta) {
      if (tag.meta_template && tag.meta_template.schema) {
        const validator = ajv.compile(tag.meta_template.schema)
        const valid = validator(input.meta)
        if (!valid) {
          throw new Error(
            `Invalid meta data for tag "${tag.id}": ${ajv.errorsText(validator.errors)}`,
          )
        }
        tag.meta = input.meta
      } else {
        throw new Error(`Tag "${tag.id}" does not have a meta template schema`)
      }
    }
    return tag
  }
}
