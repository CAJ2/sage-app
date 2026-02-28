import { Entity, Index, Property } from '@mikro-orm/core'

import { IDCreatedUpdated } from '@src/db/base.entity'

@Entity({ tableName: 'apikey', schema: 'auth' })
export class ApiKey extends IDCreatedUpdated {
  @Property({ nullable: true })
  name?: string

  /** First few characters of the key, stored for display purposes. */
  @Property({ nullable: true })
  start?: string

  @Property({ nullable: true })
  prefix?: string

  /** Hashed API key value. */
  @Index()
  @Property()
  key!: string

  /** Identifies which plugin configuration this key belongs to. */
  @Index()
  @Property({ default: 'default' })
  configId!: string

  /** The owner of this key — either a userId or orgId based on config. */
  @Index()
  @Property()
  referenceId!: string

  @Property({ nullable: true })
  refillInterval?: number

  @Property({ nullable: true })
  refillAmount?: number

  @Property({ nullable: true })
  lastRefillAt?: Date

  @Property({ default: true })
  enabled!: boolean

  @Property({ default: true })
  rateLimitEnabled!: boolean

  @Property({ nullable: true })
  rateLimitTimeWindow?: number

  @Property({ nullable: true })
  rateLimitMax?: number

  @Property({ default: 0 })
  requestCount!: number

  @Property({ nullable: true })
  remaining?: number

  @Property({ nullable: true })
  lastRequest?: Date

  @Property({ nullable: true })
  expiresAt?: Date

  @Property({ nullable: true, type: 'text' })
  permissions?: string

  @Property({ nullable: true, type: 'text' })
  metadata?: string
}
