import { Injectable } from '@nestjs/common'
import { ChangeInputWithLangSchema } from '@src/changes/change.schema'
import {
  BaseSchemaService,
  ImageOrIconSchema,
  RelMetaSchema,
  TrArraySchema,
  zToSchema,
} from '@src/common/base.schema'
import { UISchemaElement } from '@src/common/ui.schema'
import { RegionIDSchema } from '@src/geo/region.model'
import { I18nTranslations } from '@src/i18n/i18n.generated'
import { I18nService } from 'nestjs-i18n'
import { z } from 'zod/v4'
import {
  ComponentPhysicalSchema,
  ComponentVisualSchema,
} from './component.entity'
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
  CreateComponentInputSchema: z.ZodObject
  CreateComponentInputJSONSchema: z.core.JSONSchema.BaseSchema
  CreateComponentInputUISchema: UISchemaElement
  UpdateComponentInputSchema: z.ZodObject
  UpdateComponentInputJSONSchema: z.core.JSONSchema.BaseSchema
  UpdateComponentInputUISchema: UISchemaElement

  constructor(
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly baseSchema: BaseSchemaService,
  ) {
    this.ComponentMaterialInputSchema = z
      .strictObject({
        id: MaterialIDSchema,
        material_fraction: z
          .number()
          .min(0.000001)
          .max(1)
          .optional()
          .default(1),
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

    this.CreateComponentInputSchema = ChangeInputWithLangSchema.extend({
      name: z.string().max(1024),
      name_tr: TrArraySchema.meta({
        title: this.i18n.t('schemas.components.name_tr.title'),
      }),
      desc: z.string().max(100_000).optional(),
      desc_tr: TrArraySchema.meta({
        title: this.i18n.t('schemas.components.desc_tr.title'),
      }),
      image_url: ImageOrIconSchema.meta({
        title: this.i18n.t('schemas.components.image_url.title'),
      }),
      visual: ComponentVisualSchema.optional(),
      physical: ComponentPhysicalSchema.optional(),
      primary_material: this.ComponentMaterialInputSchema.optional(),
      materials: this.ComponentMaterialInputSchema.array()
        .optional()
        .meta({
          title: this.i18n.t('schemas.components.materials.title'),
        }),
      tags: this.ComponentTagsInputSchema.array().optional(),
      region: this.ComponentRegionInputSchema.optional(),
    })

    this.CreateComponentInputJSONSchema = zToSchema(
      this.CreateComponentInputSchema,
    )

    this.CreateComponentInputUISchema = {
      type: 'VerticalLayout',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/name_tr',
          options: this.baseSchema.trOptionsUISchema(),
        },
        {
          type: 'Control',
          scope: '#/properties/desc_tr',
          options: this.baseSchema.trOptionsUISchema(),
        },
        {
          type: 'Control',
          scope: '#/properties/image_url',
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
          scope: '#/properties/primary_material',
          label: this.i18n.t('schemas.components.primary_material.title'),
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

    this.UpdateComponentInputSchema = ChangeInputWithLangSchema.extend({
      id: z.string(),
      name: z.string().max(1024).optional(),
      name_tr: TrArraySchema.meta({
        title: this.i18n.t('schemas.components.name_tr.title'),
      }),
      desc: z.string().max(100_000).optional(),
      desc_tr: TrArraySchema.meta({
        title: this.i18n.t('schemas.components.desc_tr.title'),
      }),
      image_url: ImageOrIconSchema.meta({
        title: this.i18n.t('schemas.components.image_url.title'),
      }),
      visual: ComponentVisualSchema.optional(),
      physical: ComponentPhysicalSchema.optional(),
      primary_material: this.ComponentMaterialInputSchema.optional(),
      materials: this.ComponentMaterialInputSchema.array().optional(),
      tags: this.ComponentTagsInputSchema.array().optional(),
      add_tags: this.ComponentTagsInputSchema.array().optional(),
      remove_tags: this.ComponentTagsInputSchema.array().optional(),
      region: this.ComponentRegionInputSchema.optional(),
    })

    this.UpdateComponentInputJSONSchema = zToSchema(
      this.UpdateComponentInputSchema,
    )

    this.UpdateComponentInputUISchema = {
      type: 'VerticalLayout',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/id',
          label: 'ID',
          options: {
            readonly: true,
          },
        },
        {
          type: 'Control',
          scope: '#/properties/name_tr',
          options: this.baseSchema.trOptionsUISchema(),
        },
        {
          type: 'Control',
          scope: '#/properties/desc_tr',
          options: this.baseSchema.trOptionsUISchema(),
        },
        {
          type: 'Control',
          scope: '#/properties/image_url',
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
          scope: '#/properties/primary_material',
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
  }
}
