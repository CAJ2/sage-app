import { Injectable } from '@nestjs/common'
import { ChangeInputWithLangSchema } from '@src/changes/change.schema'
import { BaseSchemaService, zToSchema } from '@src/common/base.schema'
import { UISchemaElement } from '@src/common/ui.schema'
import { RegionIDSchema } from '@src/geo/region.model'
import { ImageOrIconSchema, TrArraySchema } from '@src/graphql/base.model'
import { I18nTranslations } from '@src/i18n/i18n.generated'
import { ComponentIDSchema } from '@src/process/component.schema'
import { TagDefinitionIDSchema } from '@src/process/tag.model'
import { OrgIDSchema } from '@src/users/org.schema'
import { I18nService } from 'nestjs-i18n'
import { z } from 'zod/v4'
import { ItemIDSchema } from './item.schema'
import { VariantComponentUnitSchema } from './variant.entity'

export const VariantIDSchema = z.string().meta({
  id: 'Variant',
  name: 'Variant ID',
})

export const VariantItemsInputSchema = z.strictObject({
  id: ItemIDSchema,
})

export const VariantOrgsInputSchema = z.strictObject({
  id: OrgIDSchema,
})

export const VariantTagsInputSchema = z.strictObject({
  id: TagDefinitionIDSchema,
})

export const VariantRegionsInputSchema = z.strictObject({
  id: RegionIDSchema,
})

export const VariantComponentsInputSchema = z.strictObject({
  id: ComponentIDSchema,
  quantity: z.number().min(0).optional(),
  unit: VariantComponentUnitSchema.optional(),
})

@Injectable()
export class VariantSchemaService {
  CreateVariantInputSchema: z.ZodObject<any>
  CreateVariantInputJSONSchema: z.core.JSONSchema.BaseSchema
  CreateVariantInputUISchema: UISchemaElement
  UpdateVariantInputSchema: z.ZodObject<any>
  UpdateVariantInputJSONSchema: z.core.JSONSchema.BaseSchema
  UpdateVariantInputUISchema: UISchemaElement

  constructor(
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly baseSchema: BaseSchemaService,
  ) {
    this.CreateVariantInputSchema = ChangeInputWithLangSchema.extend({
      name: z.string().max(1024).optional(),
      name_tr: TrArraySchema,
      desc: z.string().max(100_000).optional(),
      desc_tr: TrArraySchema,
      image_url: ImageOrIconSchema,
      items: z.array(VariantItemsInputSchema).optional(),
      region_id: RegionIDSchema.optional(),
      regions: z.array(VariantRegionsInputSchema).optional(),
      code: z.string().max(1024).optional(),
      orgs: z.array(VariantOrgsInputSchema).optional(),
      tags: z.array(VariantTagsInputSchema).optional(),
      components: z.array(VariantComponentsInputSchema).optional(),
    })

    this.CreateVariantInputJSONSchema = zToSchema(this.CreateVariantInputSchema)

    this.CreateVariantInputUISchema = {
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
          scope: '#/properties/items',
        },
        {
          type: 'Control',
          scope: '#/properties/region_id',
        },
        {
          type: 'Control',
          scope: '#/properties/regions',
        },
        {
          type: 'Control',
          scope: '#/properties/code',
        },
        {
          type: 'Control',
          scope: '#/properties/orgs',
        },
        {
          type: 'Control',
          scope: '#/properties/tags',
        },
        {
          type: 'Control',
          scope: '#/properties/components',
        },
      ],
    }

    this.UpdateVariantInputSchema = ChangeInputWithLangSchema.extend({
      id: VariantIDSchema,
      name: z.string().max(1024).optional(),
      name_tr: TrArraySchema,
      desc: z.string().max(100_000).optional(),
      desc_tr: TrArraySchema,
      image_url: ImageOrIconSchema,
      add_items: z.array(VariantItemsInputSchema).optional(),
      remove_items: z.array(VariantItemsInputSchema).optional(),
      region_id: RegionIDSchema.optional(),
      add_regions: z.array(VariantRegionsInputSchema).optional(),
      remove_regions: z.array(VariantRegionsInputSchema).optional(),
      code: z.string().max(1024).optional(),
      add_orgs: z.array(VariantOrgsInputSchema).optional(),
      remove_orgs: z.array(VariantOrgsInputSchema).optional(),
      add_tags: z.array(VariantTagsInputSchema).optional(),
      remove_tags: z.array(VariantTagsInputSchema).optional(),
      add_components: z.array(VariantComponentsInputSchema).optional(),
      remove_components: z.array(VariantComponentsInputSchema).optional(),
    })

    this.UpdateVariantInputJSONSchema = zToSchema(this.UpdateVariantInputSchema)

    this.UpdateVariantInputUISchema = {
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
          scope: '#/properties/add_items',
        },
        {
          type: 'Control',
          scope: '#/properties/remove_items',
        },
        {
          type: 'Control',
          scope: '#/properties/region_id',
        },
        {
          type: 'Control',
          scope: '#/properties/add_regions',
        },
        {
          type: 'Control',
          scope: '#/properties/remove_regions',
        },
        {
          type: 'Control',
          scope: '#/properties/code',
        },
        {
          type: 'Control',
          scope: '#/properties/add_orgs',
        },
        {
          type: 'Control',
          scope: '#/properties/remove_orgs',
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
          scope: '#/properties/add_components',
        },
        {
          type: 'Control',
          scope: '#/properties/remove_components',
        },
      ],
    }
  }
}
