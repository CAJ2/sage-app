<template>
  <div>
    <NavTopbar
      :title="data?.category.name || 'Category'"
      back="true"
    ></NavTopbar>
    <ModelCategoryChildren
      :status="status"
      :data="data?.category.children"
    ></ModelCategoryChildren>
    <UiList
      v-if="sessionData && data"
      :items="[
        {
          id: 'edit',
          link: `/explore/categories/${data.category.id}/edit`,
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
    category(id: $id) {
      id
      name
      descShort
      desc
      imageURL
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
`
const vars = {
  id: route.params.id,
}

type CategoryResult = {
  category: {
    id: string
    name: string
    descShort: string
    desc: string
    imageURL: string
    children: {
      nodes: {
        id: string
        name: string
        descShort: string
        desc: string
        imageURL: string
      }[]
    }
  }
}

const { status, data } = await useLazyAsyncQuery<CategoryResult>(
  categoriesQuery,
  vars,
)
</script>
