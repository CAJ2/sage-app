<template>
  <div class="flex flex-col gap-4">
    <!-- Use Current Location toggle -->
    <div class="card bg-base-100 shadow-md">
      <div class="card-body p-4">
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <LocateIcon class="size-4 shrink-0" />
            <div class="flex flex-col">
              <span class="text-sm font-medium">Use Current Location</span>
              <span v-if="locating" class="text-xs opacity-60">Getting location…</span>
            </div>
          </div>
          <FormSwitch v-model="usingLocation" :disabled="locating" />
        </div>
        <p v-if="locationError" class="mt-1 text-sm text-error">{{ locationError }}</p>
      </div>
    </div>

    <!-- Selected Region display -->
    <SettingsRegionDisplay
      v-if="regionStore.selectedRegion && regionStatus !== 'idle' && regionData?.region"
      :name="regionData.region.name ?? ''"
      :placetype="placeType"
      :bbox="regionData.region.bbox"
      :min-zoom="regionData.region.minZoom"
      @clear="clearRegion"
    />

    <!-- Divider + manual search (hidden when using current location) -->
    <template v-if="!locationLatLon">
      <div class="flex items-center gap-2 text-xs opacity-50">
        <div class="h-px grow bg-current" />
        <span>or search manually</span>
        <div class="h-px grow bg-current" />
      </div>

      <!-- Search input -->
      <div class="relative">
        <span class="pointer-events-none absolute inset-y-0 start-0 flex items-center px-3">
          <SearchIcon class="size-4 text-neutral-500" />
        </span>
        <FormInput
          v-model="searchInput"
          type="text"
          placeholder="Search for a region…"
          class="pl-9"
        />
      </div>

      <!-- Search results -->
      <ul v-if="searchInput.length > 0" class="list rounded-box bg-base-100 shadow-md">
        <li class="px-4 py-2 text-xs tracking-wide opacity-60">
          Results ({{ searchData?.search.totalCount || 0 }})
        </li>

        <li v-if="searchStatus === 'pending'" class="list-row">
          <div class="flex flex-col gap-2 py-2">
            <div class="h-4 w-28 skeleton" />
            <div class="h-3 w-full skeleton" />
          </div>
        </li>

        <template v-if="searchData && searchStatus !== 'pending'">
          <li
            v-for="res in searchData.search.nodes"
            :key="res.id"
            class="list-row border-t border-neutral-200 first:border-t-0"
          >
            <div class="flex items-center gap-3 py-2">
              <span
                class="flex size-10 shrink-0 items-center justify-center rounded-lg border border-neutral-200"
              >
                <GlobeIcon class="size-5" />
              </span>
              <div class="flex min-w-0 flex-1 flex-col">
                <span class="truncate font-medium">{{ res.name }}</span>
                <span class="text-sm opacity-60">{{ formatPlaceType(res.placetype) }}</span>
              </div>
              <button class="btn shrink-0 btn-sm btn-primary" @click.stop="selectRegion(res.id)">
                Select
              </button>
            </div>
          </li>
          <li v-if="searchData.search.nodes.length === 0" class="list-row text-sm opacity-60">
            No results for "{{ searchInput }}"
          </li>
        </template>
      </ul>

      <div
        v-else-if="!regionStore.selectedRegion"
        class="flex justify-center py-4 text-sm opacity-50"
      >
        Search for a region or use your location
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { GlobeIcon, LocateIcon, SearchIcon } from '@lucide/vue'
import { isTauri } from '@tauri-apps/api/core'
import { watchDebounced } from '@vueuse/core'

const emit = defineEmits<{
  update: [region: string]
}>()

const regionQuery = gql`
  query RegionSelectQuery($id: ID!) {
    region(id: $id) {
      id
      name
      placetype
      bbox
      minZoom
    }
  }
`
type RegionResult = {
  region: {
    id: string
    name?: string
    placetype: string
    bbox?: number[]
    minZoom?: number
  }
}

const currentRegionQuery = gql`
  query RegionSelectCurrentRegion {
    currentRegion {
      region {
        id
        name
        placetype
        bbox
        minZoom
      }
    }
  }
`
type CurrentRegionResult = {
  currentRegion: {
    region: {
      id: string
      name?: string
      placetype: string
      bbox?: number[]
      minZoom?: number
    } | null
  } | null
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
await regionStore.load()
const { locationLatLon } = storeToRefs(regionStore)

const usingLocation = computed({
  get: () => locationLatLon.value !== null,
  set: (val: boolean) => onLocationToggle(val),
})

const searchInput = ref('')
const searchData = ref<SearchResult | null>(null)
const searchStatus = ref('idle')
const locating = ref(false)
const locationError = ref<string | null>(null)

const { data: regionData, status: regionStatus } = await useLazyAsyncQuery<RegionResult>(
  regionQuery,
  {
    id: regionStore.selectedRegion,
  },
)

watchDebounced(
  searchInput,
  async () => {
    if (!searchInput.value) {
      searchData.value = null
      searchStatus.value = 'idle'
      return
    }
    searchStatus.value = 'pending'
    const { data, status } = await useLazyAsyncQuery<SearchResult>(searchQuery, {
      query: searchInput.value,
    })
    searchData.value = data.value
    searchStatus.value = status.value
  },
  { debounce: 300 },
)

const selectRegion = async (regionId: string) => {
  regionStore.setRegion(regionId)
  emit('update', regionId)
  const { data, status } = await useAsyncQuery<RegionResult>(regionQuery, {
    id: regionId,
  })
  regionData.value = data.value
  regionStatus.value = status.value
}

const clearRegion = () => {
  regionStore.clearLocation()
  regionData.value = null
  regionStatus.value = 'idle'
}

async function onLocationToggle(checked: boolean) {
  if (!checked) {
    regionStore.clearLocation()
    return
  }
  await requestGeolocation()
}

async function requestGeolocation() {
  locating.value = true
  locationError.value = null
  try {
    let lat: number, lon: number

    if (isTauri()) {
      const { checkPermissions, requestPermissions, getCurrentPosition } =
        await import('@tauri-apps/plugin-geolocation')
      let permissions = await checkPermissions()
      if (permissions.location === 'prompt' || permissions.location === 'prompt-with-rationale') {
        permissions = await requestPermissions(['location'])
      }
      if (permissions.location !== 'granted') {
        locationError.value = 'Location permission denied. Please enable it in settings.'
        return
      }
      const pos = await getCurrentPosition()
      lat = pos.coords.latitude
      lon = pos.coords.longitude
    } else {
      const pos = await new Promise<GeolocationPosition>((res, rej) => {
        navigator.geolocation.getCurrentPosition(res, rej)
      })
      lat = pos.coords.latitude
      lon = pos.coords.longitude
    }

    const latLon = `${lat},${lon}`
    regionStore.setCurrentLocation(latLon)

    const { data } = await useAsyncQuery<CurrentRegionResult>(currentRegionQuery)
    const region = data.value?.currentRegion?.region
    if (region?.id) {
      regionStore.setRegion(region.id)
      const { data: rd, status: rs } = await useAsyncQuery<RegionResult>(regionQuery, {
        id: region.id,
      })
      regionData.value = rd.value
      regionStatus.value = rs.value
    } else {
      locationError.value = 'Could not determine your region. Please search manually.'
    }
  } catch {
    locationError.value = 'Could not get location. Please search manually.'
  } finally {
    locating.value = false
  }
}

const placetypeMap: Record<string, string> = {
  neighbourhood: 'Neighbourhood',
  localadmin: 'Local Admin',
  locality: 'Locality',
  county: 'County',
  region: 'Region',
}

const formatPlaceType = (type: string) => placetypeMap[type] || type

const placeType = computed(() => {
  const placetype = regionData.value?.region.placetype
  return placetype ? formatPlaceType(placetype) : ''
})
</script>
