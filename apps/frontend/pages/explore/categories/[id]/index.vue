<template>
  <div>
    <NavTopbar
      :title="data?.getCategory.name || 'Category'"
      back="true"
    ></NavTopbar>
    <ModelCategoryChildren
      :status="status"
      :data="data?.getCategory.children"
    ></ModelCategoryChildren>
    <UiList
      v-if="sessionData && data"
      :items="[
        {
          id: 'edit',
          link: `/explore/categories/${data.getCategory.id}/edit`,
          title: 'Edit Category',
          icon: 'fa-solid fa-pen-to-square',
        },
      ]"
    ></UiList>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const sessionData = useAuthSession()
const categoriesQuery = gql`
  query CategoriesIDGetCategories($id: ID!) {
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
