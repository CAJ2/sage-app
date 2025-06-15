<template>
  <div>
    <NavTopbar
      title="Edit Category"
      subtitle="Manage your category details and changes."
      back="true"
    ></NavTopbar>
    <div class="flex flex-col items-center"></div>
  </div>
</template>

<script setup lang="ts">
import { graphql } from '~/gql'

const route = useRoute()
const localeRoute = useLocaleRoute()
const categoryId = route.params.id as string

const updateQuery = graphql(`
  mutation UpdateCategoryNewChange($input: UpdateCategoryInput!) {
    updateCategory(input: $input) {
      change {
        id
      }
    }
  }
`)
const mutation = useMutation(updateQuery, {
  variables: {
    input: {
      id: categoryId,
      change: {},
    },
  },
})
const result = await mutation.mutate()
if (result?.data?.updateCategory?.change?.id) {
  const changeID = result.data.updateCategory.change.id
  navigateTo(
    localeRoute(`/contribute/changes/${changeID}/categories/${categoryId}`),
    {
      replace: true,
    },
  )
} else {
  console.error('Failed to create change:', result)
}
</script>
