import {
  Collection,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  PrimaryKeyProp,
  Property,
  Ref,
} from '@mikro-orm/core'
import { IDCreatedUpdated } from '@src/db/base.entity'
import { TranslatedField } from '@src/db/i18n'
import { Process } from '@src/process/process.entity'
import { Variant } from '@src/product/variant.entity'
import { User } from './users.entity'

@Entity({ tableName: 'orgs', schema: 'public' })
export class Org extends IDCreatedUpdated {
  @Property({ type: 'json' })
  name!: TranslatedField

  @Property({ unique: true, length: 128 })
  slug!: string

  @Property({ type: 'json' })
  desc!: TranslatedField

  @Property()
  avatar_url?: string

  @Property()
  website_url?: string

  @ManyToMany(() => User, user => user.orgs)
  users = new Collection<User>(this)

  @ManyToMany(() => Variant, variant => variant.orgs)
  variants = new Collection<Variant>(this)

  @OneToMany({ mappedBy: 'org' })
  processes = new Collection<Process>(this)

  @OneToMany({ mappedBy: 'org' })
  history = new Collection<OrgHistory>(this)
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
