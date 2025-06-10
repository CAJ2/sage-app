<template>
  <div>
    <NavTopbar :title="data?.getPlace.name || 'Place'" back="true"></NavTopbar>
    <ul class="list bg-base-100 rounded-box shadow-md">
      <li class="p-4 pb-2 text-xs opacity-60 tracking-wide">Place</li>
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
const route = useRoute()
const placeQuery = gql`
  query GetPlace($id: ID!) {
    getPlace(id: $id) {
      id
      name
      desc
    }
  }
`
const vars = {
  id: route.params.id,
}

type PlaceResult = {
  getPlace: {
    id: string
    name: string
    desc: string
    image_url: string
  }
}

const { status, data } = await useLazyAsyncQuery<PlaceResult>(placeQuery, vars)
</script>
