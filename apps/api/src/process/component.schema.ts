import { Injectable } from '@nestjs/common'
import { ValidateFunction } from 'ajv'
import _ from 'lodash'
import { I18nService } from 'nestjs-i18n'
import { z } from 'zod/v4'

import type { Edit } from '@src/changes/change.model'
import { ChangeInputWithLangSchema } from '@src/changes/change.schema'
import {
  BaseSchemaService,
  ImageOrIconSchema,
  RelMetaSchema,
  zToSchema,
} from '@src/common/base.schema'
import { TrArraySchema } from '@src/common/i18n'
import { UISchemaElement } from '@src/common/ui.schema'
import { RegionIDSchema } from '@src/geo/region.model'
import { I18nTranslations } from '@src/i18n/i18n.generated'

import { ComponentPhysicalSchema, ComponentVisualSchema } from './component.entity'
import { MaterialIDSchema } from './material.model'
import { TagDefinitionIDSchema } from './tag.model'

export const ComponentIDSchema = z.string().meta({
  id: 'Component',
  name: 'Component ID',
})

@Injectable()
export class ComponentSchemaService {
  ComponentMaterialInputSchema: z.ZodObject
  ComponentTagsInputSchema: z.ZodObject
  ComponentRegionInputSchema: z.ZodObject
  CreateSchema: z.ZodObject
  CreateJSONSchema: z.core.JSONSchema.BaseSchema
  CreateValidator: ValidateFunction
  CreateUISchema: UISchemaElement
  UpdateSchema: z.ZodObject
  UpdateJSONSchema: z.core.JSONSchema.BaseSchema
  UpdateValidator: ValidateFunction
  UpdateUISchema: UISchemaElement

  constructor(
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly baseSchema: BaseSchemaService,
  ) {
    this.ComponentMaterialInputSchema = z
      .strictObject({
        id: MaterialIDSchema,
        materialFraction: z.number().min(0.000001).max(1).optional().default(1),
      })
      .meta({
        title: this.i18n.t('schemas.components.materials.item_title'),
      })

    this.ComponentTagsInputSchema = z.strictObject({
      id: TagDefinitionIDSchema,
      meta: RelMetaSchema,
    })

    this.ComponentRegionInputSchema = z.strictObject({
      id: RegionIDSchema,
    })

    this.CreateSchema = ChangeInputWithLangSchema.extend({
      name: z.string().max(1024).optional(),
      nameTr: TrArraySchema.meta({
        title: this.i18n.t('schemas.components.nameTr.title'),
      }),
      desc: z.string().max(100_000).optional(),
      descTr: TrArraySchema.meta({
        title: this.i18n.t('schemas.components.descTr.title'),
      }),
      imageURL: ImageOrIconSchema.meta({
        title: this.i18n.t('schemas.components.imageURL.title'),
      }),
      visual: ComponentVisualSchema.optional(),
      physical: ComponentPhysicalSchema.optional(),
      primaryMaterial: this.ComponentMaterialInputSchema.optional(),
      materials: this.ComponentMaterialInputSchema.array()
        .optional()
        .meta({
          title: this.i18n.t('schemas.components.materials.title'),
        }),
      tags: this.ComponentTagsInputSchema.array().optional(),
      region: this.ComponentRegionInputSchema.optional(),
    })

    this.CreateJSONSchema = zToSchema(this.CreateSchema)

    this.CreateUISchema = {
      type: 'VerticalLayout',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/nameTr',
          options: this.baseSchema.trOptionsUISchema(),
        },
        {
          type: 'Control',
          scope: '#/properties/descTr',
          options: this.baseSchema.trOptionsUISchema(),
        },
        {
          type: 'Control',
          scope: '#/properties/imageURL',
          options: this.baseSchema.imageOrIconOptionsUISchema(),
        },
        {
          type: 'Control',
          scope: '#/properties/visual',
        },
        {
          type: 'Control',
          scope: '#/properties/physical',
        },
        {
          type: 'Control',
          scope: '#/properties/primaryMaterial',
          label: this.i18n.t('schemas.components.primaryMaterial.title'),
        },
        {
          type: 'Control',
          scope: '#/properties/materials',
        },
        {
          type: 'Control',
          scope: '#/properties/tags',
        },
        {
          type: 'Control',
          scope: '#/properties/region',
        },
      ],
    }

    this.UpdateSchema = ChangeInputWithLangSchema.extend({
      id: z.string(),
      name: z.string().max(1024).optional(),
      nameTr: TrArraySchema.meta({
        title: this.i18n.t('schemas.components.nameTr.title'),
      }),
      desc: z.string().max(100_000).optional(),
      descTr: TrArraySchema.meta({
        title: this.i18n.t('schemas.components.descTr.title'),
      }),
      imageURL: ImageOrIconSchema.meta({
        title: this.i18n.t('schemas.components.imageURL.title'),
      }),
      visual: ComponentVisualSchema.optional(),
      physical: ComponentPhysicalSchema.optional(),
      primaryMaterial: this.ComponentMaterialInputSchema.optional(),
      materials: this.ComponentMaterialInputSchema.array().optional(),
      tags: this.ComponentTagsInputSchema.array().optional(),
      addTags: this.ComponentTagsInputSchema.array().optional(),
      removeTags: TagDefinitionIDSchema.array().optional(),
      region: this.ComponentRegionInputSchema.optional(),
    })

    this.UpdateJSONSchema = zToSchema(this.UpdateSchema)

    this.UpdateUISchema = {
      type: 'VerticalLayout',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/nameTr',
          options: this.baseSchema.trOptionsUISchema(),
        },
        {
          type: 'Control',
          scope: '#/properties/descTr',
          options: this.baseSchema.trOptionsUISchema(),
        },
        {
          type: 'Control',
          scope: '#/properties/imageURL',
          options: this.baseSchema.imageOrIconOptionsUISchema(),
        },
        {
          type: 'Control',
          scope: '#/properties/visual',
        },
        {
          type: 'Control',
          scope: '#/properties/physical',
        },
        {
          type: 'Control',
          scope: '#/properties/primaryMaterial',
        },
        {
          type: 'Control',
          scope: '#/properties/materials',
        },
        {
          type: 'Control',
          scope: '#/properties/tags',
        },
        {
          type: 'Control',
          scope: '#/properties/region',
        },
      ],
    }
    this.CreateValidator = this.baseSchema.ajv.compile(this.CreateJSONSchema)
    this.UpdateValidator = this.baseSchema.ajv.compile(this.UpdateJSONSchema)
  }

  async componentCreateEdit(edit: Edit) {
    const data = _.cloneDeep(edit.changes)
    this.CreateValidator(data)
    return data
  }

  async componentUpdateEdit(edit: Edit) {
    const data: Record<string, any> | undefined = _.cloneDeep(edit.changes)
    if (data) {
      data.materials = this.baseSchema.collectionToInput(
        data.component_materials || [],
        'component',
        'material',
      )
      data.tags = this.baseSchema.collectionToInput(data.componentTags || [], 'component', 'tag')
    }
    this.UpdateValidator(data)
    return data
  }
}
