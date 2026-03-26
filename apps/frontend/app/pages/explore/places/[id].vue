<template>
  <div>
    <NavTopbar :title="data?.place?.name ?? undefined" :loading="loading" back="true" />
    <ul class="list rounded-box bg-base-100 shadow-md">
      <li class="p-4 pb-2 text-xs tracking-wide opacity-60">Place</li>
      <li v-if="loading" class="list-row">
        <div class="h-4 w-28 skeleton" />
        <div class="h-4 w-full skeleton" />
        <div class="h-4 w-full skeleton" />
      </li>

      <div v-if="data" />

      <li v-else>There are no items to show</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { graphql } from '~/gql'

const route = useRoute()
const placeQuery = graphql(`
  query GetPlace($id: ID!) {
    place(id: $id) {
      id
      name
      desc
    }
  }
`)
const vars = {
  id: route.params.id as string,
}

const { result: data, loading } = useQuery(placeQuery, vars)

const recentStore = useRecentStore()
onMounted(() => {
  recentStore.add({ id: vars.id as string, __typename: 'Place' })
})
</script>
