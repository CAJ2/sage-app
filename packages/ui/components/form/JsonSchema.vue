<template>
  <JsonForms
    v-if="schema && uischema"
    :schema="schema"
    :uischema="uischema"
    :data="data"
    :ajv="ajv"
    :renderers="renderers"
    :readonly="readOnly"
    @change="onChange"
  />
</template>

<script setup lang="ts">
import { JsonForms, type JsonFormsChangeEvent } from '@jsonforms/vue'
import { renderers } from '../../forms'
import Ajv from 'ajv/dist/2020'
import addFormats from 'ajv-formats'
import type { JsonSchema, UISchemaElement } from '@jsonforms/core'

const ajv = new Ajv({
  allErrors: true,
  verbose: true,
  strict: false,
  validateFormats: true,
})
addFormats(ajv)

const { schema, uischema, data, readOnly } = defineProps<{
  schema: JsonSchema
  uischema: UISchemaElement
  data: object | null | undefined
  readOnly?: boolean
}>()

const emits = defineEmits<{
  (e: 'change', event: JsonFormsChangeEvent): void
}>()
const onChange = (event: JsonFormsChangeEvent) => {
  emits('change', event)
}
</script>
