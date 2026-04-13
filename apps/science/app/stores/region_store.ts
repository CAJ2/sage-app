import { defineStore } from 'pinia'

export const useRegionStore = defineStore(
  'region',
  () => {
    const selectedRegionId = ref<string | undefined>(undefined)

    function setRegion(id: string | undefined) {
      selectedRegionId.value = id
    }

    return {
      selectedRegionId,
      setRegion,
    }
  },
  { persist: true },
)
