import { Module } from '@nestjs/common'

import { CommonModule } from '@src/common/common.module'

import { PlaceResolver } from './place.resolver'
import { PlaceService } from './place.service'
import { RegionResolver } from './region.resolver'
import { RegionService } from './region.service'

@Module({
  imports: [CommonModule],
  providers: [RegionResolver, RegionService, PlaceResolver, PlaceService],
  exports: [RegionService, PlaceService],
})
export class GeoModule {}
