<template>
  <div class="flex flex-col justify-center">
    <div class="w-full px-5 mb-10">
      <FormChangeSaveStatus
        v-if="!readOnly"
        :status="saveStatus"
      ></FormChangeSaveStatus>
      <FormJsonSchema
        v-if="jsonSchema && uiSchema"
        :schema="jsonSchema"
        :uischema="uiSchema"
        :data="updateData || createData"
        :readonly="readOnly"
        @change="onChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { JsonFormsChangeEvent } from '@jsonforms/vue'
import type { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { graphql } from '~/gql'
import { ChangeStatus, type Exact } from '~/gql/graphql'
import type { JSONSchemaType } from 'ajv'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SchemaQuery = any
const {
  changeId,
  modelId,
  schemaQuery,
  createMutation,
  updateMutation,
  createModelKey,
} = defineProps<{
  changeId: string
  modelId: string
  schemaQuery: TypedDocumentNode<
    SchemaQuery,
    Exact<{
      [key: string]: never
    }>
  >
  createMutation: TypedDocumentNode<
    { [key: string]: unknown },
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      input: any
    }
  >
  updateMutation: TypedDocumentNode<
    { [key: string]: unknown },
    Exact<{
      input: {
        id: string
        [key: string]: unknown
      }
    }>
  >
  createModelKey: string
}>()

const emits = defineEmits<{
  (e: 'created' | 'saved', id: string): void
}>()

const { result: schemaData } = useQuery(schemaQuery)
const jsonSchema = computed(() => {
  if (modelId === 'new' && schemaData.value) {
    const schemaKey = Object.keys(schemaData.value)[0]
    return schemaData.value[schemaKey]?.create?.schema
  } else if (modelId !== 'new' && schemaData.value) {
    const schemaKey = Object.keys(schemaData.value)[0]
    return schemaData.value[schemaKey]?.update?.schema
  }
  return null
})
const uiSchema = computed(() => {
  if (modelId === 'new' && schemaData.value) {
    const schemaKey = Object.keys(schemaData.value)[0]
    return schemaData.value[schemaKey]?.create?.uischema
  } else if (modelId !== 'new' && schemaData.value) {
    const schemaKey = Object.keys(schemaData.value)[0]
    return schemaData.value[schemaKey]?.update?.uischema
  }
  return null
})

const createData = ref<object | null>(null)
const updateData = ref<object | null>(null)
const changeStatus = ref<ChangeStatus | null>(null)
const editQuery = graphql(`
  query ChangesGetEdit($id: ID!, $changeID: ID!) {
    getChange(id: $changeID) {
      status
      edits(id: $id) {
        nodes {
          changes_update
        }
      }
    }
  }
`)
if (modelId !== 'new') {
  const { result } = useQuery(editQuery, {
    id: modelId,
    changeID: changeId,
  })
  watch(result, (result) => {
    if (
      result?.getChange?.edits.nodes &&
      result.getChange.edits.nodes.length > 0
    ) {
      updateData.value = sanitizeFormData(
        jsonSchema.value as JSONSchemaType<unknown>,
        result.getChange.edits.nodes[0].changes_update,
      )
    }
    if (result?.getChange?.status) {
      changeStatus.value = result.getChange.status
    }
  })
}
const readOnly = computed<boolean | undefined>(() => {
  if (changeStatus.value !== ChangeStatus.Merged) {
    return undefined
  }
  return true
})

const create = useMutation(createMutation, {
  variables: {
    input: {
      change_id: changeId,
    },
  },
})
const update = useMutation(updateMutation, {
  variables: {
    input: {
      change_id: changeId,
      id: modelId,
      ...updateData.value,
    },
  },
})

const saveStatus = ref<'saving' | 'saved' | 'not_saved' | 'error'>('not_saved')
const onChange = async (event: JsonFormsChangeEvent) => {
  if (changeStatus.value === ChangeStatus.Merged) {
    return
  }
  if (event.data) {
    if (event.errors && event.errors.length > 0) {
      console.error('Form errors:', event.errors)
      saveStatus.value = 'error'
      return
    }
    saveStatus.value = 'saving'
    if (modelId === 'new') {
      createData.value = event.data
      await create
        .mutate({
          input: {
            change_id: changeId,
            ...createData.value,
          },
        })
        .then((modelResult) => {
          if (!modelResult?.data) {
            console.error('Create model failed:', modelResult)
            saveStatus.value = 'error'
            return
          }
          saveStatus.value = 'saved'
          const data = modelResult.data as { [key: string]: never }
          const createKey = Object.keys(data)[0]
          const modelReturned = data[createKey]?.[createModelKey] as {
            id: string
          } | null
          if (modelReturned?.id) {
            // Emit the created event with the new model ID
            emits('created', modelReturned.id)
            emits('saved', modelReturned.id)
          }
        })
        .catch((error) => {
          console.error('Error creating model:', error)
          saveStatus.value = 'error'
          return
        })
    } else {
      updateData.value = event.data
      await update
        .mutate({
          input: {
            change_id: changeId,
            id: modelId,
            ...updateData.value,
          },
        })
        .then(() => {
          saveStatus.value = 'saved'
          emits('saved', modelId)
        })
        .catch((error) => {
          console.error('Error updating model:', error)
          saveStatus.value = 'error'
        })
    }
  }
}
</script>
