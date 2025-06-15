import {
  Collection,
  Entity,
  Index,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  PrimaryKeyProp,
  Property,
  Ref,
} from '@mikro-orm/core'
import { IDCreatedUpdated, Searchable } from '@src/db/base.entity'
import {
  defaultTranslatedField,
  flattenTr,
  TranslatedField,
} from '@src/db/i18n'
import { Process } from '@src/process/process.entity'
import { Variant } from '@src/product/variant.entity'
import { User } from './users.entity'
import type { EntityDTO, FromEntityType } from '@mikro-orm/core'

@Entity({ tableName: 'orgs', schema: 'public' })
export class Org extends IDCreatedUpdated implements Searchable {
  constructor(data?: Partial<EntityDTO<Org>>) {
    super()
    if (data) {
      this.assign(data as Partial<EntityDTO<FromEntityType<this>>>)
    }
  }

  @Property({ length: 128 })
  name!: string

  @Property({ unique: true, length: 128 })
  slug!: string

  @Property({ type: 'json' })
  desc: TranslatedField = defaultTranslatedField()

  @Property()
  avatar_url?: string

  @Property()
  website_url?: string

  @Property()
  metadata?: string

  @Property({ type: 'json' })
  name_translations: TranslatedField = defaultTranslatedField()

  @ManyToMany(() => User, (user) => user.orgs)
  users = new Collection<User>(this)

  @OneToMany(() => Invitation, (invitation) => invitation.org)
  invitations = new Collection<Invitation>(this)

  @ManyToMany(() => Variant, (variant) => variant.orgs)
  variants = new Collection<Variant>(this)

  @OneToMany({ mappedBy: 'org' })
  processes = new Collection<Process>(this)

  @OneToMany({ mappedBy: 'org' })
  history = new Collection<OrgHistory>(this)

  searchIndex() {
    return 'orgs'
  }

  async toSearchDoc() {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      updated_at: this.updated_at,
      avatar_url: this.avatar_url,
      ...flattenTr('desc', this.desc),
    }
  }
}

@Entity({ tableName: 'org_history', schema: 'public' })
export class OrgHistory {
  @ManyToOne({ primary: true })
  org!: Org

  @PrimaryKey()
  datetime!: Date;

  [PrimaryKeyProp]?: ['org', 'datetime']

  @ManyToOne()
  user!: Ref<User>

  @Property({ type: 'json' })
  original?: Record<string, any>

  @Property({ type: 'json' })
  changes?: Record<string, any>
}

@Entity({ tableName: 'invitations', schema: 'public' })
export class Invitation extends IDCreatedUpdated {
  @ManyToOne()
  @Index()
  inviter!: User & {}

  @ManyToOne()
  @Index()
  org!: Org

  @Property()
  email!: string

  @Property()
  role!: string

  @Property()
  status!: string

  @Property()
  expires_at!: Date
}
