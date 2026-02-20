<template>
  <div>
    <NavTopbar :title="data?.item?.name || 'Item'" back="true" />
    <ul class="list rounded-box bg-base-100 shadow-md">
      <li class="p-4 pb-2 text-xs tracking-wide opacity-60">Product</li>
      <li v-if="status === 'pending'" class="list-row">
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
const itemQuery = graphql(`
  query GetItem($id: ID!) {
    item(id: $id) {
      id
      name
      desc
      imageURL
    }
  }
`)
const vars = {
  id: route.params.id,
}

const { status, data } = await useLazyAsyncQuery(itemQuery, vars)
</script>
