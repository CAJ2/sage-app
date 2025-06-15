<template>
  <div>
    <NavTopbar
      :title="route.params.id === 'new' ? 'New Category' : 'Edit Category'"
      back="true"
    />
    <div class="flex justify-center">
      <div class="w-full p-5 max-w-2xl">
        <FormChangeSaveStatus :status="saveStatus"></FormChangeSaveStatus>
        <JsonForms
          v-if="jsonSchema && uiSchema && categoryData"
          :schema="jsonSchema"
          :uischema="uiSchema"
          :data="categoryData"
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
import type { UpdateCategoryInput } from '~/gql/types.generated'

const route = useRoute()
const changeID = route.params.id as string

const ajv = new Ajv({
  allErrors: true,
  verbose: true,
  strict: false,
  validateFormats: true,
})
addFormats(ajv)

const categorySchema = graphql(`
  query ChangesCategorySchema {
    getCategorySchema {
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
const { data: formData } = await useAsyncQuery(categorySchema)
const categoryEditQuery = graphql(`
  query ChangesCategoryEdit($id: ID!, $changeID: ID!) {
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
  if (route.params.component_id === 'new') {
    return formData.value?.getCategorySchema?.create?.schema
  }
  return formData.value?.getCategorySchema?.update?.schema
})
const uiSchema = computed(() => {
  if (route.params.component_id === 'new') {
    return formData.value?.getCategorySchema?.create?.uischema
  }
  return formData.value?.getCategorySchema?.update?.uischema
})

const categoryData = ref<UpdateCategoryInput | null>(null)
if (route.params.category_id !== 'new') {
  const { data } = await useAsyncQuery(categoryEditQuery, {
    id: route.params.category_id as string,
    changeID: route.params.id as string,
  })
  if (
    data?.value?.getChange?.edits.nodes &&
    data.value.getChange.edits.nodes.length > 0
  ) {
    categoryData.value = sanitizeFormData(
      jsonSchema.value,
      data.value.getChange.edits.nodes[0].changes_update,
    ) as UpdateCategoryInput
  }
}

const categoryUpdateMutation = graphql(`
  mutation ChangeCategoryUpdate($input: UpdateCategoryInput!) {
    updateCategory(input: $input) {
      change {
        id
      }
    }
  }
`)
const categoryUpdate = useMutation(categoryUpdateMutation, {
  variables: {
    input: {
      change_id: changeID,
      id: route.params.category_id as string,
      ...categoryData.value,
    },
  },
})

const saveStatus = ref<'saving' | 'saved' | 'error'>('saved')
const onChange = async (event: JsonFormsChangeEvent) => {
  if (event.data) {
    categoryData.value = event.data
    if (event.errors && event.errors.length > 0) {
      console.error('Form errors:', event.errors)
      saveStatus.value = 'error'
      return
    }
    saveStatus.value = 'saving'
    await categoryUpdate.mutate({
      input: {
        change_id: changeID,
        id: route.params.category_id as string,
        ...categoryData.value,
      },
    })
    saveStatus.value = 'saved'
  }
}
</script>
