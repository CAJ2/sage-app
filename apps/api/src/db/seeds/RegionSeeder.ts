import type { EntityManager } from '@mikro-orm/core'
import { Seeder } from '@mikro-orm/seeder'

import { MultiPolygon } from '@src/db/custom.types'
import { Region } from '@src/geo/region.entity'

export const REGION_IDS = ['wof_102087579', 'wof_85688637', 'wof_85633793']

function bboxToMultiPolygon(
  minLon: number,
  minLat: number,
  maxLon: number,
  maxLat: number,
): MultiPolygon {
  return new MultiPolygon(
    `SRID=4326;MULTIPOLYGON(((${minLon} ${minLat},${maxLon} ${minLat},${maxLon} ${maxLat},${minLon} ${maxLat},${minLon} ${minLat})))`,
  )
}

export class RegionSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    // USA (admin_level=2)
    em.create(Region, {
      id: 'wof_85633793',
      name: { en: 'United States' },
      placetype: 'country',
      adminLevel: 2,
      geo: bboxToMultiPolygon(-179.231086, 18.86546, 179.859681, 71.441059),
      properties: {
        hierarchy: [],
        'geom:bbox': '-179.231086,18.86546,179.859681,71.441059',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // California (admin_level=4)
    em.create(Region, {
      id: 'wof_85688637',
      name: { en: 'California' },
      placetype: 'region',
      adminLevel: 4,
      geo: bboxToMultiPolygon(-124.482003, 32.528832, -114.131211, 42.009517),
      properties: {
        hierarchy: [{ admin_level: 2, id: 85633793, placetype: 'country' }],
        'geom:bbox': '-124.482003,32.528832,-114.131211,42.009517',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // San Francisco county (admin_level=6)
    em.create(Region, {
      id: 'wof_102087579',
      name: { en: 'San Francisco' },
      placetype: 'county',
      adminLevel: 6,
      geo: bboxToMultiPolygon(-123.173825, 37.63983, -122.28178, 37.929824),
      properties: {
        hierarchy: [
          { admin_level: 2, id: 85633793, placetype: 'country' },
          { admin_level: 4, id: 85688637, placetype: 'region' },
        ],
        'geom:bbox': '-123.173825,37.63983,-122.28178,37.929824',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await em.flush()
  }
}
