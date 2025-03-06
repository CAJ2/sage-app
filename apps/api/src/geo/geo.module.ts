import { Module } from '@nestjs/common'
import { PlaceResolver } from './place.resolver'
import { PlaceService } from './place.service'
import { RegionResolver } from './region.resolver'
import { RegionService } from './region.service'

@Module({
  providers: [RegionResolver, RegionService, PlaceResolver, PlaceService],
})
export class GeoModule {}
