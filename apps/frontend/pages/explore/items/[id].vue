<template>
  <div>
    <NavTopbar :title="data?.item?.name || 'Item'" back="true"></NavTopbar>
    <ul class="list bg-base-100 rounded-box shadow-md">
      <li class="p-4 pb-2 text-xs opacity-60 tracking-wide">Product</li>
      <li v-if="status === 'pending'" class="list-row">
        <div class="skeleton h-4 w-28"></div>
        <div class="skeleton h-4 w-full"></div>
        <div class="skeleton h-4 w-full"></div>
      </li>

      <div v-if="data"></div>

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
