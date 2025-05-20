<template>
  <div>
    <div class="map-wrap">
      <div ref="mapContainer" class="map"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import maplibregl, { Map, NavigationControl } from 'maplibre-gl'
import { Protocol } from 'pmtiles'
import type { ShallowRef } from 'vue'

const mapContainer = shallowRef(null)
const map: ShallowRef<Map | null> = shallowRef(null)

const protocol = new Protocol()
maplibregl.addProtocol('pmtiles', protocol.tile)

onMounted(() => {
  if (!mapContainer.value) {
    return
  }
  map.value = new Map({
    container: mapContainer.value,
    style: 'map-style-light.json',
    center: [0, 0],
    zoom: 1,
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
