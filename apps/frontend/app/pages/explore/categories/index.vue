<template>
  <div>
    <ModelCategoryChildren v-if="data" :status="status" :data="data.categoryRoot.children" />
  </div>
</template>

<script setup lang="ts">
import { graphql } from '~/gql'

useTopbar({ title: 'Categories', back: 'true' })

const categoriesQuery = graphql(`
  query CategoriesIndexGetCategories {
    categoryRoot {
      children {
        nodes {
          id
          name
          descShort
          desc
          imageURL
        }
      }
    }
  }
`)

const { result: data, loading } = useQuery(categoriesQuery)
const status = computed(() => (loading.value ? 'pending' : 'success'))
</script>
