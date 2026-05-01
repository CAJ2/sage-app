import { EntityManager } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'

import { Source } from '@src/changes/source.entity'
import { NotFoundErr } from '@src/common/exceptions'
import { RedisService } from '@src/common/redis.service'
import { generateID } from '@src/db/base.entity'
import { FeedbackAction, FeedbackEntityName } from '@src/feedback/feedback.entity'
import { VoteInput, VoteOutput } from '@src/feedback/feedback.model'
import { FeedbackSchemaService } from '@src/feedback/feedback.schema'
import { Place } from '@src/geo/place.entity'
import { Component } from '@src/process/component.entity'
import { Process } from '@src/process/process.entity'
import { Program } from '@src/process/program.entity'
import { Item } from '@src/product/item.entity'
import { Variant } from '@src/product/variant.entity'

const REDIS_TTL = 86_400

const ENTITY_CLASS_MAP: Record<
  FeedbackEntityName,
  new (...args: any[]) => { id: string; updatedAt: Date }
> = {
  [FeedbackEntityName.ITEM]: Item,
  [FeedbackEntityName.VARIANT]: Variant,
  [FeedbackEntityName.COMPONENT]: Component,
  [FeedbackEntityName.PROCESS]: Process,
  [FeedbackEntityName.PROGRAM]: Program,
  [FeedbackEntityName.PLACE]: Place,
  [FeedbackEntityName.SOURCE]: Source,
}

@Injectable()
export class FeedbackService {
  constructor(
    private readonly em: EntityManager,
    private readonly redis: RedisService,
    private readonly schemaService: FeedbackSchemaService,
  ) {}

  async vote(input: VoteInput, ip: string): Promise<VoteOutput> {
    const { entityName, entityID, action, data } = input

    const entityClass = ENTITY_CLASS_MAP[entityName]
    const entity = (await this.em.findOne(entityClass as any, { id: entityID } as any)) as {
      id: string
      updatedAt: Date
    } | null
    if (!entity) {
      throw NotFoundErr(`${entityName} not found`)
    }
    const entityUpdatedAt: Date = entity.updatedAt

    const redisKey = `fdbk:${entityName}:${entityID}:${ip}`
    const existing = await this.redis.get(redisKey)

    if (existing !== action) {
      if (existing === null) {
        await this.upsertVote(entityName, entityID, entityUpdatedAt, action)
      } else {
        await this.switchVote(entityName, entityID, entityUpdatedAt, action)
      }
      await this.redis.set(redisKey, action, REDIS_TTL)
    }

    if (data !== undefined) {
      await this.upsertForm(entityName, entityID, entityUpdatedAt, action, data)
    }

    const schemas = this.schemaService.getSchema(action)
    return {
      success: true,
      schema: schemas.schema as Record<string, any> | undefined,
      uischema: schemas.uischema as Record<string, any> | undefined,
    }
  }

  private async upsertVote(
    entityName: FeedbackEntityName,
    entityId: string,
    entityUpdatedAt: Date,
    action: FeedbackAction,
  ): Promise<void> {
    const knex = this.em.getKnex()
    const now = new Date()
    const id = generateID()
    const upvotesDelta = action === FeedbackAction.UPVOTE ? 1 : 0
    const downvotesDelta = action === FeedbackAction.DOWNVOTE ? 1 : 0
    await this.em.execute(
      knex.raw(
        `INSERT INTO feedback_votes (id, entity_name, entity_id, entity_updated_at, upvotes, downvotes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT (entity_name, entity_id, entity_updated_at)
         DO UPDATE SET upvotes = feedback_votes.upvotes + EXCLUDED.upvotes,
                       downvotes = feedback_votes.downvotes + EXCLUDED.downvotes,
                       updated_at = EXCLUDED.updated_at`,
        [id, entityName, entityId, entityUpdatedAt, upvotesDelta, downvotesDelta, now, now],
      ),
    )
  }

  private async switchVote(
    entityName: FeedbackEntityName,
    entityId: string,
    entityUpdatedAt: Date,
    action: FeedbackAction,
  ): Promise<void> {
    const knex = this.em.getKnex()
    const upvotesDelta = action === FeedbackAction.UPVOTE ? 1 : -1
    const downvotesDelta = action === FeedbackAction.DOWNVOTE ? 1 : -1
    await this.em.execute(
      knex.raw(
        `UPDATE feedback_votes
         SET upvotes = upvotes + ?, downvotes = downvotes + ?, updated_at = ?
         WHERE entity_name = ? AND entity_id = ? AND entity_updated_at = ?`,
        [upvotesDelta, downvotesDelta, new Date(), entityName, entityId, entityUpdatedAt],
      ),
    )
  }

  private async upsertForm(
    entityName: FeedbackEntityName,
    entityId: string,
    entityUpdatedAt: Date,
    formType: FeedbackAction,
    data: Record<string, any>,
  ): Promise<void> {
    const knex = this.em.getKnex()
    const now = new Date()
    const id = generateID()
    await this.em.execute(
      knex.raw(
        `INSERT INTO feedback_forms (id, entity_name, entity_id, entity_updated_at, form_type, data, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT (entity_name, entity_id, entity_updated_at, form_type)
         DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at`,
        [id, entityName, entityId, entityUpdatedAt, formType, JSON.stringify(data), now, now],
      ),
    )
  }
}
