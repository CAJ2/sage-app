import { defineStore } from 'pinia'

export const useDebugStore = defineStore('debug', {
  state: () => ({
    isDebugMode: false,
  }),
  persist: true,
})
