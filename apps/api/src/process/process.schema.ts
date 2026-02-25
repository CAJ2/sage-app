import { Injectable } from '@nestjs/common'
import { ValidateFunction } from 'ajv'
import _ from 'lodash'
import { z } from 'zod/v4'

import { DeleteInput } from '@src/changes/change-ext.model'
import type { Edit } from '@src/changes/change.model'
import { ChangeInputWithLangSchema, DeleteInputSchema } from '@src/changes/change.schema'
import { BaseSchemaService, zToSchema } from '@src/common/base.schema'
import { TrArraySchema } from '@src/common/i18n'
import { I18nService } from '@src/common/i18n.service'
import { UISchemaElement } from '@src/common/ui.schema'
import { ZService } from '@src/common/z.service'
import { PlaceIDSchema } from '@src/geo/place.schema'
import { RegionIDSchema } from '@src/geo/region.model'
import { VariantIDSchema } from '@src/product/variant.schema'
import { OrgIDSchema } from '@src/users/org.schema'

import { MaterialIDSchema } from './material.model'
import {
  ProcessEfficiencySchema,
  ProcessInstructionsSchema,
  ProcessIntent,
  ProcessRulesSchema,
} from './process.entity'
import { CreateProcessInput, UpdateProcessInput } from './process.model'

export const ProcessIDSchema = z.string().meta({
  id: 'Process',
  name: 'Process ID',
})

@Injectable()
export class ProcessSchemaService {
  ProcessMaterialInputSchema
  ProcessVariantInputSchema
  ProcessOrgInputSchema
  ProcessRegionInputSchema
  ProcessPlaceInputSchema
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
      name: z.string().max(1024).optional(),
      nameTr: TrArraySchema.optional(),
      desc: z.string().max(100_000).optional(),
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
      name: z.string().max(1024).optional(),
      nameTr: TrArraySchema.optional(),
      desc: z.string().max(100_000).optional(),
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

  async parseCreateInput(input: CreateProcessInput): Promise<CreateProcessInput> {
    return this.zService.parse(this.CreateSchema, input)
  }

  async parseUpdateInput(input: UpdateProcessInput): Promise<UpdateProcessInput> {
    return this.zService.parse(this.UpdateSchema, input)
  }

  async parseDeleteInput(input: DeleteInput): Promise<DeleteInput> {
    return this.zService.parse(DeleteInputSchema, input)
  }
}
