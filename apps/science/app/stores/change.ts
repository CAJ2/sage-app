import { defineStore } from 'pinia'

export const useChangeStore = defineStore(
  'change',
  () => {
    const selectedChange = ref<string | undefined>(undefined)
    const isChangeSelected = computed(() => !!selectedChange.value)
    function setChange(change: string | undefined) {
      selectedChange.value = change
    }
    return {
      selectedChange,
      isChangeSelected,
      setChange,
    }
  },
  { persist: true },
)
