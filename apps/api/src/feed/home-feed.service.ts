import type { FilterQuery } from '@mikro-orm/core'
import { EntityManager } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'

import { CursorOptions } from '@src/common/transform'
import { IEntityService, IsEntityService, QueryField } from '@src/db/base.entity'
import { HomeFeed } from '@src/feed/home-feed.entity'
import { LocationService } from '@src/geo/location.service'

@Injectable()
@IsEntityService(HomeFeed)
export class HomeFeedService implements IEntityService<HomeFeed> {
  constructor(
    private readonly em: EntityManager,
    private readonly locationService: LocationService,
  ) {}

  queryFields(): Record<string, QueryField> {
    return {}
  }

  async find(opts: CursorOptions<HomeFeed>, regionId?: string, format?: string) {
    const regionSearch = await this.locationService.resolveLocation(regionId)
    const where: FilterQuery<HomeFeed> = {
      ...(regionSearch ? { region: { $in: regionSearch } } : {}),
      ...(format ? { format } : {}),
    }
    const [items, count] = await this.em.findAndCount(HomeFeed, where, {
      orderBy: { rank: 'ASC' },
      limit: opts.options.limit,
      offset: opts.options.offset,
    })
    return { items, count }
  }

  async findOneByID(id: string) {
    return this.em.findOne(HomeFeed, { id })
  }

  async findManyByID(ids: string[]) {
    return this.em.find(HomeFeed, { id: { $in: ids } })
  }
}
