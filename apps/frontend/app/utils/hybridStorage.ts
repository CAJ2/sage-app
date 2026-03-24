import { isTauri } from '@tauri-apps/api/core'
import Database from '@tauri-apps/plugin-sql'
import Dexie, { type Table } from 'dexie'

// ─── Types ───────────────────────────────────────────────────────────────────

interface KvRow {
  key: string
  value: string
}

export type HistoryEntry = {
  id: string
  __typename: string
  accessedAt: string
}

// ─── State ───────────────────────────────────────────────────────────────────

let _sqlDb: Database | null = null
let _dexieKv: Table<KvRow, string> | null = null
let _dexieHistory: Table<HistoryEntry, string> | null = null
let _initPromise: Promise<void> | null = null

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

// ─── Init ─────────────────────────────────────────────────────────────────────

function init(): Promise<void> {
  if (_initPromise) return _initPromise
  _initPromise = (async () => {
    if (isTauri()) {
      _sqlDb = await Database.load('sqlite:app.db')
    } else {
      const dexie = new Dexie('app')
      dexie.version(1).stores({ app_settings: '++key' })
      dexie.version(2).stores({ app_settings: '++key', history: 'id, accessedAt' })
      await dexie.open()
      _dexieKv = dexie.table<KvRow, string>('app_settings')
      _dexieHistory = dexie.table<HistoryEntry, string>('history')
    }
  })()
  return _initPromise
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export const hybridStorage = {
  async getAppSetting(key: string): Promise<string | null> {
    await init()
    if (_sqlDb) {
      const rows = await _sqlDb.select<KvRow[]>('SELECT value FROM app_settings WHERE key = $1', [
        key,
      ])
      return rows[0]?.value ?? null
    }
    return (await _dexieKv!.get(key))?.value ?? null
  },

  async setAppSetting(key: string, value: string): Promise<void> {
    await init()
    if (_sqlDb) {
      await _sqlDb.execute(
        'INSERT INTO app_settings (key, value) VALUES ($1, $2) ON CONFLICT(key) DO UPDATE SET value = $2',
        [key, value],
      )
    } else {
      await _dexieKv!.put({ key, value })
    }
  },

  async getHistory(): Promise<HistoryEntry[]> {
    await init()
    if (_sqlDb) {
      return (
        await _sqlDb.select<{ id: string; typename: string; accessed_at: string }[]>(
          'SELECT * FROM history ORDER BY accessed_at DESC',
        )
      ).map((r) => ({ id: r.id, __typename: r.typename, accessedAt: r.accessed_at }))
    }
    return _dexieHistory!.orderBy('accessedAt').reverse().toArray()
  },

  async setHistory(item: Omit<HistoryEntry, 'accessedAt'>): Promise<void> {
    await init()
    const accessedAt = new Date().toISOString()
    const cutoff = new Date(Date.now() - SEVEN_DAYS_MS).toISOString()
    if (_sqlDb) {
      await _sqlDb.execute(
        `INSERT INTO history (id, typename, accessed_at) VALUES ($1, $2, $3)
         ON CONFLICT(id) DO UPDATE SET typename = $2, accessed_at = $3`,
        [item.id, item.__typename, accessedAt],
      )
      await _sqlDb.execute('DELETE FROM history WHERE accessed_at < $1', [cutoff])
    } else {
      await _dexieHistory!.put({ ...item, accessedAt })
      await _dexieHistory!.where('accessedAt').below(cutoff).delete()
    }
  },

  async clearHistory(): Promise<void> {
    await init()
    if (_sqlDb) {
      await _sqlDb.execute('DELETE FROM history')
    } else {
      await _dexieHistory!.clear()
    }
  },
}
