<template>
  <div>
    <NavTopbar
      :title="
        route.params.component_id === 'new'
          ? 'Create Component'
          : 'Edit Component'
      "
      back="true"
    ></NavTopbar>
    <div class="flex justify-center">
      <div class="w-full p-5 max-w-2xl">
        <JsonForms
          v-if="jsonSchema && uiSchema"
          :schema="jsonSchema"
          :uischema="uiSchema"
          :data="{ id: route.params.component_id }"
          :ajv="ajv"
          :renderers="renderers"
          :i18n="{ locale, translate: ft }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UISchemaElement } from '@jsonforms/core'
import { JsonForms } from '@jsonforms/vue'
import { renderers } from '~/forms'
import Ajv from 'ajv/dist/2020'
import addFormats from 'ajv-formats'

const route = useRoute()
const { locale } = useI18n()
const ft = formTranslate()

const ajv = new Ajv({
  allErrors: true,
  useDefaults: true,
  verbose: true,
  strict: false,
})
addFormats(ajv)

const formQuery = gql`
  query FormQuery {
    getComponentSchema {
      create {
        schema
        uischema
      }
      update {
        schema
        uischema
      }
    }
  }
`
type JSONSchema = {
  $schema: string
  type: string
  properties?: Record<string, JSONSchema>
  required?: string[]
  additionalProperties?: boolean
}
type FormResult = {
  getComponentSchema: {
    create: {
      schema: JSONSchema
      uischema: UISchemaElement
    }
    update: {
      schema: JSONSchema
      uischema: UISchemaElement
    }
  }
}
const { data: formData } = await useAsyncQuery<FormResult>(formQuery)

const jsonSchema = computed(() => {
  if (route.params.component_id === 'new') {
    return formData.value?.getComponentSchema.create.schema
  }
  return formData.value?.getComponentSchema.update.schema
})
const uiSchema = computed(() => {
  if (route.params.component_id === 'new') {
    return formData.value?.getComponentSchema.create.uischema
  }
  return formData.value?.getComponentSchema.update.uischema
})
</script>
