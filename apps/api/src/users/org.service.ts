import { EntityManager } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'
import { Change } from '@src/changes/change.entity'
import { ChangeService } from '@src/changes/change.service'
import { ConflictErr, NotFoundErr } from '@src/common/exceptions'
import { MeiliService } from '@src/common/meilisearch.service'
import { CursorOptions } from '@src/common/transform'
import { addTrReq } from '@src/db/i18n'
import { Org } from './org.entity'
import { CreateOrgInput, UpdateOrgInput } from './org.model'
import { User } from './users.entity'

@Injectable()
export class OrgService {
  constructor(
    private readonly em: EntityManager,
    private readonly changeService: ChangeService,
    private readonly searchService: MeiliService,
  ) {}

  async findOneByID(id: string) {
    return await this.em.findOne(Org, { id })
  }

  async users(orgID: string, opts: CursorOptions<User>) {
    opts.where.orgs = orgID
    const users = await this.em.find(User, opts.where, opts.options)
    const count = await this.em.count(User, opts.where)
    return {
      items: users,
      count,
    }
  }

  async create(input: CreateOrgInput, userID: string) {
    const checkOrg = await this.em.findOne(Org, { slug: input.slug })
    if (checkOrg) {
      throw ConflictErr(
        'ORG_CONFLICT',
        `Org with slug ${input.slug} already exists`,
      )
    }
    const org = new Org()
    if (!input.useChange()) {
      await this.setFields(org, input)
      await this.em.persistAndFlush(org)
      await this.searchService.addDocs(org)
      return { org }
    }
    const change = await this.changeService.findOneOrCreate(
      input.change_id,
      input.change,
      userID,
    )
    await this.setFields(org, input, change)
    await this.changeService.createEntityEdit(change, org)
    await this.em.persistAndFlush(change)
    await this.changeService.checkMerge(change, input)
    return { org, change }
  }

  async update(input: UpdateOrgInput, userID: string) {
    const org = await this.em.findOne(
      Org,
      { id: input.id },
      { disableIdentityMap: input.useChange(), populate: ['users'] },
    )
    if (!org) {
      throw NotFoundErr('ORG_NOT_FOUND', `Org with id ${input.id} not found`)
    }
    if (!input.useChange()) {
      await this.setFields(org, input)
      await this.em.persistAndFlush(org)
      await this.searchService.addDocs(org)
      return { org }
    }
    const change = await this.changeService.findOneOrCreate(
      input.change_id,
      input.change,
      userID,
    )
    await this.setFields(org, input, change)
    await this.changeService.createEntityEdit(change, org)
    await this.em.persistAndFlush(change)
    await this.changeService.checkMerge(change, input)
    return { org, change }
  }

  async setFields(
    org: Org,
    input: Partial<CreateOrgInput & UpdateOrgInput>,
    change?: Change,
  ) {
    if (input.name) {
      org.name = input.name
    }
    if (input.slug) {
      org.slug = input.slug
    }
    if (input.desc) {
      org.desc = addTrReq(org.desc, input.lang, input.desc)
    }
    if (input.avatar_url) {
      org.avatar_url = input.avatar_url
    }
    if (input.website_url) {
      org.website_url = input.website_url
    }
  }
}
