<template>
  <div>
    <NavTopbar title="Categories" back="true"></NavTopbar>
    <ModelCategoryChildren
      :status="status"
      :data="data?.rootCategory"
    ></ModelCategoryChildren>
  </div>
</template>

<script setup lang="ts">
const categoriesQuery = gql`
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
`
const vars = {
  limit: 20,
}

type CategoryResult = {
  rootCategory: {
    children: {
      nodes: {
        id: string
        name: string
        desc_short: string
        desc: string
        image_url: string
      }[]
    }
  }
}

const { status, data } = await useLazyAsyncQuery<CategoryResult>(
  categoriesQuery,
  vars,
)
</script>
