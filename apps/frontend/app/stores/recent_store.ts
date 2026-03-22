import { defineStore } from 'pinia'

import type { HistoryEntry } from '~/utils/hybridStorage'

export type { HistoryEntry }

export const useRecentStore = defineStore('recent', () => {
  const items = ref<HistoryEntry[]>([])
  const loaded = ref(false)

  async function load() {
    if (loaded.value || !import.meta.client) return
    items.value = await hybridStorage.getHistory()
    loaded.value = true
  }

  async function add(item: Omit<HistoryEntry, 'accessedAt'>) {
    await hybridStorage.setHistory(item)
    items.value = await hybridStorage.getHistory()
    loaded.value = true
  }

  async function clear() {
    await hybridStorage.clearHistory()
    items.value = []
  }

  return { items, loaded, load, add, clear }
})
