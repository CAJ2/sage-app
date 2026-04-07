import type { ScanFrame } from '@sageleaf/scanleaf'

export interface ScanFrameBufferOptions {
  /** Keep frames within this recency window in ms. Default: 5000 */
  windowMs: number
  /** Hard cap on the number of stored frames. Default: 60 */
  maxFrames: number
}

const DEFAULTS: ScanFrameBufferOptions = {
  windowMs: 5000,
  maxFrames: 60,
}

export function useScanFrameBuffer(options?: Partial<ScanFrameBufferOptions>) {
  const opts = { ...DEFAULTS, ...options }
  const frames = ref<ScanFrame[]>([])

  function evict() {
    const cutoff = Date.now() - opts.windowMs
    frames.value = frames.value.filter((f) => f.timestamp >= cutoff)
    if (frames.value.length > opts.maxFrames) {
      frames.value = frames.value.slice(-opts.maxFrames)
    }
  }

  function push(frame: ScanFrame) {
    frames.value = [...frames.value, frame]
    evict()
  }

  function clear() {
    frames.value = []
  }

  return {
    push,
    frames: readonly(frames),
    clear,
  }
}
