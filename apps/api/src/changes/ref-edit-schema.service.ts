import { Injectable } from '@nestjs/common'
import { z } from 'zod/v4'

import { EditModelType, RefModelType } from '@src/changes/change.enum'
import { ChangeInputWithLangSchema } from '@src/changes/change.schema'
import { type RefEditDefinition, resolveRefEditDefinition } from '@src/changes/ref-edit.registry'
import { zToSchema } from '@src/common/base.schema'
import { BadRequestErr } from '@src/common/exceptions'
import { type UISchemaElement } from '@src/common/ui.schema'
import { type ModelSchema } from '@src/graphql/base.model'

@Injectable()
export class RefEditSchemaService {
  getAddRefSchema(model: string, refModel: RefModelType, refField?: string): ModelSchema {
    const definition = this.resolveDefinition(model, refModel, refField)
    return {
      schema: zToSchema(this.buildAddSchema(definition)),
      uischema: this.buildUISchema(definition, true),
    }
  }

  getRemoveRefSchema(model: string, refModel: RefModelType, refField?: string): ModelSchema {
    const definition = this.resolveDefinition(model, refModel, refField)
    return {
      schema: zToSchema(this.buildRemoveSchema(definition)),
      uischema: this.buildUISchema(definition, false),
    }
  }

  private resolveDefinition(
    model: string,
    refModel: RefModelType,
    refField?: string,
  ): RefEditDefinition {
    if (!Object.values(EditModelType).includes(model as EditModelType)) {
      throw BadRequestErr(`Unsupported model schema ${model}`)
    }
    return resolveRefEditDefinition(model as EditModelType, refModel, refField)
  }

  private buildAddSchema(definition: RefEditDefinition) {
    const refsSchema = z
      .array(definition.targetIDSchema)
      .min(1)
      .meta({ title: `References for ${definition.refField}` })

    const schema = ChangeInputWithLangSchema.extend({
      refs: refsSchema,
      ...(definition.addInputSchema
        ? {
            inputs: z
              .array(definition.addInputSchema)
              .min(1)
              .optional()
              .meta({ title: `Inputs for ${definition.refField}` }),
          }
        : {}),
    }).superRefine((input, ctx) => {
      const parsedInput = input as { refs: string[]; inputs?: unknown[] }
      if (
        definition.addInputSchema &&
        parsedInput.inputs &&
        parsedInput.inputs.length !== parsedInput.refs.length
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['inputs'],
          message: 'inputs must have the same length as refs',
        })
      }
    })

    return schema
  }

  private buildRemoveSchema(definition: RefEditDefinition) {
    return ChangeInputWithLangSchema.extend({
      refs: z
        .array(definition.targetIDSchema)
        .min(1)
        .meta({ title: `References for ${definition.refField}` }),
    })
  }

  private buildUISchema(definition: RefEditDefinition, includeInputs: boolean): UISchemaElement {
    return {
      type: 'VerticalLayout',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/refs',
          label: definition.refField,
        },
        ...(includeInputs && definition.addInputSchema
          ? [
              {
                type: 'Control',
                scope: '#/properties/inputs',
                label: `${definition.refField} inputs`,
              } satisfies UISchemaElement,
            ]
          : []),
      ],
    }
  }
}
