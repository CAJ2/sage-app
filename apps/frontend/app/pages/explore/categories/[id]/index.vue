<template>
  <div>
    <NavTopbar :title="data?.category.name" :loading="loading" back="true" />
    <ModelCategoryChildren :status="status" :data="data?.category.children" />
    <UiList
      v-if="sessionData && data"
      :items="[
        {
          id: 'edit',
          link: `/explore/categories/${data.category.id}/edit`,
          title: 'Edit Category',
          icon: SquarePen,
        },
      ]"
    />
  </div>
</template>

<script setup lang="ts">
import { SquarePen } from '@lucide/vue'

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
  id: route.params.id as string,
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

const { result: data, loading } = useQuery<CategoryResult>(categoriesQuery, vars)
const status = computed(() => (loading.value ? 'pending' : 'success'))

const recentStore = useRecentStore()
onMounted(() => {
  recentStore.add({ id: vars.id as string, __typename: 'Category' })
})
</script>
