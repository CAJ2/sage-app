import type { ScanFrame, TextBlock } from '@sageleaf/scanleaf'

export interface TextReduceOptions {
  /** Normalized (0–1) center-to-center distance threshold for clustering. Default: 0.15 */
  clusterRadius: number
  /** Max characters in the returned query string. Default: 400 */
  maxLength: number
  /** Max number of spatial clusters to include. Default: 8 */
  maxClusters: number
  /** Whether to prepend image labels to the query. Default: true */
  includeLabels: boolean
  /** Max number of distinct labels to include. Default: 1 */
  maxLabels: number
}

const DEFAULTS: TextReduceOptions = {
  clusterRadius: 0.15,
  maxLength: 400,
  maxClusters: 8,
  includeLabels: true,
  maxLabels: 1,
}

interface NormalizedBlock {
  text: string
  cx: number
  cy: number
}

function normalizeBlock(
  block: TextBlock,
  imageWidth: number,
  imageHeight: number,
): NormalizedBlock | null {
  const { bounds } = block
  if (!bounds || !imageWidth || !imageHeight) {
    return { text: block.text.trim(), cx: 0.5, cy: 0.5 }
  }
  const cx = (bounds.x + bounds.width / 2) / imageWidth
  const cy = (bounds.y + bounds.height / 2) / imageHeight
  return { text: block.text.trim(), cx, cy }
}

function distance(a: NormalizedBlock, b: NormalizedBlock): number {
  const dx = a.cx - b.cx
  const dy = a.cy - b.cy
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Groups blocks into spatial clusters. Returns one representative text per cluster
 * (the block with the most characters).
 */
function clusterBlocks(blocks: NormalizedBlock[], radius: number): string[] {
  const assigned = Array.from({ length: blocks.length }, () => false)
  const representatives: string[] = []

  for (let i = 0; i < blocks.length; i++) {
    if (assigned[i]) continue
    assigned[i] = true

    const cluster: NormalizedBlock[] = [blocks[i]!]

    for (let j = i + 1; j < blocks.length; j++) {
      if (assigned[j]) continue
      if (distance(blocks[i]!, blocks[j]!) <= radius) {
        assigned[j] = true
        cluster.push(blocks[j]!)
      }
    }

    // Pick the block with the most text as cluster representative
    const best = cluster.reduce((a, b) => (b.text.length > a.text.length ? b : a))
    if (best.text) representatives.push(best.text)
  }

  return representatives
}

/**
 * Reduces ScanFrames into a compact text string suitable for a semantic search query.
 *
 * Algorithm:
 * 1. Collect all TextBlocks from all frames, normalizing positions using imageWidth/imageHeight
 * 2. Deduplicate blocks by trimmed text equality
 * 3. Cluster spatially close blocks, selecting the most-text block per cluster
 * 4. Join all representative text clusters
 * 5. If OCR length > 4, return result. Optionally prepend the highest confidence label.
 * 6. Never trigger just from image labels.
 */
export function reduceScanFrames(
  frames: ScanFrame[],
  options?: Partial<TextReduceOptions>,
): string {
  const opts = { ...DEFAULTS, ...options }

  // Collect and normalize all text blocks, deduplicating by text content
  const seen = new Set<string>()
  const allBlocks: NormalizedBlock[] = []

  for (const frame of frames) {
    if (!frame.text?.blocks) continue
    const w = frame.imageWidth ?? 0
    const h = frame.imageHeight ?? 0

    for (const block of frame.text.blocks) {
      const trimmed = block.text.trim()
      if (!trimmed || seen.has(trimmed)) continue
      seen.add(trimmed)

      const normalized = normalizeBlock(block, w, h)
      if (normalized) allBlocks.push(normalized)
    }
  }

  // Cluster spatially and pick representatives
  const representatives = clusterBlocks(allBlocks, opts.clusterRadius).slice(0, opts.maxClusters)

  // Join all clusters to form the potential OCR query string
  const ocrText = representatives.join(' ').replaceAll(/\s+/g, ' ').trim()

  // Always search if OCR text > 4 characters long.
  // Never trigger search just from image labels.
  if (ocrText.length <= 4) return ''

  // Collect labels deduplicated across frames, sorted by confidence
  const labelMap = new Map<string, number>()
  for (const frame of frames) {
    for (const label of frame.labels) {
      const key = label.text.toLowerCase().trim()
      if (!key) continue
      const existing = labelMap.get(key) ?? 0
      if (label.confidence > existing) labelMap.set(key, label.confidence)
    }
  }

  const parts: string[] = []

  // If searching with OCR > 4, include the top single-word label if available
  if (opts.includeLabels && labelMap.size > 0) {
    const bestLabel = [...labelMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .find(([text]) => !text.includes(' '))?.[0]

    if (bestLabel) parts.push(bestLabel)
  }

  parts.push(ocrText)

  const result = parts.join(' ').replaceAll(/\s+/g, ' ').trim()
  return result.length > opts.maxLength ? result.slice(0, opts.maxLength) : result
}
