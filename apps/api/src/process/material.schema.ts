import { Injectable } from '@nestjs/common'
import { z } from 'zod/v4'

import { TransformInput, ZService } from '@src/common/z.service'
import { Material as MaterialEntity } from '@src/process/material.entity'
import { Material } from '@src/process/material.model'

@Injectable()
export class MaterialSchemaService {
  constructor(private readonly zService: ZService) {
    const MaterialTransform = z.transform((input: TransformInput) => {
      const entity = input.input as MaterialEntity
      const model = new Material()
      model.id = entity.id
      model.createdAt = entity.createdAt as any
      model.updatedAt = entity.updatedAt as any
      model.name = input.i18n.tr(entity.name)
      model.desc = input.i18n.tr(entity.desc)
      model.technical = entity.technical
      model.shape = entity.shape
      return model
    })
    this.zService.registerTransform(MaterialEntity, Material, MaterialTransform)
  }
}
