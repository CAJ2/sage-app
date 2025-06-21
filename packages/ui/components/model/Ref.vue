<template>
  <ul class="list">
    <ModelListCategory v-if="type === 'Category' && data" :category="data" />
  </ul>
</template>

<script setup lang="ts">
import { graphql } from '~/gql'

const { type, id } = defineProps<{
  type: string
  id: string
}>()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data = ref<any>()
if (type === 'Category') {
  const RefCategoryQuery = graphql(`
    query RefCategoryQuery($id: ID!) {
      getCategory(id: $id) {
        ...ListCategoryFragment
      }
    }
  `)
  const { result, refetch } = useQuery(RefCategoryQuery, {
    id,
  })
  watch(
    result,
    (result) => {
      if (result && result.getCategory) {
        data.value = result.getCategory
      }
    },
    {
      immediate: true,
    },
  )
  watch(
    () => id,
    async (newId) => {
      if (newId) {
        await refetch({ id: newId })
      }
    },
  )
}
</script>
