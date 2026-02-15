<template>
  <div>
    <NavTopbar
      :title="categoryID === 'new' ? 'New Category' : 'Edit Category'"
      back="true"
    />
    <div class="flex justify-center">
      <div class="w-full p-5 max-w-2xl">
        <FormChangeSaveStatus
          v-if="!readOnly"
          :status="saveStatus"
        ></FormChangeSaveStatus>
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
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from '~/gql/types.generated'

const route = useRoute()
const localeRoute = useLocaleRoute()
const posthog = usePostHog()
const changeID = route.params.id as string
const categoryID = route.params.category_id as string

const categorySchema = graphql(`
  query ChangesCategorySchema {
    categorySchema {
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
const jsonSchema = computed(() => {
  if (categoryID === 'new') {
    return formData.value?.categorySchema?.create?.schema
  }
  return formData.value?.categorySchema?.update?.schema
})
const uiSchema = computed(() => {
  if (categoryID === 'new') {
    return formData.value?.categorySchema?.create?.uischema
  }
  return formData.value?.categorySchema?.update?.uischema
})

const createData = ref<CreateCategoryInput | null>(null)
const updateData = ref<UpdateCategoryInput | null>(null)
const changeStatus = ref<ChangeStatus | null>(null)
if (categoryID !== 'new') {
  const { data } = await useAsyncQuery(categoryEditQuery, {
    id: categoryID,
    changeID,
  })
  if (
    data?.value?.change?.edits.nodes &&
    data.value.change.edits.nodes.length > 0
  ) {
    updateData.value = sanitizeFormData(
      jsonSchema.value,
      data.value.change.edits.nodes[0].updateChanges,
    ) as UpdateCategoryInput
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

const categoryCreateMutation = graphql(`
  mutation ChangeCategoryCreate($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      change {
        id
      }
      category {
        id
      }
    }
  }
`)
const categoryCreate = useMutation(categoryCreateMutation, {
  variables: {
    input: {
      changeID: changeID,
    } as CreateCategoryInput,
  },
})
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
      changeID: changeID,
      id: categoryID,
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
    if (categoryID === 'new') {
      createData.value = event.data
      await categoryCreate
        .mutate({
          input: {
            changeID: changeID,
            ...createData.value,
          } as CreateCategoryInput,
        })
        .then((category) => {
          saveStatus.value = 'saved'
          // Redirect to the new category page
          if (category?.data?.createCategory?.category?.id) {
            navigateTo(
              localeRoute(
                `/contribute/changes/${changeID}/categories/${category?.data?.createCategory?.category?.id}`,
              ),
            )
          }
        })
        .catch((error) => {
          posthog?.captureException(error, {
            tags: {
              feature: 'categories',
              action: 'create',
            },
          })
          saveStatus.value = 'error'
        })
    } else {
      updateData.value = event.data
      await categoryUpdate
        .mutate({
          input: {
            changeID: changeID,
            id: categoryID,
            ...updateData.value,
          },
        })
        .then(() => {
          saveStatus.value = 'saved'
        })
        .catch((error) => {
          posthog?.captureException(error, {
            tags: {
              feature: 'categories',
              action: 'update',
            },
          })
          saveStatus.value = 'error'
        })
    }
  }
}
</script>
