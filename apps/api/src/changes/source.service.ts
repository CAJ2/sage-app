import { EntityManager, ref } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'

import { Source } from '@src/changes/source.entity'
import {
  CreateSourceInput,
  LinkSourceInput,
  UnlinkSourceInput,
  UpdateSourceInput,
} from '@src/changes/source.model'
import { NotFoundErr } from '@src/common/exceptions'
import { CursorOptions } from '@src/common/transform'
import { type JSONObject } from '@src/common/z.schema'
import { User } from '@src/users/users.entity'

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

  async findOneByID(id: string) {
    const source = await this.em.findOne(Source, { id }, { populate: ['user', 'changes'] })

    if (!source) {
      throw NotFoundErr(`Source with ID "${id}" not found`)
    }

    return source
  }

  async create(input: CreateSourceInput, userID: string) {
    const source = new Source()
    source.user = ref(User, userID)
    await this.setFields(source, input)
    await this.em.persist(source).flush()
    return source
  }

  async update(input: UpdateSourceInput) {
    const source = await this.findOneByID(input.id)
    await this.setFields(source, input)
    await this.em.persist(source).flush()
    return source
  }

  async markProcessed(id: string) {
    const source = await this.findOneByID(id)
    source.processedAt = new Date()
    await this.em.persist(source).flush()
    return source
  }

  async remove(id: string) {
    const source = await this.findOneByID(id)
    await this.em.remove(source).flush()
    return true
  }

  async link(input: LinkSourceInput) {
    const source = await this.em.findOneOrFail(Source, { id: input.id })
    const nodes: JSONObject[] = Array.isArray(source.content?.jsonld)
      ? (source.content!.jsonld as JSONObject[])
      : []
    const idx = nodes.findIndex((n) => n['@id'] === input.jsonld['@id'])
    if (idx >= 0) nodes[idx] = input.jsonld
    else nodes.push(input.jsonld)
    source.content = { ...source.content, jsonld: nodes }
    await this.em.flush()
    return { source }
  }

  async unlink(input: UnlinkSourceInput) {
    const source = await this.em.findOneOrFail(Source, { id: input.id })
    if (!Array.isArray(source.content?.jsonld)) return { source }
    const filtered = (source.content!.jsonld as JSONObject[]).filter(
      (n) => n['@id'] !== input.jsonld['@id'],
    )
    source.content = { ...source.content, jsonld: filtered }
    await this.em.flush()
    return { source }
  }

  async setFields(source: Source, input: Partial<CreateSourceInput & UpdateSourceInput>) {
    if (input.type) source.type = input.type
    if (input.location) source.location = input.location
    if (input.content) {
      source.content = input.content
    }
    if (input.contentURL) {
      source.contentURL = input.contentURL
    }
    if (input.metadata) {
      source.metadata = input.metadata
    }
  }
}
