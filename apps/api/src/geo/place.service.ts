import { EntityManager } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'
import { mapOrderBy } from '@src/common/db.utils'
import { CursorOptions } from '@src/common/transform'
import { Tag } from '@src/process/tag.entity'
import { Place, PlacesTag } from './place.entity'

@Injectable()
export class PlaceService {
  constructor(private readonly em: EntityManager) {}

  async find(opts: CursorOptions<Place>) {
    const places = await this.em.find(Place, opts.where, opts.options)
    const count = await this.em.count(Place, opts.where)
    return {
      items: places,
      count,
    }
  }

  async findOneByID(id: string) {
    return await this.em.findOne(
      Place,
      { id },
      { populate: ['org', 'place_tags'] },
    )
  }

  async tags(placeID: string) {
    const tagDefs = await this.em.find(Tag, { places: placeID })
    const tags = await this.em.find(
      PlacesTag,
      { place: placeID },
      {
        orderBy: { tag: 'ASC' },
      },
    )
    const combinedTags = []
    for (const tag of tags) {
      const tagDef = tagDefs.find((t) => t.id === tag.tag.id)
      if (tagDef) {
        tagDef.meta = tag.meta
        combinedTags.push(tagDef)
      }
    }
    return combinedTags
  }

  async tagsPage(placeID: string, opts: CursorOptions<Tag>) {
    opts.where.places = this.em.getReference(Place, placeID)
    const tagDefs = await this.em.find(Tag, opts.where, opts.options)
    const tags = await this.em.find(
      PlacesTag,
      { place: placeID },
      {
        orderBy: mapOrderBy(opts.options.orderBy, { id: 'tag' }),
        limit: opts.options.limit,
      },
    )
    const combinedTags = []
    for (const tag of tags) {
      const tagDef = tagDefs.find((t) => t.id === tag.tag.id)
      if (tagDef) {
        tagDef.meta = tag.meta
        combinedTags.push(tagDef)
      }
    }
    const count = await this.em.count(PlacesTag, { place: opts.where.places })
    return {
      items: combinedTags,
      count,
    }
  }

  async org(placeID: string, place?: Place) {
    if (place && place.org) {
      return place.org.load()
    }
    return null
  }
}
