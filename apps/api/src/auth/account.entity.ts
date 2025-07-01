import { Entity, Index, ManyToOne, Property } from '@mikro-orm/postgresql'
import { IDCreatedUpdated } from '@src/db/base.entity'
import { User } from '@src/users/users.entity'

@Entity({ tableName: 'accounts', schema: 'auth' })
export class Account extends IDCreatedUpdated {
  @Property()
  accountId!: string

  @Property()
  providerId!: string

  @Property()
  accessToken?: string

  @Property()
  refreshToken?: string

  @Property()
  accessTokenExpiresAt?: Date

  @Property()
  refreshTokenExpiresAt?: Date

  @Property()
  scope?: string

  @Property()
  idToken?: string

  @Property()
  password?: string

  @ManyToOne()
  @Index()
  user!: User
}
