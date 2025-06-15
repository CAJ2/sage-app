import { Injectable } from '@nestjs/common'
import { ChangeInputWithLangSchema } from '@src/changes/change.schema'
import { BaseSchemaService, zToSchema } from '@src/common/base.schema'
import { UISchemaElement } from '@src/common/ui.schema'
import { PlaceIDSchema } from '@src/geo/place.schema'
import { RegionIDSchema } from '@src/geo/region.model'
import { TranslatedInputSchema } from '@src/graphql/base.model'
import { I18nTranslations } from '@src/i18n/i18n.generated'
import { VariantIDSchema } from '@src/product/variant.schema'
import { OrgIDSchema } from '@src/users/org.schema'
import { I18nService } from 'nestjs-i18n'
import { z } from 'zod/v4'
import { MaterialIDSchema } from './material.model'
import { ProcessIntent } from './process.entity'

export const ProcessIDSchema = z.string().meta({
  id: 'Process',
  name: 'Process ID',
})

@Injectable()
export class ProcessSchemaService {
  CreateProcessInputSchema: z.ZodObject<any>
  CreateProcessInputJSONSchema: z.core.JSONSchema.BaseSchema
  CreateProcessInputUISchema: UISchemaElement
  UpdateProcessInputSchema: z.ZodObject<any>
  UpdateProcessInputJSONSchema: z.core.JSONSchema.BaseSchema
  UpdateProcessInputUISchema: UISchemaElement

  constructor(
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly baseSchema: BaseSchemaService,
  ) {
    this.CreateProcessInputSchema = ChangeInputWithLangSchema.extend({
      intent: z.enum(ProcessIntent),
      name_tr: z.array(TranslatedInputSchema).optional(),
      desc_tr: z.array(TranslatedInputSchema).optional(),
      material: MaterialIDSchema.optional(),
      variant: VariantIDSchema.optional(),
      org: OrgIDSchema.optional(),
      region: RegionIDSchema.optional(),
      place: PlaceIDSchema.optional(),
    })
    this.CreateProcessInputJSONSchema = zToSchema(this.CreateProcessInputSchema)
    this.CreateProcessInputUISchema = {
      type: 'VerticalLayout',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/intent',
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

    this.UpdateProcessInputSchema = ChangeInputWithLangSchema.extend({
      id: ProcessIDSchema,
      intent: z.enum(ProcessIntent).optional(),
      name: z.string().max(1024).optional(),
      name_tr: z.array(TranslatedInputSchema).optional(),
      desc: z.string().max(100_000).optional(),
      desc_tr: z.array(TranslatedInputSchema).optional(),
      material: MaterialIDSchema.optional(),
      variant: VariantIDSchema.optional(),
      org: OrgIDSchema.optional(),
      region: RegionIDSchema.optional(),
      place: PlaceIDSchema.optional(),
    })
    this.UpdateProcessInputJSONSchema = zToSchema(this.UpdateProcessInputSchema)
    this.UpdateProcessInputUISchema = {
      type: 'VerticalLayout',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/name',
          options: {
            readonly: true,
          },
        },
        {
          type: 'Control',
          scope: '#/properties/intent',
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
  }
}
