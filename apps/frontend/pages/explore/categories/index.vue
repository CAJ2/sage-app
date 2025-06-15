<template>
  <div>
    <NavTopbar title="Categories" back="true"></NavTopbar>
    <ModelCategoryChildren
      v-if="data"
      :status="status"
      :data="data.rootCategory.children"
    ></ModelCategoryChildren>
  </div>
</template>

<script setup lang="ts">
import { graphql } from '~/gql'
const categoriesQuery = graphql(`
  query CategoriesIndexGetCategories {
    rootCategory {
      children {
        nodes {
          id
          name
          desc_short
          desc
          image_url
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
