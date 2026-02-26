<template>
  <div>
    <NavTopbar
      :title="route.params.componentID === 'new' ? 'Create Component' : 'Edit Component'"
      back="true"
    />
    <div class="flex justify-center">
      <div class="w-full max-w-2xl p-5">
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
import type { CreateComponentInput, UpdateComponentInput } from '~/gql/graphql'
import { ChangeStatus } from '~/gql/graphql'

const route = useRoute()
const localeRoute = useLocaleRoute()
const changeID = route.params.id as string
const componentID = route.params.componentID as string

const formQuery = graphql(`
  query ChangesComponentSchema {
    componentSchema {
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
const { data: formData } = await useAsyncQuery(formQuery)
const componentEditQuery = graphql(`
  query ChangesComponentEdit($id: ID!, $changeID: ID!) {
    change(id: $changeID) {
      status
      edits(id: $id) {
        nodes {
          updateInput
        }
      }
    }
  }
`)
const jsonSchema = computed(() => {
  if (route.params.componentID === 'new') {
    return formData.value?.componentSchema?.create?.schema
  }
  return formData.value?.componentSchema?.update?.schema
})
const uiSchema = computed(() => {
  if (route.params.componentID === 'new') {
    return formData.value?.componentSchema?.create?.uischema
  }
  return formData.value?.componentSchema?.update?.uischema
})

const createData = ref<CreateComponentInput | null>(null)
const updateData = ref<UpdateComponentInput | null>(null)
const changeStatus = ref<ChangeStatus | null>(null)
if (componentID !== 'new') {
  const { data } = await useAsyncQuery(componentEditQuery, {
    id: componentID,
    changeID,
  })
  if (data?.value?.change?.edits.nodes && data.value.change.edits.nodes.length > 0) {
    updateData.value = sanitizeFormData(
      jsonSchema.value,
      data.value.change.edits.nodes[0]?.updateInput,
    ) as UpdateComponentInput
  }
  if (data?.value?.change?.status) {
    changeStatus.value = data.value.change.status
  }
}
const readOnly = computed<boolean | undefined>(() => {
  if (changeStatus.value !== ChangeStatus.Merged) {
    return
  }
  return true
})

const componentCreateMutation = graphql(`
  mutation ChangeComponentCreate($input: CreateComponentInput!) {
    createComponent(input: $input) {
      change {
        id
      }
      component {
        id
      }
    }
  }
`)
const componentCreate = useMutation(componentCreateMutation, {
  variables: {
    input: {
      changeID: changeID,
    } as CreateComponentInput,
  },
})
const componentUpdateMutation = graphql(`
  mutation ChangeComponentUpdate($input: UpdateComponentInput!) {
    updateComponent(input: $input) {
      change {
        id
      }
    }
  }
`)
const componentUpdate = useMutation(componentUpdateMutation, {
  variables: {
    input: {
      changeID: changeID,
      id: componentID,
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
      saveStatus.value = 'error'
      return
    }
    saveStatus.value = 'saving'
    if (componentID === 'new') {
      createData.value = event.data
      await componentCreate
        .mutate({
          input: {
            changeID: changeID,
            ...createData.value,
          } as CreateComponentInput,
        })
        .then((component) => {
          saveStatus.value = 'saved'
          // Redirect to the new component page
          if (component?.data?.createComponent?.component?.id) {
            navigateTo(
              localeRoute(
                `/contribute/changes/${changeID}/components/${component?.data?.createComponent?.component?.id}`,
              ),
            )
          }
        })
        .catch(() => {
          saveStatus.value = 'error'
        })
    } else {
      updateData.value = event.data
      await componentUpdate
        .mutate({
          input: {
            changeID: changeID,
            id: componentID,
            ...updateData.value,
          },
        })
        .then(() => {
          saveStatus.value = 'saved'
        })
        .catch(() => {
          saveStatus.value = 'error'
        })
    }
  }
}
</script>
