import { defineStore } from 'pinia'

export const useRegionStore = defineStore(
  'region',
  () => {
    const selectedRegion = ref('')
    const useCurrentLocation = ref(false)
    const locationLatLon = ref<string | null>(null)

    const isRegionSelected = computed(() => !!selectedRegion.value)

    function setRegion(region: string) {
      selectedRegion.value = region
    }

    function setCurrentLocation(latLon: string) {
      useCurrentLocation.value = true
      locationLatLon.value = latLon
      selectedRegion.value = ''
    }

    function clearLocation() {
      useCurrentLocation.value = false
      locationLatLon.value = null
    }

    return {
      selectedRegion,
      useCurrentLocation,
      locationLatLon,
      isRegionSelected,
      setRegion,
      setCurrentLocation,
      clearLocation,
    }
  },
  { persist: true },
)
