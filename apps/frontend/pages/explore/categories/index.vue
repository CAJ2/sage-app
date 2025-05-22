<template>
  <div>
    <NavTopbar title="Categories" back="true"></NavTopbar>
    <ul class="list bg-base-100 rounded-box shadow-md">
      <li class="p-4 pb-2 text-xs opacity-60 tracking-wide">
        Browse by Category
      </li>
      <li v-if="status === 'pending'" class="list-row">
        <div class="skeleton h-4 w-28"></div>
        <div class="skeleton h-4 w-full"></div>
        <div class="skeleton h-4 w-full"></div>
      </li>

      <div v-if="data">
        <li
          v-for="category in data.rootCategory.children.nodes"
          :key="category.id"
        >
          <NuxtLink :to="`/explore/categories/${category.id}`" class="list-row">
            <div>
              <img class="size-10 rounded-box" :src="category.image_url" />
            </div>
            <div>
              <div class="text-bold">{{ category.name }}</div>
              <div class="text-xs opacity-70">
                {{ category.desc_short }}
              </div>
            </div>
            <button class="btn btn-square btn-ghost">
              <svg
                class="size-[1.2em]"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <g
                  stroke-linejoin="round"
                  stroke-linecap="round"
                  stroke-width="2"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
                  ></path>
                </g>
              </svg>
            </button>
          </NuxtLink>
        </li>
      </div>

      <li v-else>There are no categories to show</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const categoriesQuery = gql`
  query GetCategories {
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
console.log('categoriesQuery', data.value)
</script>
