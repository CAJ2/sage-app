import { Entity, Index, ManyToOne, Property } from '@mikro-orm/core'
import type { Ref } from '@mikro-orm/core'

import type { TranslatedField } from '@src/common/i18n'
import { IDCreatedUpdated } from '@src/db/base.entity'
import { Region } from '@src/geo/region.entity'

@Entity({ tableName: 'home_feed', schema: 'public' })
@Index({ properties: ['region', 'rank'] })
export class HomeFeed extends IDCreatedUpdated {
  @ManyToOne({ nullable: true })
  region?: Ref<Region>

  @Property()
  rank!: number

  @Property()
  format!: string

  @Property({ type: 'json', nullable: true })
  category?: TranslatedField

  @Property({ type: 'json' })
  title!: TranslatedField

  @Property({ type: 'json', nullable: true })
  content?: { markdown?: TranslatedField }

  @Property({ type: 'json', nullable: true })
  links?: {
    link?: { entityName: string; id: string }
    externalLink?: {
      url: string
      openGraph?: {
        title?: string
        description?: string
        image?: string
        siteName?: string
      }
    }
  }
}
