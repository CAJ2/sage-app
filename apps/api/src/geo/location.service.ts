import { Injectable } from '@nestjs/common'
import { ClsService } from 'nestjs-cls'

import { RedisService } from '@src/common/redis.service'
import { RegionService } from '@src/geo/region.service'

@Injectable()
export class LocationService {
  constructor(
    private readonly cls: ClsService,
    private readonly regionService: RegionService,
    private readonly redisService: RedisService,
  ) {}

  async resolveLocation(): Promise<string[] | null> {
    if (this.cls.get('regions') !== undefined) {
      return this.cls.get('regions') as string[] | null
    }

    const raw = this.cls.get<string | undefined>('x-location')
    if (!raw) return null

    const cacheKey = this.buildCacheKey(raw)

    const cached = await this.redisService.get(cacheKey)
    if (cached !== null) {
      const parsed = JSON.parse(cached) as string[]
      this.cls.set('regions', parsed)
      return parsed
    }

    const result = await this.lookupRegion(raw)
    const ids = result ?? []

    await this.redisService.set(cacheKey, JSON.stringify(ids), 86400)
    this.cls.set('regions', ids)

    return ids
  }

  private buildCacheKey(raw: string): string {
    if (/^wof_\d+$/.test(raw)) {
      return `loc:wof:${raw}`
    }
    const parts = raw.split(',')
    const lat = parseFloat(parts[0]).toFixed(4)
    const lng = parseFloat(parts[1]).toFixed(4)
    return `loc:pt:${lat}:${lng}`
  }

  private async lookupRegion(raw: string): Promise<string[] | null> {
    if (/^wof_\d+$/.test(raw)) {
      const region = await this.regionService.findOneByID(raw)
      return region ? region.hierarchyIDs() : []
    }

    if (/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(raw)) {
      const [latStr, lngStr] = raw.split(',')
      const region = await this.regionService.findMostSpecificByPoint({
        latitude: parseFloat(latStr),
        longitude: parseFloat(lngStr),
      })
      return region ? region.hierarchyIDs() : []
    }

    return null
  }
}
