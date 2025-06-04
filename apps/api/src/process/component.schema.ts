import { Injectable } from '@nestjs/common'
import { ChangeInputWithLangSchema } from '@src/changes/change.schema'
import { UISchemaElement } from '@src/common/ui.schema'
import { RegionIDSchema } from '@src/geo/region.model'
import { TranslatedInputSchema } from '@src/graphql/base.model'
import { I18nTranslations } from '@src/i18n/i18n.generated'
import { I18nService } from 'nestjs-i18n'
import { z } from 'zod/v4'
import { MaterialIDSchema } from './material.model'
import { TagDefinitionIDSchema } from './tag.model'

export const ComponentIDSchema = z.nanoid().meta({
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

  constructor(private readonly i18n: I18nService<I18nTranslations>) {
    this.ComponentMaterialInputSchema = z.strictObject({
      id: MaterialIDSchema,
      material_fraction: z.number().min(0).max(1).optional(),
    })

    this.ComponentTagsInputSchema = z.strictObject({
      id: TagDefinitionIDSchema,
      meta: z.record(z.string(), z.json()).optional(),
    })

    this.ComponentRegionInputSchema = z.strictObject({
      id: RegionIDSchema,
    })

    this.CreateComponentInputSchema = ChangeInputWithLangSchema.extend({
      name: z.string().max(1024),
      name_tr: z.array(TranslatedInputSchema).optional(),
      desc: z.string().max(100_000).optional(),
      desc_tr: z.array(TranslatedInputSchema).optional(),
      image_url: z
        .string()
        .optional()
        .meta({
          title: this.i18n.t('schemas.components.image_url.title'),
        }),
      primary_material: this.ComponentMaterialInputSchema.optional(),
      materials: this.ComponentMaterialInputSchema.array().optional(),
      tags: this.ComponentTagsInputSchema.array().optional(),
      region: this.ComponentRegionInputSchema.optional(),
    })

    this.CreateComponentInputJSONSchema = z.toJSONSchema(
      this.CreateComponentInputSchema,
    )

    this.CreateComponentInputUISchema = {
      type: 'VerticalLayout',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/name',
        },
        {
          type: 'Control',
          scope: '#/properties/name_tr',
        },
        {
          type: 'Control',
          scope: '#/properties/desc',
        },
        {
          type: 'Control',
          scope: '#/properties/desc_tr',
        },
        {
          type: 'Control',
          scope: '#/properties/image_url',
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

    this.UpdateComponentInputSchema = ChangeInputWithLangSchema.extend({
      id: z.nanoid(),
      name: z.string().max(1024).optional(),
      desc: z.string().max(100_000).optional(),
      image_url: z.string().optional(),
      primary_material: this.ComponentMaterialInputSchema.optional(),
      materials: this.ComponentMaterialInputSchema.array().optional(),
      add_tags: this.ComponentTagsInputSchema.array().optional(),
      remove_tags: this.ComponentTagsInputSchema.array().optional(),
      region: this.ComponentRegionInputSchema.optional(),
    })

    this.UpdateComponentInputJSONSchema = z.toJSONSchema(
      this.UpdateComponentInputSchema,
    )

    this.UpdateComponentInputUISchema = {
      type: 'VerticalLayout',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/id',
        },
        {
          type: 'Control',
          scope: '#/properties/name',
        },
        {
          type: 'Control',
          scope: '#/properties/name_tr',
        },
        {
          type: 'Control',
          scope: '#/properties/desc',
        },
        {
          type: 'Control',
          scope: '#/properties/desc_tr',
        },
        {
          type: 'Control',
          scope: '#/properties/image_url',
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
          scope: '#/properties/add_tags',
        },
        {
          type: 'Control',
          scope: '#/properties/remove_tags',
        },
        {
          type: 'Control',
          scope: '#/properties/region',
        },
      ],
    }
  }
}
