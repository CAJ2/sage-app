import { Injectable } from '@nestjs/common'
import { ValidateFunction } from 'ajv'
import _ from 'lodash'
import { DateTime } from 'luxon'
import { z } from 'zod/v4'

import { DeleteInput } from '@src/changes/change-ext.model'
import type { Edit } from '@src/changes/change.model'
import { ChangeInputWithLangSchema, DeleteInputSchema } from '@src/changes/change.schema'
import {
  BaseSchemaService,
  ImageOrIconSchema,
  RelMetaSchema,
  runAjvValidator,
  stripNulls,
  zToSchema,
} from '@src/common/base.schema'
import { TrArraySchema } from '@src/common/i18n'
import { I18nService } from '@src/common/i18n.service'
import { UISchemaElement } from '@src/common/ui.schema'
import { TransformInput, ZService } from '@src/common/z.service'
import { RegionIDSchema } from '@src/geo/region.model'
import { Component } from '@src/process/component.model'
import { ComponentIDSchema } from '@src/process/component.schema'
import { TagDefinitionIDSchema } from '@src/process/tag.model'
import { ItemIDSchema } from '@src/product/item.schema'
import {
  VariantComponentUnitSchema,
  Variant as VariantEntity,
  VariantHistory as VariantHistoryEntity,
  VariantsComponents,
  VariantsOrgs,
} from '@src/product/variant.entity'
import {
  CreateVariantInput,
  UpdateVariantInput,
  Variant,
  VariantComponent,
  VariantHistory,
  VariantOrg,
} from '@src/product/variant.model'
import { Org } from '@src/users/org.model'
import { OrgIDSchema } from '@src/users/org.schema'
import { User } from '@src/users/users.model'

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
  meta: RelMetaSchema,
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
  CreateSchema
  CreateJSONSchema: z.core.JSONSchema.BaseSchema
  CreateValidator: ValidateFunction
  CreateUISchema: UISchemaElement
  UpdateSchema
  UpdateJSONSchema: z.core.JSONSchema.BaseSchema
  UpdateValidator: ValidateFunction
  UpdateUISchema: UISchemaElement

  constructor(
    private readonly i18n: I18nService,
    private readonly baseSchema: BaseSchemaService,
    private readonly zService: ZService,
  ) {
    const VariantTransform = z.transform((input: TransformInput) => {
      const entity = input.input as VariantEntity
      const model = new Variant()
      model.id = entity.id
      model.createdAt = DateTime.fromJSDate(entity.createdAt)
      model.updatedAt = DateTime.fromJSDate(entity.updatedAt)
      model.name = input.i18n.tr(entity.name)
      model.desc = input.i18n.tr(entity.desc)
      return model
    })
    this.zService.registerTransform(VariantEntity, Variant, VariantTransform)

    const VariantOrgTransform = z.transform(async (input: TransformInput) => {
      const entity = input.input as VariantsOrgs
      const model = new VariantOrg()
      model.role = entity.role
      if (entity.org) {
        model.org = await this.zService.entityToModel(Org, entity.org)
      }
      return model
    })
    this.zService.registerTransform(VariantsOrgs, VariantOrg, VariantOrgTransform)

    const VariantComponentTransform = z.transform(async (input: TransformInput) => {
      const entity = input.input as VariantsComponents
      const model = new VariantComponent()
      model.quantity = entity.quantity
      model.unit = entity.unit
      if (entity.component) {
        model.component = await this.zService.entityToModel(Component, entity.component)
      }
      return model
    })
    this.zService.registerTransform(VariantsComponents, VariantComponent, VariantComponentTransform)

    const VariantHistoryTransform = z.transform((input: TransformInput) => {
      const entity = input.input as VariantHistoryEntity
      const model = new VariantHistory()
      model.datetime = DateTime.fromJSDate(entity.datetime)
      model.user = entity.user as unknown as User & {}
      model.original = entity.original as Variant | undefined
      model.changes = entity.changes as Variant | undefined
      return model
    })
    this.zService.registerTransform(VariantHistoryEntity, VariantHistory, VariantHistoryTransform)

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
    const data: Record<string, any> = stripNulls(_.cloneDeep(edit.changes) ?? {})
    runAjvValidator(this.CreateValidator, data)
    return this.parseCreateInput(data as CreateVariantInput)
  }

  async variantUpdateEdit(edit: Edit) {
    const data: Record<string, any> = stripNulls(_.cloneDeep(edit.changes) ?? {})
    data.items = this.baseSchema.collectionToInput(data.variantItems || [], 'variant', 'item')
    data.orgs = this.baseSchema.collectionToInput(data.variantOrgs || [], 'variant', 'org')
    data.tags = this.baseSchema.collectionToInput(data.variantTags || [], 'variant', 'tag')
    data.components = this.baseSchema.collectionToInput(
      data.variantComponents || [],
      'variant',
      'component',
    )
    runAjvValidator(this.UpdateValidator, data)
    return this.parseUpdateInput(data as UpdateVariantInput)
  }

  async parseCreateInput(input: CreateVariantInput): Promise<CreateVariantInput> {
    return this.zService.parse(this.CreateSchema, input)
  }

  async parseUpdateInput(input: UpdateVariantInput): Promise<UpdateVariantInput> {
    return this.zService.parse(this.UpdateSchema, input)
  }

  async parseDeleteInput(input: DeleteInput): Promise<DeleteInput> {
    return this.zService.parse(DeleteInputSchema, input)
  }
}
