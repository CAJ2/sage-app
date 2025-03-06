import {
  BaseEntity,
  Collection,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  PrimaryKeyProp,
  Property,
  Ref,
} from '@mikro-orm/core'
import { CreatedUpdated, IDCreatedUpdated } from '@src/db/base.entity'
import { TranslatedField } from '@src/db/i18n'
import { Process } from '@src/process/process.entity'
import { Org } from '@src/users/org.entity'
import { User } from '@src/users/users.entity'

@Entity({ tableName: 'places', schema: 'public' })
@Index({ properties: ['location'], type: 'gist' })
export class Place extends IDCreatedUpdated {
  @Property({ type: 'json' })
  name!: TranslatedField

  @Property({ type: 'json' })
  address!: TranslatedField

  @Property({ type: 'json' })
  desc?: TranslatedField

  @Property({ type: 'geography(point)' })
  location!: string

  @ManyToOne()
  org?: Ref<Org>

  @OneToMany({ mappedBy: 'place' })
  tags = new Collection<PlaceTag>(this)

  @OneToMany({ mappedBy: 'place' })
  processes = new Collection<Process>(this)

  @OneToMany({ mappedBy: 'place' })
  history = new Collection<PlaceHistory>(this)
}

@Entity({ tableName: 'place_tags', schema: 'public' })
export class PlaceTag extends CreatedUpdated {
  @ManyToOne({ primary: true })
  place!: Place

  @PrimaryKey()
  tag_name!: string;

  [PrimaryKeyProp]?: ['place', 'tag_name']
}

@Entity({ tableName: 'place_history', schema: 'public' })
export class PlaceHistory extends BaseEntity {
  @ManyToOne({ primary: true })
  place!: Place

  @PrimaryKey()
  datetime!: Date;

  [PrimaryKeyProp]?: ['place', 'datetime']

  @ManyToOne()
  user!: Ref<User>

  @Property({ type: 'json' })
  original?: Record<string, any>

  @Property({ type: 'json' })
  changes?: Record<string, any>
}
