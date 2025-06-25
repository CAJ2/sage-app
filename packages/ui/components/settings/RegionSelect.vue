<template>
  <div>
    <div class="flex items-center mb-4 cursor-pointer">
      <div class="flex grow flex-col gap-1">
        <h4 class="text-sm opacity-60">Selected Region:</h4>
        <h3 class="text-lg font-bold">
          {{
            regionStatus !== 'idle'
              ? regionData?.region.name
              : 'No region selected'
          }}
        </h3>
        <p class="text-sm opacity-70">
          {{ regionStatus !== 'idle' ? placeType : '' }}
        </p>
      </div>
      <button
        v-if="regionStore.selectedRegion"
        class="btn btn-ghost btn-square mx-3"
        @click="selectRegion('')"
      >
        <font-awesome-icon icon="fa-solid fa-xmark" class="size-[1.2em]" />
      </button>
    </div>
    <div>
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
          Search Results ({{ searchData?.search.totalCount || 0 }})
        </li>
        <li v-if="searchStatus === 'pending'" class="list-row">
          <div class="skeleton h-4 w-28"></div>
          <div class="skeleton h-4 w-full"></div>
          <div class="skeleton h-4 w-full"></div>
        </li>

        <div
          v-if="searchData && searchStatus !== 'pending'"
          class="divide-y border-neutral-200"
        >
          <li
            v-for="res in searchData.search.nodes"
            :key="res.id"
            class="border-neutral-200"
          >
            <div v-if="res.id" class="list-row flex flex-col gap-0 pt-2 pb-3">
              <div class="flex items-center gap-2">
                <span
                  class="flex items-center justify-center rounded-box border-1 border-neutral-200 size-12"
                >
                  <font-awesome-icon
                    icon="fa-solid fa-globe"
                    class="size-6 h-6! p-1"
                  />
                </span>
                <div class="flex-1 px-2 flex flex-col">
                  <div class="text-bold">
                    {{ res.name }}
                  </div>
                  <p class="text-sm opacity-70">
                    {{ formatPlaceType(res.placetype) }}
                  </p>
                </div>
                <button
                  class="btn btn-primary"
                  @click.stop="selectRegion(res.id)"
                >
                  Select
                </button>
              </div>
            </div>
          </li>
        </div>

        <li
          v-if="searchData?.search.nodes.length === 0 && searchInput.length > 0"
          class="list-row"
        >
          No results found for "{{ searchInput }}"
        </li>
        <li
          v-if="!searchData && searchInput.length === 0"
          class="list-row flex items-center justify-center"
        >
          <div class="text-neutral-500">Search for a region</div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watchDebounced } from '@vueuse/core'

const router = useRouter()

const emit = defineEmits<{
  update: [region: string]
}>()

const regionQuery = gql`
  query RegionSelectQuery($id: ID!) {
    region(id: $id) {
      id
      name
      placetype
    }
  }
`
type RegionResult = {
  region: {
    id: string
    name?: string
    placetype: string
  }
}
const searchQuery = gql`
  query RegionSelectSearch($query: String!) {
    search(query: $query, types: [REGION]) {
      nodes {
        __typename
        ... on Region {
          id
          name
          placetype
        }
      }
      totalCount
    }
  }
`
type SearchResult = {
  search: {
    nodes: {
      __typename: string
      id: string
      name?: string
      placetype: string
    }[]
    totalCount: number
  }
}

const regionStore = useRegionStore()

const searchInput = ref('')
const searchData = ref<SearchResult | null>(null)
const searchStatus = ref('idle')

const { data: regionData, status: regionStatus } =
  await useLazyAsyncQuery<RegionResult>(regionQuery, {
    id: regionStore.selectedRegion,
  })

watchDebounced(
  searchInput,
  async () => {
    const { data, status } = await useLazyAsyncQuery<SearchResult>(
      searchQuery,
      {
        query: searchInput.value,
      },
    )
    searchData.value = data.value
    searchStatus.value = status.value
  },
  {
    debounce: 300,
  },
)

const selectRegion = async (regionId: string) => {
  regionStore.setRegion(regionId)
  emit('update', regionId)
  const { data, status } = await useAsyncQuery<RegionResult>(regionQuery, {
    id: regionStore.selectedRegion,
  })
  regionData.value = data.value
  regionStatus.value = status.value
  router.back()
}

const placetypeMap: Record<string, string> = {
  neighbourhood: 'Neighbourhood',
  localadmin: 'Local Admin',
  locality: 'Locality',
  county: 'County',
  region: 'Region',
}

const formatPlaceType = (type: string) => {
  return placetypeMap[type] || type
}

const placeType = computed(() => {
  const placetype = regionData.value?.region.placetype
  if (!placetype) return ''
  return formatPlaceType(placetype)
})
</script>
