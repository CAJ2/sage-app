import { Entity, Index, ManyToOne, Property } from '@mikro-orm/core'
import { IDCreatedUpdated } from '@src/db/base.entity'
import { User } from '@src/users/users.entity'

@Entity({ tableName: 'sessions', schema: 'auth' })
export class Session extends IDCreatedUpdated {
  @Property({ type: 'string' })
  @Index()
  token!: string

  @Property()
  expires_at!: Date

  @Property({ nullable: true, default: null })
  ip_address?: string | null

  @Property({ nullable: true, default: null })
  user_agent?: string | null

  @Property()
  active_organization_id?: string

  @ManyToOne(() => User)
  @Index()
  user!: User
}
