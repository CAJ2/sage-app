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

  async resolveLocation(regionID?: string): Promise<string[] | null> {
    if (!regionID && this.cls.get('regions') !== undefined) {
      return this.cls.get('regions') as string[] | null
    }

    const raw = regionID ?? this.cls.get<string | undefined>('x-location')
    if (!raw) return null

    const cacheKey = this.buildCacheKey(raw)

    const cached = await this.redisService.get(cacheKey)
    if (cached !== null) {
      const parsed = JSON.parse(cached) as string[]
      if (!regionID) this.cls.set('regions', parsed)
      return parsed
    }

    const result = await this.lookupRegion(raw)
    const ids = result ?? []

    await this.redisService.set(cacheKey, JSON.stringify(ids), 86400)
    if (!regionID) this.cls.set('regions', ids)

    return ids
  }

  private isCoordinate(raw: string): boolean {
    return /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(raw)
  }

  private buildCacheKey(raw: string): string {
    if (this.isCoordinate(raw)) {
      const parts = raw.split(',')
      const lat = parseFloat(parts[0]).toFixed(4)
      const lng = parseFloat(parts[1]).toFixed(4)
      return `loc:pt:${lat}:${lng}`
    }
    return `loc:${raw}`
  }

  private async lookupRegion(raw: string): Promise<string[] | null> {
    if (this.isCoordinate(raw)) {
      const [latStr, lngStr] = raw.split(',')
      const region = await this.regionService.findMostSpecificByPoint({
        latitude: parseFloat(latStr),
        longitude: parseFloat(lngStr),
      })
      return region ? region.hierarchyIDs() : []
    }

    const region = await this.regionService.findOneByID(raw)
    return region ? region.hierarchyIDs() : []
  }
}
