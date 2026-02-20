<template>
  <div>
    <NavTopbar title="Categories" back="true" />
    <ModelCategoryChildren v-if="data" :status="status" :data="data.categoryRoot.children" />
  </div>
</template>

<script setup lang="ts">
import { graphql } from '~/gql'
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
const vars = {
  limit: 20,
}

const { status, data } = await useLazyAsyncQuery(categoriesQuery, vars)
</script>
