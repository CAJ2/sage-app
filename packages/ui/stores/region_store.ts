import { defineStore } from 'pinia'

export const useRegionStore = defineStore(
  'region',
  () => {
    const selectedRegion = ref('')
    const isRegionSelected = computed(() => !!selectedRegion.value)
    function setRegion(region: string) {
      selectedRegion.value = region
    }
    return {
      selectedRegion,
      isRegionSelected,
      setRegion,
    }
  },
  { persist: true },
)
