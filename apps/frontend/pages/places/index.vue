<template>
  <div>
    <div
      class="fixed top-0 z-10 w-[calc(100vw-70px)] max-w-2xl bg-white shadow-md text-black m-4 rounded-full focus-visible:outline-hidden flex"
    >
      <span class="flex items-center justify-center px-2">
        <font-awesome-icon
          icon="fa-solid fa-magnifying-glass"
          class="text-neutral-700 mx-2"
        ></font-awesome-icon>
      </span>
      <input
        id="search"
        v-model="searchInput"
        type="text"
        placeholder="Search..."
        class="w-full p-2"
      />
    </div>
    <div class="map-wrap">
      <div ref="mapContainer" class="map"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watchDebounced } from '@vueuse/core'
import maplibregl, {
  Map,
  NavigationControl,
  type LngLatLike,
} from 'maplibre-gl'
import { Protocol } from 'pmtiles'
import type { ShallowRef } from 'vue'

const searchInput = ref('')

const regionStore = useRegionStore()
const regionQuery = gql`
  query RegionQuery($id: ID!) {
    getRegion(id: $id) {
      id
      name
      placetype
      bbox
      min_zoom
    }
  }
`
type RegionResult = {
  getRegion: {
    id: string
    name?: string
    placetype: string
    bbox?: [number, number, number, number]
    min_zoom?: number
  }
}
const { data: regionData } = await useAsyncQuery<RegionResult>(regionQuery, {
  id: regionStore.selectedRegion,
})

const mapContainer = shallowRef(null)
const map: ShallowRef<Map | null> = shallowRef(null)

const mapBounds = ref<[number, number][] | null>(null)

const protocol = new Protocol()
maplibregl.addProtocol('pmtiles', protocol.tile)

const placeSearch = gql`
  query PlaceSearch($search: String!, $latLong: [Float!]) {
    search(query: $search, types: [PLACE], lat_long: $latLong) {
      nodes {
        ... on Place {
          id
          name
          address {
            city
          }
          location {
            latitude
            longitude
          }
        }
      }
      totalCount
    }
  }
`
type PlaceSearchResult = {
  search: {
    nodes: Array<{
      id: string
      name: string
      address?: {
        city?: string
      }
      location: {
        latitude: number
        longitude: number
      }
    }>
    totalCount: number
  }
}
const search = useQuery<PlaceSearchResult>(placeSearch, {
  search: searchInput.value,
  latLong: [
    mapBounds.value ? mapBounds.value[1][1] : 0,
    mapBounds.value ? mapBounds.value[1][0] : 0,
    mapBounds.value ? mapBounds.value[0][1] : 0,
    mapBounds.value ? mapBounds.value[0][0] : 0,
  ],
})
let markers: Pick<maplibregl.Marker, 'remove'>[] = []

watch(
  () => search.result.value,
  () => {
    if (map.value && search.result.value) {
      markers.forEach((marker) => marker.remove())
      markers = []
      search.result.value.search.nodes.forEach((place) => {
        if (!place.location) {
          return
        }
        const marker = new maplibregl.Marker({ color: '#005d58' })
          .setLngLat([place.location.longitude, place.location.latitude])
          .setPopup(
            new maplibregl.Popup().setHTML(
              `<strong class="text-primary">${place.name}</strong><br>${place.address || ''}`,
            ),
          )
          .addTo(map.value!)
        markers.push(marker)
      })
    }
  },
)

watchDebounced(
  searchInput,
  async (newSearch) => {
    if (!newSearch.trim()) {
      return
    }
    if (!mapBounds.value) {
      return
    }
    search.refetch({
      search: searchInput.value,
      latLong: [
        mapBounds.value[1][1],
        mapBounds.value[1][0],
        mapBounds.value[0][1],
        mapBounds.value[0][0],
      ],
    })
  },
  { debounce: 300 },
)

onMounted(() => {
  if (!mapContainer.value) {
    return
  }
  const center: LngLatLike = regionData.value?.getRegion?.bbox
    ? [
        (regionData.value.getRegion.bbox[0] +
          regionData.value.getRegion.bbox[2]) /
          2,
        (regionData.value.getRegion.bbox[1] +
          regionData.value.getRegion.bbox[3]) /
          2,
      ]
    : [0, 0]
  map.value = new Map({
    container: mapContainer.value,
    style: 'map-style-light.json',
    center,
    zoom: regionData.value?.getRegion?.min_zoom || 2,
  })
  map.value.addControl(new NavigationControl(), 'top-right')
  const getBounds = () => {
    if (!map.value) {
      return null
    }
    mapBounds.value = map.value.getBounds().toArray()
  }
  getBounds()
  map.value.on('moveend', getBounds)
})

onUnmounted(() => {
  if (map.value) {
    map.value.remove()
  }
})
</script>

<style scoped>
.map-wrap {
  position: relative;
  width: 100%;
  height: calc(
    100vh - 64px
  ); /* calculate height of the screen minus the nav bar */
}

.map {
  position: absolute;
  width: 100%;
  height: 100%;
}

.watermark {
  position: absolute;
  left: 10px;
  bottom: 10px;
  z-index: 999;
}
</style>
