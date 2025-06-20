import { Injectable } from '@nestjs/common'
import { Edit } from '@src/changes/change.model'
import { ChangeInputWithLangSchema } from '@src/changes/change.schema'
import { ChangeService } from '@src/changes/change.service'
import {
  BaseSchemaService,
  ImageOrIconSchema,
  TrArraySchema,
  zToSchema,
} from '@src/common/base.schema'
import { UISchemaElement } from '@src/common/ui.schema'
import { RegionIDSchema } from '@src/geo/region.model'
import { I18nTranslations } from '@src/i18n/i18n.generated'
import { ComponentIDSchema } from '@src/process/component.schema'
import { TagDefinitionIDSchema } from '@src/process/tag.model'
import { OrgIDSchema } from '@src/users/org.schema'
import { ValidateFunction } from 'ajv'
import _ from 'lodash'
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
    private readonly changeService: ChangeService,
  ) {
    this.CreateSchema = ChangeInputWithLangSchema.extend({
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

    this.CreateJSONSchema = zToSchema(this.CreateSchema)

    this.CreateUISchema = {
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

    this.UpdateSchema = ChangeInputWithLangSchema.extend({
      id: VariantIDSchema,
      name: z.string().max(1024).optional(),
      name_tr: TrArraySchema,
      desc: z.string().max(100_000).optional(),
      desc_tr: TrArraySchema,
      image_url: ImageOrIconSchema,
      items: z.array(VariantItemsInputSchema).optional(),
      add_items: z.array(VariantItemsInputSchema).optional(),
      remove_items: z.array(VariantItemsInputSchema).optional(),
      region_id: RegionIDSchema.optional(),
      regions: z.array(VariantRegionsInputSchema).optional(),
      add_regions: z.array(VariantRegionsInputSchema).optional(),
      remove_regions: z.array(VariantRegionsInputSchema).optional(),
      code: z.string().max(1024).optional(),
      orgs: z.array(VariantOrgsInputSchema).optional(),
      add_orgs: z.array(VariantOrgsInputSchema).optional(),
      remove_orgs: z.array(VariantOrgsInputSchema).optional(),
      tags: z.array(VariantTagsInputSchema).optional(),
      add_tags: z.array(VariantTagsInputSchema).optional(),
      remove_tags: z.array(VariantTagsInputSchema).optional(),
      components: z.array(VariantComponentsInputSchema).optional(),
      add_components: z.array(VariantComponentsInputSchema).optional(),
      remove_components: z.array(VariantComponentsInputSchema).optional(),
    })

    this.UpdateJSONSchema = zToSchema(this.UpdateSchema)

    this.UpdateUISchema = {
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
    this.CreateValidator = this.baseSchema.ajv.compile(this.CreateJSONSchema)
    this.UpdateValidator = this.baseSchema.ajv.compile(this.UpdateJSONSchema)
    this.changeService.registerEditValidator(
      'Variant',
      'create',
      this.variantCreateEdit.bind(this),
    )
    this.changeService.registerEditValidator(
      'Variant',
      'update',
      this.variantUpdateEdit.bind(this),
    )
  }

  async variantCreateEdit(edit: Edit) {
    const data = _.cloneDeep(edit.changes)
    this.CreateValidator(data)
    this.baseSchema.flattenRefs(data)
    return data
  }

  async variantUpdateEdit(edit: Edit) {
    const data = _.cloneDeep(edit.changes)
    this.UpdateValidator(data)
    this.baseSchema.flattenRefs(data)
    return data
  }
}
