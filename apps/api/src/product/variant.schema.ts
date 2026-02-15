import { Injectable } from '@nestjs/common'
import type { Edit } from '@src/changes/change.model'
import { ChangeInputWithLangSchema } from '@src/changes/change.schema'
import { BaseSchemaService, ImageOrIconSchema, zToSchema } from '@src/common/base.schema'
import { TrArraySchema } from '@src/common/i18n'
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
  ) {
    this.CreateSchema = ChangeInputWithLangSchema.extend({
      name: z.string().max(1024).optional(),
      nameTr: TrArraySchema,
      desc: z.string().max(100_000).optional(),
      descTr: TrArraySchema,
      imageURL: ImageOrIconSchema,
      items: z.array(VariantItemsInputSchema).optional(),
      regionID: RegionIDSchema.optional(),
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
          scope: '#/properties/items',
        },
        {
          type: 'Control',
          scope: '#/properties/regionID',
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
      nameTr: TrArraySchema,
      desc: z.string().max(100_000).optional(),
      descTr: TrArraySchema,
      imageURL: ImageOrIconSchema,
      items: z.array(VariantItemsInputSchema).optional(),
      addItems: z.array(VariantItemsInputSchema).optional(),
      removeItems: z.array(ItemIDSchema).optional(),
      regionID: RegionIDSchema.optional(),
      regions: z.array(VariantRegionsInputSchema).optional(),
      addRegions: z.array(VariantRegionsInputSchema).optional(),
      removeRegions: z.array(RegionIDSchema).optional(),
      code: z.string().max(1024).optional(),
      orgs: z.array(VariantOrgsInputSchema).optional(),
      addOrgs: z.array(VariantOrgsInputSchema).optional(),
      removeOrgs: z.array(OrgIDSchema).optional(),
      tags: z.array(VariantTagsInputSchema).optional(),
      addTags: z.array(VariantTagsInputSchema).optional(),
      removeTags: z.array(TagDefinitionIDSchema).optional(),
      components: z.array(VariantComponentsInputSchema).optional(),
      addComponents: z.array(VariantComponentsInputSchema).optional(),
      removeComponents: z.array(ComponentIDSchema).optional(),
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
          scope: '#/properties/items',
        },
        {
          type: 'Control',
          scope: '#/properties/regionID',
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
  }

  async variantCreateEdit(edit: Edit) {
    const data = _.cloneDeep(edit.changes)
    this.CreateValidator(data)
    return data
  }

  async variantUpdateEdit(edit: Edit) {
    const data: Record<string, any> | undefined = _.cloneDeep(edit.changes)
    if (data) {
      data.items = this.baseSchema.collectionToInput(data.addItems || [], 'variant', 'item')
      data.orgs = this.baseSchema.collectionToInput(data.variant_orgs || [], 'variant', 'org')
      data.tags = this.baseSchema.collectionToInput(data.variant_tags || [], 'variant', 'tag')
      data.components = this.baseSchema.collectionToInput(
        data.variant_components || [],
        'variant',
        'component',
      )
    }
    this.UpdateValidator(data)
    return data
  }
}
