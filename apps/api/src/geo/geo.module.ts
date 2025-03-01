import { Module } from '@nestjs/common'
import { DB } from '@src/db.service'
import { PlaceResolver } from './place.resolver'
import { PlaceService } from './place.service'
import { RegionResolver } from './region.resolver'
import { RegionService } from './region.service'

@Module({
  providers: [DB, RegionResolver, RegionService, PlaceResolver, PlaceService],
})
export class GeoModule {}
