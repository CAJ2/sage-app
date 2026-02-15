<template>
  <div>
    <div class="mb-4 flex cursor-pointer items-center">
      <div class="flex grow flex-col gap-1">
        <h4 class="text-sm opacity-60">Selected Region:</h4>
        <h3 class="text-lg font-bold">
          {{ regionStatus !== 'idle' ? regionData?.region.name : 'No region selected' }}
        </h3>
        <p class="text-sm opacity-70">
          {{ regionStatus !== 'idle' ? placeType : '' }}
        </p>
      </div>
      <button
        v-if="regionStore.selectedRegion"
        class="btn mx-3 btn-square btn-ghost"
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
        <span class="absolute inset-y-0 start-0 flex items-center justify-center px-2">
          <font-awesome-icon icon="fa-solid fa-magnifying-glass" class="text-neutral-700" />
        </span>
      </div>
      <ul class="list mt-4 mb-6 rounded-box bg-base-100 shadow-md">
        <li class="px-4 py-2 text-xs tracking-wide opacity-60">
          Search Results ({{ searchData?.search.totalCount || 0 }})
        </li>
        <li v-if="searchStatus === 'pending'" class="list-row">
          <div class="h-4 w-28 skeleton" />
          <div class="h-4 w-full skeleton" />
          <div class="h-4 w-full skeleton" />
        </li>

        <div v-if="searchData && searchStatus !== 'pending'" class="divide-y border-neutral-200">
          <li v-for="res in searchData.search.nodes" :key="res.id" class="border-neutral-200">
            <div v-if="res.id" class="list-row flex flex-col gap-0 pt-2 pb-3">
              <div class="flex items-center gap-2">
                <span
                  class="flex size-12 items-center justify-center rounded-box border-1 border-neutral-200"
                >
                  <font-awesome-icon icon="fa-solid fa-globe" class="size-6 h-6! p-1" />
                </span>
                <div class="flex flex-1 flex-col px-2">
                  <div class="text-bold">
                    {{ res.name }}
                  </div>
                  <p class="text-sm opacity-70">
                    {{ formatPlaceType(res.placetype) }}
                  </p>
                </div>
                <button class="btn btn-primary" @click.stop="selectRegion(res.id)">Select</button>
              </div>
            </div>
          </li>
        </div>

        <li v-if="searchData?.search.nodes.length === 0 && searchInput.length > 0" class="list-row">
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

const { data: regionData, status: regionStatus } = await useLazyAsyncQuery<RegionResult>(
  regionQuery,
  {
    id: regionStore.selectedRegion,
  },
)

watchDebounced(
  searchInput,
  async () => {
    const { data, status } = await useLazyAsyncQuery<SearchResult>(searchQuery, {
      query: searchInput.value,
    })
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
