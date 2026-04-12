export interface ScanDebugEntry {
  id: string
  timestamp: number
  query: string
  queryType: string | null
  variables: unknown
  result?: unknown
  error?: unknown
}

export function useScanDebug() {
  const history = useState<ScanDebugEntry[]>('scanHistory', () => [])

  function addEntry(entry: Omit<ScanDebugEntry, 'id' | 'timestamp'>) {
    const newEntry: ScanDebugEntry = {
      id: Math.random().toString(36).slice(2, 9),
      timestamp: Date.now(),
      ...entry,
    }
    history.value.unshift(newEntry)
    // Keep only last 100 entries
    if (history.value.length > 100) {
      history.value.length = 100
    }
    return newEntry
  }

  function updateEntry(id: string, updates: Partial<ScanDebugEntry>) {
    const index = history.value.findIndex((e) => e.id === id)
    if (index !== -1) {
      history.value[index] = { ...history.value[index]!, ...updates }
    }
  }

  function clearHistory() {
    history.value = []
  }

  return {
    history: readonly(history),
    addEntry,
    updateEntry,
    clearHistory,
  }
}
