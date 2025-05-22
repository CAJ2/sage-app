<template>
  <div>
    <NavTopbar
      :title="data?.getVariant.name || 'Product'"
      :subtitle="data?.getVariant.orgs.nodes.map((o) => o.name).join(', ')"
      :use-image="true"
      :image="data?.getVariant.image_url"
      back="true"
    ></NavTopbar>
    <div class="p-3">
      <ScoreBar :score="40"></ScoreBar>
    </div>
    <ul class="list bg-base-100 rounded-box shadow-md">
      <li class="p-4 pb-2 text-xs opacity-60 tracking-wide">Components</li>
      <li v-if="status === 'pending'" class="list-row">
        <div class="skeleton h-4 w-28"></div>
        <div class="skeleton h-4 w-full"></div>
        <div class="skeleton h-4 w-full"></div>
      </li>

      <div v-if="data">
        <li
          v-for="component in data.getVariant.components.nodes"
          :key="component.id"
          class="list-row"
        >
          <div>
            <img class="size-10 rounded-box" :src="component.image_url" />
          </div>
          <div>
            <div class="text-bold">{{ component.name }}</div>
            <div class="text-xs opacity-70">
              {{ component.desc }}
            </div>
          </div>
        </li>
      </div>

      <li v-else>There are no components to show</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const variantQuery = gql`
  query GetVariant($id: ID!) {
    getVariant(id: $id) {
      id
      name
      desc
      image_url
      orgs {
        nodes {
          id
          name
          desc
          avatar_url
        }
      }
      components {
        nodes {
          id
          name
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

type VariantResult = {
  getVariant: {
    id: string
    name: string
    desc: string
    image_url: string
    orgs: {
      nodes: {
        id: string
        name: string
        desc: string
        avatar_url: string
      }[]
    }
    components: {
      nodes: {
        id: string
        name: string
        desc: string
        image_url: string
      }[]
    }
  }
}

const { status, data } = await useLazyAsyncQuery<VariantResult>(
  variantQuery,
  vars,
)
</script>
