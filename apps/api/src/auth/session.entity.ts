import { Entity, Index, ManyToOne, Property } from '@mikro-orm/core'
import { IDCreatedUpdated } from '@src/db/base.entity'
import { User } from '@src/users/users.entity'

@Entity({ tableName: 'sessions', schema: 'auth' })
export class Session extends IDCreatedUpdated {
  @Property({ type: 'string' })
  @Index()
  token!: string

  @Property()
  expiresAt!: Date

  @Property({ nullable: true, default: null })
  ipAddress?: string | null

  @Property({ nullable: true, default: null })
  userAgent?: string | null

  @Property()
  activeOrganizationId?: string

  @Property()
  impersonatedBy?: string

  @ManyToOne(() => User)
  @Index()
  user!: User
}
