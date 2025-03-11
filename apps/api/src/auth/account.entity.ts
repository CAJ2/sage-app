import { Entity, Index, ManyToOne, Property } from '@mikro-orm/postgresql'
import { IDCreatedUpdated } from '@src/db/base.entity'
import { User } from '@src/users/users.entity'

@Entity({ tableName: 'accounts', schema: 'auth' })
export class Account extends IDCreatedUpdated {
  @Property()
  account_id!: string

  @Property()
  provider_id!: string

  @Property()
  access_token?: string

  @Property()
  refresh_token?: string

  @Property()
  access_token_expires_at?: Date

  @Property()
  refresh_token_expires_at?: Date

  @Property()
  scope?: string

  @Property()
  id_token?: string

  @Property()
  password?: string

  @ManyToOne()
  @Index()
  user!: User
}
