<template>
  <div>
    <NavTopbar
      :title="data?.getCategory.name || 'Category'"
      back="true"
    ></NavTopbar>
    <ModelCategoryChildren
      :status="status"
      :data="data?.getCategory"
    ></ModelCategoryChildren>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const categoriesQuery = gql`
  query GetCategories($id: ID!) {
    getCategory(id: $id) {
      id
      name
      desc_short
      desc
      image_url
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
  id: route.params.id,
}

type CategoryResult = {
  getCategory: {
    id: string
    name: string
    desc_short: string
    desc: string
    image_url: string
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
