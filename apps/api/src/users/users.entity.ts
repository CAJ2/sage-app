import {
  Collection,
  Entity,
  ManyToMany,
  OneToMany,
  Property,
} from '@mikro-orm/core'
import { IDCreatedUpdated } from '@src/db/base.entity'
import { Identity } from './identity.entity'
import { Org } from './org.entity'

export interface ProfileField {
  bio?: string
}

@Entity({ tableName: 'users', schema: 'public' })
export class User extends IDCreatedUpdated {
  @Property({ unique: true, length: 1024 })
  email!: string

  @Property({ default: false })
  email_verified!: boolean

  @Property({ unique: true, length: 64 })
  username!: string

  @Property()
  given_name!: string

  @Property()
  family_name!: string

  @Property()
  avatar_url?: string

  @Property()
  last_ip?: string

  @Property()
  last_login?: Date

  @Property({ default: 0 })
  login_count!: number

  @Property()
  last_password_reset?: Date

  @Property()
  blocked!: boolean

  @Property()
  blocked_for?: string

  @Property({ type: 'json' })
  profile?: ProfileField

  @OneToMany({ mappedBy: 'user' })
  identities = new Collection<Identity>(this)

  @ManyToMany()
  orgs = new Collection<Org>(this)
}
