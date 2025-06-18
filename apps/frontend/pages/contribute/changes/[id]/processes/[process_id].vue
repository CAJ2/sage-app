<template>
  <div>
    <NavTopbar
      :title="processID === 'new' ? 'New Process' : 'Edit Process'"
      back="true"
    />
    <div class="flex justify-center">
      <div class="w-full p-5 max-w-2xl">
        <FormChangeSaveStatus :status="saveStatus"></FormChangeSaveStatus>
        <FormJsonSchema
          :schema="jsonSchema"
          :uischema="uiSchema"
          :data="updateData || createData"
          :readonly="readOnly"
          @change="onChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { JsonFormsChangeEvent } from '@jsonforms/vue'
import { graphql } from '~/gql'
import {
  ChangeStatus,
  type CreateProcessInput,
  type UpdateProcessInput,
} from '~/gql/types.generated'

const route = useRoute()
const localeRoute = useLocaleRoute()
const changeID = route.params.id as string
const processID = route.params.process_id as string

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
      status
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
const changeStatus = ref<ChangeStatus | null>(null)
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
  if (data?.value?.getChange?.status) {
    changeStatus.value = data.value.getChange.status
  }
}
const readOnly = computed<boolean | undefined>(() => {
  if (changeStatus.value !== ChangeStatus.Merged) {
    return undefined
  }
  return true
})

const processCreateMutation = graphql(`
  mutation ChangeProcessCreate($input: CreateProcessInput!) {
    createProcess(input: $input) {
      change {
        id
      }
      process {
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

const saveStatus = ref<'saving' | 'saved' | 'not_saved' | 'error'>('not_saved')
const onChange = async (event: JsonFormsChangeEvent) => {
  if (changeStatus.value === ChangeStatus.Merged) {
    return
  }
  if (event.data) {
    if (event.errors && event.errors.length > 0) {
      console.error('Form errors:', event.errors)
      saveStatus.value = 'not_saved'
      return
    }
    saveStatus.value = 'saving'
    if (processID === 'new') {
      createData.value = event.data
      await processCreate
        .mutate({
          input: {
            change_id: changeID,
            ...createData.value,
          } as CreateProcessInput,
        })
        .then((process) => {
          saveStatus.value = 'saved'
          // Redirect to the new process page
          if (process?.data?.createProcess?.process?.id) {
            navigateTo(
              localeRoute(
                `/contribute/changes/${changeID}/processes/${process?.data?.createProcess?.process?.id}`,
              ),
            )
          }
        })
        .catch((error) => {
          console.error('Error creating process:', error)
          saveStatus.value = 'error'
          return
        })
    } else {
      updateData.value = event.data
      await processUpdate
        .mutate({
          input: {
            change_id: changeID,
            id: processID,
            ...updateData.value,
          },
        })
        .then(() => {
          saveStatus.value = 'saved'
        })
        .catch((error) => {
          console.error('Error updating process:', error)
          saveStatus.value = 'error'
        })
    }
  }
}
</script>
