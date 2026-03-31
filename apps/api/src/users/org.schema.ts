import { Injectable } from '@nestjs/common'
import { ValidateFunction } from 'ajv'
import { DateTime } from 'luxon'
import { z } from 'zod/v4'

import { ChangeInputWithLangSchema } from '@src/changes/change.schema'
import { BaseSchemaService, zToSchema } from '@src/common/base.schema'
import { UISchemaElement } from '@src/common/ui.schema'
import { TransformInput, ZService } from '@src/common/z.service'
import { Org as OrgEntity, OrgHistory as OrgHistoryEntity } from '@src/users/org.entity'
import { CreateOrgInput, Org, OrgHistory, UpdateOrgInput } from '@src/users/org.model'
import { User as UserEntity } from '@src/users/users.entity'
import { User } from '@src/users/users.model'

export const OrgIDSchema = z.string().meta({
  id: 'Org',
  name: 'Organization ID',
})

@Injectable()
export class OrgSchemaService {
  CreateSchema
  CreateJSONSchema: z.core.JSONSchema.BaseSchema
  CreateValidator: ValidateFunction
  CreateUISchema: UISchemaElement
  UpdateSchema
  UpdateJSONSchema: z.core.JSONSchema.BaseSchema
  UpdateValidator: ValidateFunction
  UpdateUISchema: UISchemaElement

  constructor(
    private readonly baseSchema: BaseSchemaService,
    private readonly zService: ZService,
  ) {
    const OrgTransform = z.transform((input: TransformInput) => {
      const entity = input.input as OrgEntity
      const model = new Org()
      model.id = entity.id
      model.createdAt = DateTime.fromJSDate(entity.createdAt)
      model.updatedAt = DateTime.fromJSDate(entity.updatedAt)
      model.name = entity.name
      model.slug = entity.slug
      model.desc = input.i18n.tr(entity.desc)
      model.avatarURL = entity.avatarURL
      model.websiteURL = entity.websiteURL
      return model
    })
    this.zService.registerEntityTransform(OrgEntity, Org, OrgTransform)

    const UserTransform = z.transform((input: TransformInput) => {
      const entity = input.input as UserEntity
      const model = new User()
      model.id = entity.id
      model.createdAt = DateTime.fromJSDate(entity.createdAt)
      model.updatedAt = DateTime.fromJSDate(entity.updatedAt)
      model.name = entity.name
      model.email = entity.email
      model.emailVerified = entity.emailVerified
      model.username = entity.username
      model.avatarURL = entity.avatarURL
      model.lang = entity.lang
      return model
    })
    this.zService.registerEntityTransform('User', User, UserTransform)

    const OrgHistoryTransform = z.transform((input: TransformInput) => {
      const entity = input.input as OrgHistoryEntity
      const model = new OrgHistory()
      model.datetime = DateTime.fromJSDate(entity.datetime)
      model.user = entity.user
      model.original = entity.original as Org | undefined
      model.changes = entity.changes as Org | undefined
      return model
    })
    this.zService.registerEntityTransform(OrgHistoryEntity, OrgHistory, OrgHistoryTransform)

    this.CreateSchema = ChangeInputWithLangSchema.extend({
      name: z.string().max(1024),
      slug: z.string().max(1024),
      desc: z.string().max(100_000).optional(),
      avatarURL: z.string().max(2048).optional(),
      websiteURL: z.string().max(2048).optional(),
    })
    this.CreateJSONSchema = zToSchema(this.CreateSchema)
    this.CreateUISchema = {
      type: 'VerticalLayout',
      elements: [
        { type: 'Control', scope: '#/properties/name' },
        { type: 'Control', scope: '#/properties/slug' },
        { type: 'Control', scope: '#/properties/desc' },
        { type: 'Control', scope: '#/properties/avatarURL' },
        { type: 'Control', scope: '#/properties/websiteURL' },
      ],
    }

    this.UpdateSchema = ChangeInputWithLangSchema.extend({
      id: OrgIDSchema,
      name: z.string().max(1024).optional(),
      slug: z.string().max(1024).optional(),
      desc: z.string().max(100_000).optional(),
      avatarURL: z.string().max(2048).optional(),
      websiteURL: z.string().max(2048).optional(),
    })
    this.UpdateJSONSchema = zToSchema(this.UpdateSchema)
    this.UpdateUISchema = {
      type: 'VerticalLayout',
      elements: [
        { type: 'Control', scope: '#/properties/name' },
        { type: 'Control', scope: '#/properties/slug' },
        { type: 'Control', scope: '#/properties/desc' },
        { type: 'Control', scope: '#/properties/avatarURL' },
        { type: 'Control', scope: '#/properties/websiteURL' },
      ],
    }
    this.CreateValidator = this.baseSchema.ajv.compile(this.CreateJSONSchema)
    this.UpdateValidator = this.baseSchema.ajv.compile(this.UpdateJSONSchema)
  }

  async parseCreateInput(input: CreateOrgInput): Promise<CreateOrgInput> {
    return this.zService.parse(this.CreateSchema, input)
  }

  async parseUpdateInput(input: UpdateOrgInput): Promise<UpdateOrgInput> {
    return this.zService.parse(this.UpdateSchema, input)
  }
}
