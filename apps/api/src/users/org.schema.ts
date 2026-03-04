import { Injectable } from '@nestjs/common'
import { z } from 'zod/v4'

import { TransformInput, ZService } from '@src/common/z.service'
import { Org as OrgEntity, OrgHistory as OrgHistoryEntity } from '@src/users/org.entity'
import { Org, OrgHistory } from '@src/users/org.model'
import { User as UserEntity } from '@src/users/users.entity'
import { User } from '@src/users/users.model'

export const OrgIDSchema = z.string().meta({
  id: 'Org',
  name: 'Organization ID',
})

@Injectable()
export class OrgSchemaService {
  constructor(private readonly zService: ZService) {
    const OrgTransform = z.transform((input: TransformInput) => {
      const entity = input.input as OrgEntity
      const model = new Org()
      model.id = entity.id
      model.createdAt = entity.createdAt as any
      model.updatedAt = entity.updatedAt as any
      model.name = entity.name
      model.slug = entity.slug
      model.desc = input.i18n.tr(entity.desc)
      model.avatarURL = entity.avatarURL
      model.websiteURL = entity.websiteURL
      return model
    })
    this.zService.registerTransform(OrgEntity, Org, OrgTransform)

    const UserTransform = z.transform((input: TransformInput) => {
      const entity = input.input as UserEntity
      const model = new User()
      model.id = entity.id
      model.createdAt = entity.createdAt as any
      model.updatedAt = entity.updatedAt as any
      model.name = entity.name
      model.email = entity.email
      model.emailVerified = entity.emailVerified
      model.username = entity.username
      model.avatarURL = entity.avatarURL
      model.lang = entity.lang
      return model
    })
    this.zService.registerTransform('User', User, UserTransform)

    const OrgHistoryTransform = z.transform((input: TransformInput) => {
      const entity = input.input as OrgHistoryEntity
      const model = new OrgHistory()
      model.datetime = entity.datetime as any
      model.user = (entity as any).user
      model.original = (entity as any).original
      model.changes = (entity as any).changes
      return model
    })
    this.zService.registerTransform(OrgHistoryEntity, OrgHistory, OrgHistoryTransform)
  }
}
