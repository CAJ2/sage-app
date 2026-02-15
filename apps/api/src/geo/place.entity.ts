import {
  BaseEntity,
  Collection,
  Entity,
  Index,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  PrimaryKeyProp,
  Property,
} from '@mikro-orm/core'
import type { Ref } from '@mikro-orm/core'
import type { TranslatedField } from '@src/common/i18n'
import { CreatedUpdated } from '@src/db/base.entity'
import { Point, PointType } from '@src/db/custom.types'
import { Process } from '@src/process/process.entity'
import { Tag } from '@src/process/tag.entity'
import { Org } from '@src/users/org.entity'
import { User } from '@src/users/users.entity'

@Entity({ tableName: 'places', schema: 'public' })
@Index({ properties: ['location'], type: 'gist' })
export class Place extends CreatedUpdated {
  @PrimaryKey()
  id!: string

  @Property({ type: 'json' })
  name!: TranslatedField

  @Property({ type: 'json' })
  address?: TranslatedField

  @Property({ type: 'json' })
  desc?: TranslatedField

  @Property({ type: PointType })
  location!: Point

  @ManyToOne()
  org?: Ref<Org>

  @Property({ type: 'json' })
  osm?: {}

  @ManyToMany({ entity: () => Tag, pivotEntity: () => PlacesTag })
  tags = new Collection<Tag>(this)

  @OneToMany({
    entity: () => PlacesTag,
    mappedBy: (pt) => pt.place,
    orphanRemoval: true,
  })
  place_tags = new Collection<PlacesTag>(this)

  @OneToMany({ mappedBy: 'place' })
  processes = new Collection<Process>(this)

  @OneToMany({ mappedBy: 'place' })
  history = new Collection<PlaceHistory>(this)
}

@Entity({ tableName: 'places_tags', schema: 'public' })
export class PlacesTag extends BaseEntity {
  @ManyToOne({ primary: true })
  place!: Place

  @ManyToOne({ primary: true })
  tag!: Tag & {}

  @Property({ type: 'json' })
  meta?: Record<string, any>
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
