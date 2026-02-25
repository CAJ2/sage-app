import { Module } from '@nestjs/common'

import { CommonModule } from '@src/common/common.module'
import { PlaceResolver } from '@src/geo/place.resolver'
import { PlaceService } from '@src/geo/place.service'
import { RegionResolver } from '@src/geo/region.resolver'
import { RegionService } from '@src/geo/region.service'

@Module({
  imports: [CommonModule],
  providers: [RegionResolver, RegionService, PlaceResolver, PlaceService],
  exports: [RegionService, PlaceService],
})
export class GeoModule {}
