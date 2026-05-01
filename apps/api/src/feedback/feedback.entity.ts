import { Entity, Property, Unique } from '@mikro-orm/core'

import { type JSONObject } from '@src/common/z.schema'
import { IDCreatedUpdated } from '@src/db/base.entity'

export enum FeedbackEntityName {
  ITEM = 'ITEM',
  VARIANT = 'VARIANT',
  COMPONENT = 'COMPONENT',
  PROCESS = 'PROCESS',
  PROGRAM = 'PROGRAM',
  PLACE = 'PLACE',
  SOURCE = 'SOURCE',
}

export enum FeedbackAction {
  UPVOTE = 'UPVOTE',
  DOWNVOTE = 'DOWNVOTE',
}

@Entity({ tableName: 'feedback_votes', schema: 'public' })
@Unique({ properties: ['entityName', 'entityId', 'entityUpdatedAt'] })
export class FeedbackVote extends IDCreatedUpdated {
  @Property({ type: 'varchar', length: 32 })
  entityName!: FeedbackEntityName

  @Property()
  entityId!: string

  @Property()
  entityUpdatedAt!: Date

  @Property({ default: 0 })
  upvotes: number = 0

  @Property({ default: 0 })
  downvotes: number = 0
}

@Entity({ tableName: 'feedback_forms', schema: 'public' })
@Unique({ properties: ['entityName', 'entityId', 'entityUpdatedAt', 'formType'] })
export class FeedbackForm extends IDCreatedUpdated {
  @Property({ type: 'varchar', length: 32 })
  entityName!: FeedbackEntityName

  @Property()
  entityId!: string

  @Property()
  entityUpdatedAt!: Date

  @Property({ type: 'varchar', length: 32 })
  formType!: FeedbackAction

  @Property({ type: 'json', nullable: true })
  data?: JSONObject
}
