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
import type { Opt } from '@mikro-orm/core'

export interface ProfileField {
  bio?: string
}

@Entity({ tableName: 'users', schema: 'public' })
export class User extends IDCreatedUpdated {
  constructor(
    email: string,
    username: string,
    givenName: string,
    familyName: string,
  ) {
    super()
    this.email = email
    this.username = username
    this.given_name = givenName
    this.family_name = familyName
  }

  @Property({ unique: true, length: 1024 })
  email: string

  @Property()
  email_verified: boolean & Opt = false

  @Property({ unique: true, length: 64 })
  username: string

  @Property()
  given_name: string

  @Property()
  family_name: string

  @Property()
  avatar_url?: string

  @Property()
  last_ip?: string

  @Property()
  last_login?: Date

  @Property()
  login_count: number & Opt = 0

  @Property()
  last_password_reset?: Date

  @Property()
  blocked: boolean & Opt = false

  @Property()
  blocked_for?: string

  @Property({ type: 'json' })
  profile?: ProfileField

  @OneToMany({ mappedBy: 'user' })
  identities = new Collection<Identity>(this)

  @ManyToMany()
  orgs = new Collection<Org>(this)
}
