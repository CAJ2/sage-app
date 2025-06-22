import { defineStore } from 'pinia'

export const useChangeStore = defineStore(
  'change',
  () => {
    const selectedChange = ref('')
    const isChangeSelected = computed(() => !!selectedChange.value)
    function setChange(change: string) {
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
