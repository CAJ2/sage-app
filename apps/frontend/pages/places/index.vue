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

const protocol = new Protocol()
maplibregl.addProtocol('pmtiles', protocol.tile)

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
  console.log('Map Center:', center)
  map.value = new Map({
    container: mapContainer.value,
    style: 'map-style-light.json',
    center,
    zoom: regionData.value?.getRegion?.min_zoom || 2,
  })
  map.value.addControl(new NavigationControl(), 'top-right')
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
