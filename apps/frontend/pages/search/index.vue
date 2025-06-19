<template>
  <div>
    <div class="flex justify-center">
      <div class="w-full p-5 mb-[64px] max-w-2xl">
        <Tabs
          v-model:model-value="activeTab"
          class="w-full"
          default-value="search"
        >
          <TabsList
            aria-label="Manage your account"
            class="grid w-full grid-cols-2"
          >
            <TabsTrigger value="search">
              <font-awesome-icon
                icon="fa-solid fa-magnifying-glass"
                class="w-4 h-4 mr-2"
              />
              Search
            </TabsTrigger>
            <TabsTrigger value="scan">
              <font-awesome-icon
                icon="fa-solid fa-qrcode"
                class="w-4 h-4 mr-2"
              />
              Scan
            </TabsTrigger>
          </TabsList>
          <TabsContent value="search">
            <div class="relative items-center">
              <FormInput
                id="search"
                v-model="searchInput"
                type="text"
                placeholder="Search..."
                class="pl-10"
              />
              <span
                class="absolute start-0 inset-y-0 flex items-center justify-center px-2"
              >
                <font-awesome-icon
                  icon="fa-solid fa-magnifying-glass"
                  class="text-neutral-700"
                ></font-awesome-icon>
              </span>
            </div>
            <ul class="list bg-base-100 rounded-box shadow-md mt-4 mb-6">
              <li class="px-4 py-2 text-xs opacity-60 tracking-wide">
                Search Results ({{ data?.search.totalCount || 0 }})
              </li>
              <li v-if="status === 'pending'" class="list-row">
                <div class="skeleton h-4 w-28"></div>
                <div class="skeleton h-4 w-full"></div>
                <div class="skeleton h-4 w-full"></div>
              </li>

              <div v-if="data && status !== 'pending'">
                <li v-for="res in data.search.nodes" :key="res.id">
                  <div
                    v-if="res.id"
                    class="list-row flex flex-col gap-0 pt-2 pb-3"
                  >
                    <p class="text-xs text-neutral-500 uppercase pb-2">
                      {{ formatType(res.__typename) }}
                    </p>
                    <div class="flex items-center gap-2">
                      <img
                        v-if="res.image_url"
                        class="size-12 rounded-box"
                        :src="res.image_url"
                      />
                      <span
                        v-else
                        class="flex items-center justify-center rounded-box border-1 border-neutral-200 size-12"
                      >
                        <font-awesome-icon
                          :icon="placeholderIcon(res.__typename)"
                          class="size-6 h-6! p-1"
                        />
                      </span>
                      <div class="flex-1 px-2">
                        <div class="text-bold">
                          {{ res.name || res.name_null }}
                        </div>
                        <div class="text-xs opacity-70">
                          {{ res.desc_short }}
                        </div>
                      </div>
                      <NuxtLinkLocale :to="exploreLink(res.__typename, res.id)">
                        <button class="btn btn-square btn-ghost">
                          <font-awesome-icon
                            icon="fa-solid fa-angle-right"
                            class="size-[1.2em]"
                          />
                        </button>
                      </NuxtLinkLocale>
                    </div>
                  </div>
                </li>
              </div>

              <li
                v-if="data?.search.nodes.length === 0 && searchInput.length > 0"
                class="list-row"
              >
                No results found for "{{ searchInput }}"
              </li>
              <li
                v-if="!data && searchInput.length === 0"
                class="list-row flex items-center justify-center"
              >
                <div class="text-neutral-500">Search for anything</div>
              </li>
            </ul>
          </TabsContent>
          <TabsContent value="scan">
            <SearchScanner></SearchScanner>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watchDebounced } from '@vueuse/core'

onMounted(() => {
  document.getElementById('search')?.focus()
})

const searchQuery = gql`
  query Search($query: String!) {
    search(query: $query) {
      nodes {
        __typename
        ... on Category {
          id
          name
          desc_short
          desc
          image_url
        }
        ... on Item {
          id
          name_null: name
          desc
          image_url
        }
        ... on Variant {
          id
          name_null: name
          desc
        }
        ... on Place {
          id
          name_null: name
          address {
            street
            city
            region
            country
          }
        }
        ... on Org {
          id
          name
          desc
        }
      }
      totalCount
    }
  }
`
const activeTab = ref('search')
const searchInput = shallowRef('')
const status = ref('idle')
const data = ref<SearchResult | null>(null)

type SearchResult = {
  search: {
    nodes: {
      id: string
      name: string
      name_null: string
      desc_short: string
      desc: string
      image_url: string
      __typename: string
    }[]
    totalCount: number
  }
}

watchDebounced(
  searchInput,
  async () => {
    if (searchInput.value.length < 2) {
      return
    }
    status.value = 'pending'
    const results = await useLazyAsyncQuery<SearchResult>(searchQuery, {
      query: searchInput.value,
    })
    status.value = results.status.value
    data.value = results.data.value
  },
  { debounce: 300 },
)

const formatType = (type: string) => {
  switch (type) {
    case 'Category':
      return 'Category'
    case 'Variant':
      return 'Product'
    case 'Org':
      return 'Organization'
    default:
      return type
  }
}
const placeholderIcon = (type: string) => {
  switch (type) {
    case 'Category':
      return 'fa-solid fa-box'
    case 'Item':
      return 'fa-solid fa-cube'
    case 'Variant':
      return 'fa-solid fa-tags'
    case 'Org':
      return 'fa-solid fa-building'
    case 'Place':
      return 'fa-solid fa-map-marker-alt'
    default:
      return 'fa-solid fa-question'
  }
}
const exploreLink = (type: string, id: string) => {
  switch (type) {
    case 'Category':
      return `/explore/categories/${id}`
    case 'Item':
      return `/explore/items/${id}`
    case 'Variant':
      return `/explore/variants/${id}`
    case 'Org':
      return `/explore/orgs/${id}`
    case 'Place':
      return `/places/${id}`
    default:
      return '#'
  }
}
</script>
