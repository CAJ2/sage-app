import { EntityManager } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'

import { isUsingChange } from '@src/changes/change-ext.model'
import { Change } from '@src/changes/change.entity'
import { EditService } from '@src/changes/edit.service'
import { ConflictErr, NotFoundErr } from '@src/common/exceptions'
import { I18nService } from '@src/common/i18n.service'
import { MeiliService } from '@src/common/meilisearch.service'
import { CursorOptions } from '@src/common/transform'

import { Org } from './org.entity'
import { CreateOrgInput, UpdateOrgInput } from './org.model'
import { User } from './users.entity'

@Injectable()
export class OrgService {
  constructor(
    private readonly em: EntityManager,
    private readonly editService: EditService,
    private readonly searchService: MeiliService,
    private readonly i18n: I18nService,
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
      throw ConflictErr('ORG_CONFLICT', `Org with slug ${input.slug} already exists`)
    }
    const org = new Org()
    if (!isUsingChange(input)) {
      await this.setFields(org, input)
      await this.em.persist(org).flush()
      return { org }
    }
    const change = await this.editService.findOneOrCreate(input.changeID, input.change, userID)
    await this.setFields(org, input, change)
    await this.editService.createEntityEdit(change, org)
    await this.em.persist(change).flush()
    await this.editService.checkMerge(change, input)
    return { org, change }
  }

  async update(input: UpdateOrgInput, userID: string) {
    const { entity: org, change } = await this.editService.findOneWithChangeInput(
      input,
      userID,
      Org,
      {
        id: input.id,
      },
    )
    if (!org) {
      throw NotFoundErr('ORG_NOT_FOUND', `Org with id ${input.id} not found`)
    }
    if (!change) {
      await this.setFields(org, input)
      await this.em.persist(org).flush()
      return { org }
    }
    await this.editService.beginUpdateEntityEdit(change, org)
    await this.setFields(org, input, change)
    await this.editService.updateEntityEdit(change, org)
    await this.em.persist(change).flush()
    await this.editService.checkMerge(change, input)
    return { org, change }
  }

  async setFields(org: Org, input: Partial<CreateOrgInput & UpdateOrgInput>, change?: Change) {
    if (input.name) {
      org.name = input.name
    }
    if (input.slug) {
      org.slug = input.slug
    }
    if (input.desc) {
      org.desc = this.i18n.addTrReq(org.desc, input.desc, input.lang)
    }
    if (input.avatarURL) {
      org.avatarURL = input.avatarURL
    }
    if (input.websiteURL) {
      org.websiteURL = input.websiteURL
    }
  }
}
