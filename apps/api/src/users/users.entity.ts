import {
  Collection,
  Entity,
  Index,
  ManyToMany,
  ManyToOne,
  OneToMany,
  Property,
} from '@mikro-orm/core'
import { Account } from '@src/auth/account.entity'
import { Session } from '@src/auth/session.entity'
import { IDCreatedUpdated } from '@src/db/base.entity'
import { Org } from './org.entity'
import type { Opt } from '@mikro-orm/core'

export interface ProfileField {
  bio?: string
}

@Entity({ tableName: 'users', schema: 'public' })
export class User extends IDCreatedUpdated {
  constructor(email: string, username: string, name: string) {
    super()
    this.email = email
    this.username = username
    this.name = name
  }

  @Property({ unique: true, length: 1024 })
  email: string

  @Property()
  email_verified: boolean & Opt = false

  @Property({ unique: true, length: 64 })
  username: string

  @Property({ length: 64 })
  display_username!: string

  @Property()
  name: string

  @Property()
  avatar_url?: string

  @Property()
  lang?: string

  @Property({ type: 'json' })
  profile?: ProfileField

  @Property()
  banned: boolean & Opt = false

  @Property()
  ban_reason?: string

  @Property({ type: 'timestamptz', nullable: true })
  ban_expires?: number

  @Property()
  role?: string

  @OneToMany({ mappedBy: 'user' })
  sessions = new Collection<Session>(this)

  @OneToMany({ mappedBy: 'user' })
  accounts = new Collection<Account>(this)

  @ManyToMany({ entity: () => Org, pivotEntity: () => UsersOrgs })
  orgs = new Collection<Org>(this)
}

export enum UserOrgRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

@Entity({ tableName: 'users_orgs', schema: 'public' })
export class UsersOrgs extends IDCreatedUpdated {
  @ManyToOne()
  @Index({ name: 'users_orgs_user_id_index' })
  user!: User

  @ManyToOne()
  @Index({ name: 'users_orgs_org_id_index' })
  org!: Org & {}

  @Property({ type: 'varchar' })
  role: UserOrgRole & Opt = UserOrgRole.MEMBER
}
