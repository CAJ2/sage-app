import { Entity, ManyToOne, Property, Ref, Unique } from '@mikro-orm/core'
import { IDCreatedUpdated } from '@src/db/base.entity'
import { User } from './users.entity'

export enum IdentityType {
  PASSWORD = 'PASSWORD',
}

@Entity({ tableName: 'identities', schema: 'auth' })
@Unique({ properties: ['user', 'provider'] })
export class Identity extends IDCreatedUpdated {
  constructor(type: IdentityType, provider: string, user: Ref<User>) {
    super()
    this.type = type
    this.provider = provider
    this.user = user
  }

  @Property({ type: 'varchar', length: 64 })
  type: IdentityType

  @Property({ length: 64 })
  provider: string

  @Property({ length: 128 })
  subject?: string

  @Property()
  password_hash?: string

  @Property()
  access_token?: string

  @Property()
  refresh_token?: string

  @Property({ type: 'json' })
  profile_data?: {}

  @Property({ type: 'json' })
  multifactor?: {}

  @ManyToOne()
  user: Ref<User>
}
