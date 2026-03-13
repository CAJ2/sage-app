import { Injectable } from '@nestjs/common'
import { DateTime } from 'luxon'
import { z } from 'zod/v4'

import { TransformInput, ZService } from '@src/common/z.service'
import { Region as RegionEntity } from '@src/geo/region.entity'
import { Region } from '@src/geo/region.model'

@Injectable()
export class RegionSchemaService {
  constructor(private readonly zService: ZService) {
    const RegionTransform = z.transform((input: TransformInput) => {
      const entity = input.input as RegionEntity
      const model = new Region()
      model.id = entity.id
      model.createdAt = DateTime.fromJSDate(entity.createdAt)
      model.updatedAt = DateTime.fromJSDate(entity.updatedAt)
      model.name = input.i18n.tr(entity.name)
      model.placetype = entity.placetype
      if (entity.properties && entity.properties['geom:bbox']) {
        model.bbox = entity.properties['geom:bbox'].split(',').map(Number)
      }
      if (entity.properties && entity.properties['lbl:min_zoom']) {
        model.minZoom = Number(entity.properties['lbl:min_zoom'])
      }
      return model
    })
    this.zService.registerEntityTransform(RegionEntity, Region, RegionTransform)
  }
}
