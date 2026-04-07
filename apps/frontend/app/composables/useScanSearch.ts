import type { ScanFrame } from '@sageleaf/scanleaf'

import { validateBarcode } from '~/utils/barcodeValidator'
import type { TextReduceOptions } from '~/utils/scanTextReducer'
import { reduceScanFrames } from '~/utils/scanTextReducer'

import type { ScanFrameBufferOptions } from './useScanFrameBuffer'

export type ScanQueryType = 'barcode' | 'text' | null

export interface ScanSearchOptions {
  /** Wait at least this long after the first frame before issuing a text query. Default: 700 */
  initialWaitMs: number
  /** Minimum ms between successive queries (both barcode and text). Default: 1000 */
  minIntervalMs: number
  /** Options forwarded to the text reducer. */
  reduce: Partial<TextReduceOptions>
  /** Options forwarded to the frame buffer. */
  buffer: Partial<ScanFrameBufferOptions>
}

const DEFAULTS: ScanSearchOptions = {
  initialWaitMs: 700,
  minIntervalMs: 1000,
  reduce: {},
  buffer: {},
}

/**
 * Accumulates ScanFrames and produces rate-limited search queries.
 *
 * - Barcode detections fire immediately on first detection, then throttle to
 *   at most one per `minIntervalMs`.
 * - Text/label queries wait `initialWaitMs` after the first frame, then
 *   throttle to at most one per `minIntervalMs`.
 * - A single shared timer ensures at most one pending query at a time.
 */
export function useScanSearch(options?: Partial<ScanSearchOptions>) {
  const opts = { ...DEFAULTS, ...options }

  const buffer = useScanFrameBuffer(opts.buffer)

  const query = ref<string>('')
  const queryType = ref<ScanQueryType>(null)

  let firstFrameAt: number | null = null
  let lastQueryAt = 0
  let pendingTimer: ReturnType<typeof setTimeout> | null = null

  // Shared throttle: fires a barcode query immediately if the throttle window has
  // passed, otherwise defers to the end of the window (always using the latest code).
  function scheduleBarcodeQuery(code: string) {
    if (pendingTimer !== null) {
      clearTimeout(pendingTimer)
      pendingTimer = null
    }

    const throttleRemaining = Math.max(0, opts.minIntervalMs - (Date.now() - lastQueryAt))

    if (throttleRemaining === 0) {
      lastQueryAt = Date.now()
      query.value = code
      queryType.value = 'barcode'
    } else {
      pendingTimer = setTimeout(() => {
        pendingTimer = null
        lastQueryAt = Date.now()
        query.value = code
        queryType.value = 'barcode'
      }, throttleRemaining)
    }
  }

  function scheduleTextQuery() {
    if (pendingTimer !== null) return

    const now = Date.now()
    const warmupRemaining =
      firstFrameAt === null
        ? opts.initialWaitMs
        : Math.max(0, opts.initialWaitMs - (now - firstFrameAt))
    const throttleRemaining = Math.max(0, opts.minIntervalMs - (now - lastQueryAt))
    const delay = Math.max(warmupRemaining, throttleRemaining)

    pendingTimer = setTimeout(() => {
      pendingTimer = null
      fireTextQuery()
    }, delay)
  }

  function fireTextQuery() {
    const text = reduceScanFrames(buffer.frames.value as ScanFrame[], opts.reduce)
    if (!text) return

    lastQueryAt = Date.now()
    query.value = text
    queryType.value = 'text'
  }

  function addFrame(frame: ScanFrame) {
    if (firstFrameAt === null) firstFrameAt = Date.now()
    buffer.push(frame)

    for (const barcode of frame.barcodes) {
      const { valid, modifiedCode } = validateBarcode(barcode.rawValue)
      if (valid) {
        scheduleBarcodeQuery(modifiedCode)
        return
      }
    }

    scheduleTextQuery()
  }

  function addBarcode(code: string) {
    const { valid, modifiedCode } = validateBarcode(code)
    if (!valid) return
    scheduleBarcodeQuery(modifiedCode)
  }

  function reset() {
    if (pendingTimer !== null) {
      clearTimeout(pendingTimer)
      pendingTimer = null
    }
    buffer.clear()
    firstFrameAt = null
    lastQueryAt = 0
    query.value = ''
    queryType.value = null
  }

  return {
    addFrame,
    addBarcode,
    query: readonly(query),
    queryType: readonly(queryType),
    reset,
  }
}
