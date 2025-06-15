<template>
  <div>
    <NavTopbar
      :title="processID === 'new' ? 'New Process' : 'Edit Process'"
      back="true"
    />
    <div class="flex justify-center">
      <div class="w-full p-5 max-w-2xl">
        <FormChangeSaveStatus :status="saveStatus"></FormChangeSaveStatus>
        <JsonForms
          v-if="jsonSchema && uiSchema"
          :schema="jsonSchema"
          :uischema="uiSchema"
          :data="updateData || createData"
          :ajv="ajv"
          :renderers="renderers"
          @change="onChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { JsonForms, type JsonFormsChangeEvent } from '@jsonforms/vue'
import { renderers } from '~/forms'
import Ajv from 'ajv/dist/2020'
import addFormats from 'ajv-formats'
import { graphql } from '~/gql'
import type {
  CreateProcessInput,
  UpdateProcessInput,
} from '~/gql/types.generated'

const route = useRoute()
const changeID = route.params.id as string
const processID = route.params.process_id as string

const ajv = new Ajv({
  allErrors: true,
  verbose: true,
  strict: false,
  validateFormats: true,
})
addFormats(ajv)

const processSchema = graphql(`
  query ChangesProcessSchema {
    getProcessSchema {
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
`)
const { data: formData } = await useAsyncQuery(processSchema)
const processEditQuery = graphql(`
  query ChangesProcessEdit($id: ID!, $changeID: ID!) {
    getChange(id: $changeID) {
      edits(id: $id) {
        nodes {
          changes_update
        }
      }
    }
  }
`)
const jsonSchema = computed(() => {
  if (processID === 'new') {
    return formData.value?.getProcessSchema?.create?.schema
  }
  return formData.value?.getProcessSchema?.update?.schema
})
const uiSchema = computed(() => {
  if (processID === 'new') {
    return formData.value?.getProcessSchema?.create?.uischema
  }
  return formData.value?.getProcessSchema?.update?.uischema
})

const createData = ref<CreateProcessInput | null>(null)
const updateData = ref<UpdateProcessInput | null>(null)
if (processID !== 'new') {
  const { data } = await useAsyncQuery(processEditQuery, {
    id: processID,
    changeID: route.params.id as string,
  })
  if (
    data?.value?.getChange?.edits.nodes &&
    data.value.getChange.edits.nodes.length > 0
  ) {
    updateData.value = sanitizeFormData(
      jsonSchema.value,
      data.value.getChange.edits.nodes[0].changes_update,
    ) as UpdateProcessInput
  }
}

const processCreateMutation = graphql(`
  mutation ChangeProcessCreate($input: CreateProcessInput!) {
    createProcess(input: $input) {
      change {
        id
      }
    }
  }
`)
const processCreate = useMutation(processCreateMutation, {
  variables: {
    input: {
      change_id: changeID,
    } as CreateProcessInput,
  },
})
const processUpdateMutation = graphql(`
  mutation ChangeProcessUpdate($input: UpdateProcessInput!) {
    updateProcess(input: $input) {
      change {
        id
      }
    }
  }
`)
const processUpdate = useMutation(processUpdateMutation, {
  variables: {
    input: {
      change_id: changeID,
      id: processID,
      ...updateData.value,
    },
  },
})

const saveStatus = ref<'saving' | 'saved' | 'error'>('saved')
const onChange = async (event: JsonFormsChangeEvent) => {
  if (event.data) {
    if (event.errors && event.errors.length > 0) {
      console.error('Form errors:', event.errors)
      saveStatus.value = 'error'
      return
    }
    saveStatus.value = 'saving'
    if (processID === 'new') {
      createData.value = event.data
      await processCreate.mutate({
        input: {
          change_id: changeID,
          ...createData.value,
        } as CreateProcessInput,
      })
    } else {
      updateData.value = event.data
      await processUpdate.mutate({
        input: {
          change_id: changeID,
          id: processID,
          ...updateData.value,
        },
      })
    }
    saveStatus.value = 'saved'
  }
}
</script>
