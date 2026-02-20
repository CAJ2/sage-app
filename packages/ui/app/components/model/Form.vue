<template>
  <div class="flex flex-col justify-center">
    <div class="mb-10 w-full px-5">
      <FormChangeSaveStatus v-if="!readOnly" :status="saveStatus"></FormChangeSaveStatus>
      <FormJsonSchema
        v-if="jsonSchema && uiSchema"
        :schema="jsonSchema"
        :uischema="uiSchema"
        :data="updateData || createData"
        :readonly="readOnly"
        @change="onChange"
      />
      <Button v-if="!autoSave || !changeId" class="sticky bottom-0 btn-block" @click="saveForm"
        >Save</Button
      >
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
const { changeId, modelId, schemaQuery, createMutation, updateMutation, createModelKey, autoSave } =
  defineProps<{
    changeId: string | undefined
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
    autoSave?: boolean
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
const changeStatus = ref<ChangeStatus | null>(null)
const editQuery = graphql(`
  query ChangesGetEdit($id: ID!, $changeID: ID!) {
    change(id: $changeID) {
      status
      edits(id: $id) {
        nodes {
          updateChanges
        }
      }
    }
  }
`)
const directEditQuery = graphql(`
  query DirectGetEdit($id: ID!) {
    directEdit(id: $id) {
      entityName
      id
      updateModel
    }
  }
`)
if (modelId !== 'new' && changeId) {
  const { result } = useQuery(editQuery, {
    id: modelId,
    changeID: changeId,
  })
  watch(
    result,
    (result) => {
      if (result?.change?.edits.nodes && result.change.edits.nodes.length > 0) {
        updateData.value = sanitizeFormData(
          jsonSchema.value as JSONSchemaType<unknown>,
          result.change.edits.nodes[0]!.updateChanges,
        )
      }
      if (result?.change?.status) {
        changeStatus.value = result.change.status
      }
    },
    {
      immediate: true,
    },
  )
} else if (modelId !== 'new') {
  const { result } = useQuery(directEditQuery, {
    id: modelId,
  })
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
    {
      immediate: true,
    },
  )
}
const readOnly = computed<boolean | undefined>(() => {
  if (changeStatus.value !== ChangeStatus.Merged) {
    return
  }
  return true
})

const create = useMutation(createMutation, {
  variables: {
    input: {
      changeID: changeId,
    },
  },
})
const update = useMutation(updateMutation, {
  variables: {
    input: {
      changeID: changeId,
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
  if (changeStatus.value === ChangeStatus.Merged) {
    return
  }
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
if (changeId && autoSave && modelId === 'new') {
  watch(createData, async (newData) => {
    createData.value = newData
    await create
      .mutate({
        input: {
          changeID: changeId,
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
  })
} else if (changeId && autoSave && modelId !== 'new') {
  watch(updateData, async (newData) => {
    updateData.value = newData
    await update
      .mutate({
        input: {
          changeID: changeId,
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
  })
}
const saveForm = async () => {
  if (saveStatus.value === 'error') {
    return
  }
  if (modelId === 'new') {
    await create
      .mutate({
        input: {
          changeID: changeId || undefined,
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
          changeID: changeId || undefined,
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
