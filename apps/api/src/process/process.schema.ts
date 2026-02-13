import { Injectable } from '@nestjs/common'
import { ChangeInputWithLangSchema } from '@src/changes/change.schema'
import { BaseSchemaService, zToSchema } from '@src/common/base.schema'
import { TrArraySchema } from '@src/common/i18n'
import { UISchemaElement } from '@src/common/ui.schema'
import { PlaceIDSchema } from '@src/geo/place.schema'
import { RegionIDSchema } from '@src/geo/region.model'
import { I18nTranslations } from '@src/i18n/i18n.generated'
import { VariantIDSchema } from '@src/product/variant.schema'
import { OrgIDSchema } from '@src/users/org.schema'
import { ValidateFunction } from 'ajv'
import _ from 'lodash'
import { I18nService } from 'nestjs-i18n'
import { z } from 'zod/v4'
import { MaterialIDSchema } from './material.model'
import {
  ProcessEfficiencySchema,
  ProcessInstructionsSchema,
  ProcessIntent,
  ProcessRulesSchema,
} from './process.entity'
import type { Edit } from '@src/changes/change.model'

export const ProcessIDSchema = z.string().meta({
  id: 'Process',
  name: 'Process ID',
})

@Injectable()
export class ProcessSchemaService {
  ProcessMaterialInputSchema: z.ZodObject
  ProcessVariantInputSchema: z.ZodObject
  ProcessOrgInputSchema: z.ZodObject
  ProcessRegionInputSchema: z.ZodObject
  ProcessPlaceInputSchema: z.ZodObject
  CreateSchema: z.ZodObject<any>
  CreateJSONSchema: z.core.JSONSchema.BaseSchema
  CreateValidator: ValidateFunction
  CreateUISchema: UISchemaElement
  UpdateSchema: z.ZodObject<any>
  UpdateJSONSchema: z.core.JSONSchema.BaseSchema
  UpdateValidator: ValidateFunction
  UpdateUISchema: UISchemaElement

  constructor(
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly baseSchema: BaseSchemaService,
  ) {
    this.ProcessMaterialInputSchema = z.strictObject({
      id: MaterialIDSchema,
    })
    this.ProcessVariantInputSchema = z.strictObject({
      id: VariantIDSchema,
    })
    this.ProcessOrgInputSchema = z.strictObject({
      id: OrgIDSchema,
    })
    this.ProcessRegionInputSchema = z.strictObject({
      id: RegionIDSchema,
    })
    this.ProcessPlaceInputSchema = z.strictObject({
      id: PlaceIDSchema,
    })
    this.CreateSchema = ChangeInputWithLangSchema.extend({
      intent: z.enum(ProcessIntent),
      nameTr: TrArraySchema.optional(),
      descTr: TrArraySchema.optional(),
      instructions: ProcessInstructionsSchema.optional(),
      efficiency: ProcessEfficiencySchema.optional(),
      rules: ProcessRulesSchema.optional(),
      material: this.ProcessMaterialInputSchema.optional(),
      variant: this.ProcessVariantInputSchema.optional(),
      org: this.ProcessOrgInputSchema.optional(),
      region: this.ProcessRegionInputSchema.optional(),
      place: this.ProcessPlaceInputSchema.optional(),
    })
    this.CreateJSONSchema = zToSchema(this.CreateSchema)
    this.CreateUISchema = {
      type: 'VerticalLayout',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/intent',
        },
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
          scope: '#/properties/instructions',
        },
        {
          type: 'Control',
          scope: '#/properties/efficiency',
        },
        {
          type: 'Control',
          scope: '#/properties/rules',
        },
        {
          type: 'Control',
          scope: '#/properties/material',
        },
        {
          type: 'Control',
          scope: '#/properties/variant',
        },
        {
          type: 'Control',
          scope: '#/properties/org',
        },
        {
          type: 'Control',
          scope: '#/properties/region',
        },
        {
          type: 'Control',
          scope: '#/properties/place',
        },
      ],
    }

    this.UpdateSchema = ChangeInputWithLangSchema.extend({
      id: ProcessIDSchema,
      intent: z.enum(ProcessIntent).optional(),
      nameTr: TrArraySchema.optional(),
      descTr: TrArraySchema.optional(),
      instructions: ProcessInstructionsSchema.optional(),
      efficiency: ProcessEfficiencySchema.optional(),
      rules: ProcessRulesSchema.optional(),
      material: this.ProcessMaterialInputSchema.optional(),
      variant: this.ProcessVariantInputSchema.optional(),
      org: this.ProcessOrgInputSchema.optional(),
      region: this.ProcessRegionInputSchema.optional(),
      place: this.ProcessPlaceInputSchema.optional(),
    })
    this.UpdateJSONSchema = zToSchema(this.UpdateSchema)
    this.UpdateUISchema = {
      type: 'VerticalLayout',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/intent',
        },
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
          scope: '#/properties/instructions',
        },
        {
          type: 'Control',
          scope: '#/properties/efficiency',
        },
        {
          type: 'Control',
          scope: '#/properties/rules',
        },
        {
          type: 'Control',
          scope: '#/properties/material',
        },
        {
          type: 'Control',
          scope: '#/properties/variant',
        },
        {
          type: 'Control',
          scope: '#/properties/org',
        },
        {
          type: 'Control',
          scope: '#/properties/region',
        },
        {
          type: 'Control',
          scope: '#/properties/place',
        },
      ],
    }
    this.CreateValidator = this.baseSchema.ajv.compile(this.CreateJSONSchema)
    this.UpdateValidator = this.baseSchema.ajv.compile(this.UpdateJSONSchema)
  }

  async processCreateEdit(edit: Edit) {
    const data = _.cloneDeep(edit.changes)
    this.CreateValidator(data)
    return data
  }

  async processUpdateEdit(edit: Edit) {
    const data = _.cloneDeep(edit.changes)
    this.UpdateValidator(data)
    return data
  }
}
