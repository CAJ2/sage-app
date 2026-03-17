import { Module } from '@nestjs/common'

import { CommonModule } from '@src/common/common.module'
import { LocationService } from '@src/geo/location.service'
import { PlaceResolver } from '@src/geo/place.resolver'
import { PlaceSchemaService } from '@src/geo/place.schema'
import { PlaceService } from '@src/geo/place.service'
import { RegionResolver } from '@src/geo/region.resolver'
import { RegionSchemaService } from '@src/geo/region.schema'
import { RegionService } from '@src/geo/region.service'

@Module({
  imports: [CommonModule],
  providers: [
    RegionResolver,
    RegionService,
    RegionSchemaService,
    PlaceResolver,
    PlaceService,
    PlaceSchemaService,
    LocationService,
  ],
  exports: [RegionService, RegionSchemaService, PlaceService, PlaceSchemaService, LocationService],
})
export class GeoModule {}
