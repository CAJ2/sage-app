<template>
  <div class="flex flex-col justify-center">
    <div class="mb-10 w-full px-5">
      <FormChangeSaveStatus :status="saveStatus"></FormChangeSaveStatus>
      <FormJsonSchema
        v-if="jsonSchema && uiSchema"
        :schema="jsonSchema"
        :uischema="uiSchema"
        :data="updateData || createData"
        @change="onChange"
      />
    </div>
    <Button class="sticky bottom-0 btn-block" @click="saveForm">Save</Button>
  </div>
</template>

<script setup lang="ts">
import type { JsonFormsChangeEvent } from '@jsonforms/vue'
import type { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { graphql } from '~/gql'
import type { Exact } from '~/gql/graphql'
import type { JSONSchemaType } from 'ajv'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SchemaQuery = any
const { modelId, schemaQuery, createMutation, updateMutation, createModelKey } = defineProps<{
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
    const schemaKey = Object.keys(schemaData.value)[0]!
    return schemaData.value[schemaKey]?.create?.schema
  } else if (modelId !== 'new' && schemaData.value) {
    const schemaKey = Object.keys(schemaData.value)[0]!
    return schemaData.value[schemaKey]?.update?.schema
  }
  return null
})
const uiSchema = computed(() => {
  if (modelId === 'new' && schemaData.value) {
    const schemaKey = Object.keys(schemaData.value)[0]!
    return schemaData.value[schemaKey]?.create?.uischema
  } else if (modelId !== 'new' && schemaData.value) {
    const schemaKey = Object.keys(schemaData.value)[0]!
    return schemaData.value[schemaKey]?.update?.uischema
  }
  return null
})

const createData = ref<object | null>(null)
const updateData = ref<object | null>(null)
const editQuery = graphql(`
  query DirectGetEdit($id: ID!) {
    directEdit(id: $id) {
      entityName
      id
      updateModel
    }
  }
`)
if (modelId !== 'new') {
  const { result, refetch } = useQuery(editQuery, {
    id: modelId,
  })
  await refetch()
  watch(
    result,
    (result) => {
      if (result?.directEdit?.id) {
        updateData.value = sanitizeFormData(
          jsonSchema.value as JSONSchemaType<unknown>,
          result.directEdit.updateModel,
        )
      }
    },
    { immediate: true },
  )
}

const create = useMutation(createMutation, {
  variables: {
    input: {
      ...createData.value,
    },
  },
})
const update = useMutation(updateMutation, {
  variables: {
    input: {
      id: modelId,
      ...updateData.value,
    },
  },
})

const saveStatus = ref<'saving' | 'saved' | 'not_saved' | 'error'>(
  modelId === 'new' ? 'not_saved' : 'saved',
)
let firstChange = false
const onChange = (event: JsonFormsChangeEvent) => {
  if (event.data) {
    if (event.errors && event.errors.length > 0) {
      saveStatus.value = 'error'
      return
    }
    if (firstChange) {
      saveStatus.value = 'not_saved'
    }
    if (!firstChange) {
      firstChange = true
    }
    if (modelId === 'new') {
      createData.value = event.data
    } else {
      updateData.value = event.data
    }
  }
}
const saveForm = async () => {
  if (saveStatus.value === 'error') {
    return
  }
  if (modelId === 'new') {
    await create
      .mutate({
        input: {
          ...createData.value,
        },
      })
      .then((modelResult) => {
        if (!modelResult?.data) {
          saveStatus.value = 'error'
          return
        }
        saveStatus.value = 'saved'
        const data = modelResult.data as Record<string, Record<string, unknown> | null>
        const createKey = Object.keys(data)[0]!
        const modelReturned = data[createKey]?.[createModelKey] as {
          id: string
        } | null
        if (modelReturned?.id) {
          // Emit the created event with the new model ID
          emits('created', modelReturned.id)
          emits('saved', modelReturned.id)
        }
      })
      .catch(() => {
        saveStatus.value = 'error'
      })
  } else {
    await update
      .mutate({
        input: {
          id: modelId,
          ...updateData.value,
        },
      })
      .then(() => {
        saveStatus.value = 'saved'
        emits('saved', modelId)
      })
      .catch(() => {
        saveStatus.value = 'error'
      })
  }
}
</script>
