import { defineStore } from 'pinia'

const STORAGE_KEY = 'region_store'

export const useRegionStore = defineStore('region', () => {
  const selectedRegion = ref('')
  const useCurrentLocation = ref(false)
  const locationLatLon = ref<string | null>(null)
  const loaded = ref(false)

  const isRegionSelected = computed(() => !!selectedRegion.value)

  async function load() {
    if (loaded.value || !import.meta.client) return
    const raw = await hybridStorage.getAppSetting(STORAGE_KEY)
    if (raw) {
      const state = JSON.parse(raw)
      selectedRegion.value = state.selectedRegion ?? ''
      useCurrentLocation.value = state.useCurrentLocation ?? false
      locationLatLon.value = state.locationLatLon ?? null
    }
    loaded.value = true
  }

  async function persist() {
    await hybridStorage.setAppSetting(
      STORAGE_KEY,
      JSON.stringify({
        selectedRegion: selectedRegion.value,
        useCurrentLocation: useCurrentLocation.value,
        locationLatLon: locationLatLon.value,
      }),
    )
  }

  async function setRegion(id: string) {
    selectedRegion.value = id
    await persist()
  }

  async function setCurrentLocation(latLon: string) {
    useCurrentLocation.value = true
    locationLatLon.value = latLon
    selectedRegion.value = ''
    await persist()
  }

  async function clearLocation() {
    useCurrentLocation.value = false
    locationLatLon.value = null
    await persist()
  }

  return {
    selectedRegion,
    useCurrentLocation,
    locationLatLon,
    isRegionSelected,
    load,
    persist,
    setRegion,
    setCurrentLocation,
    clearLocation,
  }
})
