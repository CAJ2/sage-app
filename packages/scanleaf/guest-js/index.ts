// Copyright 2019-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

import {
  invoke,
  requestPermissions as requestPermissions_,
  checkPermissions as checkPermissions_,
} from '@tauri-apps/api/core'
import { listen, type UnlistenFn } from '@tauri-apps/api/event'

export type { PermissionState } from '@tauri-apps/api/core'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CameraOptions {
  /** Place camera behind the webview (transparent overlay). Default: true */
  windowed?: boolean
  /** Camera to use. Default: 'back' */
  facing?: 'back' | 'front'
}

export interface ScanOptions {
  /**
   * Barcode formats to detect. Omit to detect all supported formats.
   * The plugin always runs barcode, text, and label detection simultaneously —
   * this only narrows which barcode symbologies are considered.
   */
  barcodeFormats?: BarcodeFormat[]
  /** Minimum confidence threshold for image labels (0.0–1.0). Default: 0.7 */
  confidenceThreshold?: number
}

export type BarcodeFormat =
  | 'QR_CODE'
  | 'EAN_13'
  | 'EAN_8'
  | 'UPC_A'
  | 'UPC_E'
  | 'CODE_39'
  | 'CODE_93'
  | 'CODE_128'
  | 'CODABAR'
  | 'ITF'
  | 'AZTEC'
  | 'DATA_MATRIX'
  | 'PDF_417'

/**
 * Semantic type of a barcode's payload. Mirrors MLKit's BarcodeValueType.
 * 'text' is the catch-all when no specific structure is detected.
 */
export type BarcodeValueType =
  | 'text'
  | 'url'
  | 'email'
  | 'phone'
  | 'sms'
  | 'wifi'
  | 'geo'
  | 'contact'
  | 'calendar'
  | 'isbn'
  | 'product'
  | 'driver-license'
  | 'unknown'

export interface BarcodeUrl {
  url: string
  title?: string
}

export interface BarcodeWifi {
  ssid: string
  password?: string
  encryptionType?: 'open' | 'wpa' | 'wep' | 'unknown'
}

export interface BarcodeEmail {
  address: string
  subject?: string
  body?: string
}

export interface BarcodePhone {
  number: string
}

export interface BarcodeSms {
  phoneNumber: string
  message?: string
}

export interface BarcodeGeo {
  latitude: number
  longitude: number
}

/** Simplified contact extracted from a vCard / MECARD barcode (searchable fields only). */
export interface BarcodeContact {
  name?: string
  organization?: string
  phone?: string
  email?: string
}

/**
 * Bounding box in image pixel coordinates, top-left origin.
 * Use `imageWidth`/`imageHeight` from the parent `ScanFrame` to normalize to 0–1 if needed.
 */
export interface Bounds {
  x: number
  y: number
  width: number
  height: number
}

export interface BarcodeResult {
  format: BarcodeFormat
  /** Raw encoded payload of the barcode. */
  rawValue: string
  /** Human-friendly decoded value (may differ from rawValue for structured types). */
  displayValue?: string
  /** Semantic type of the payload — enables type-safe access to structured fields below. */
  valueType?: BarcodeValueType
  bounds?: Bounds
  // Structured payload — the field matching `valueType` will be populated:
  url?: BarcodeUrl
  wifi?: BarcodeWifi
  email?: BarcodeEmail
  phone?: BarcodePhone
  sms?: BarcodeSms
  geo?: BarcodeGeo
  contact?: BarcodeContact
}

/** A single word or symbol within a line of text. */
export interface TextElement {
  text: string
  bounds?: Bounds
}

export interface TextLine {
  text: string
  bounds?: Bounds
  /** Word-level elements. Available on Android; may be absent on iOS (Apple Vision). */
  elements?: TextElement[]
}

export interface TextBlock {
  text: string
  bounds?: Bounds
  /** Detected script / language codes, e.g. 'en', 'zh', 'ja'. */
  languages?: string[]
  lines: TextLine[]
}

export interface TextResult {
  /** All recognized text concatenated across blocks */
  fullText: string
  blocks: TextBlock[]
}

export interface ImageLabel {
  text: string
  confidence: number
  /** Platform-specific label index */
  index: number
}

/**
 * A unified snapshot of everything the plugin detected in one camera frame.
 * All three detectors (barcode, OCR, image labeling) run simultaneously —
 * the frame carries the combined output, enabling rich contextual search
 * (e.g. a product label with a barcode + printed text + object category).
 *
 * Only emitted when at least one detector found something.
 */
export interface ScanFrame {
  /** All barcodes detected in this frame (may be empty). */
  barcodes: BarcodeResult[]
  /** Text recognized in this frame. Absent when no text was detected. */
  text?: TextResult
  /** Image classification labels above the confidence threshold. */
  labels: ImageLabel[]
  /** Frame capture time as milliseconds since Unix epoch. */
  timestamp: number
  /**
   * Width of the analyzed camera frame in pixels.
   * Use this together with `imageHeight` to normalize `Bounds` values to 0–1.
   */
  imageWidth?: number
  /**
   * Height of the analyzed camera frame in pixels.
   * Use this together with `imageWidth` to normalize `Bounds` values to 0–1.
   */
  imageHeight?: number
}

export interface PermissionStatus {
  camera: import('@tauri-apps/api/core').PermissionState
}

// ─── Camera lifecycle ────────────────────────────────────────────────────────

/**
 * Open the camera preview.
 * Must be called before startScan.
 */
export async function openCamera(options?: CameraOptions): Promise<void> {
  await invoke('plugin:sageleaf-scanleaf|open_camera', { ...options })
}

/**
 * Close the camera preview and release all camera resources.
 */
export async function closeCamera(): Promise<void> {
  await invoke('plugin:sageleaf-scanleaf|close_camera')
}

// ─── Scan lifecycle ──────────────────────────────────────────────────────────

/**
 * Start continuous detection. Requires an open camera.
 *
 * The plugin simultaneously runs barcode scanning, OCR, and image labeling
 * on each frame — no mode selection needed. Results are delivered via
 * onDetection() as ScanFrame objects containing all findings per frame.
 * The plugin manages its own frame-sampling rate internally.
 */
export async function startScan(options?: ScanOptions): Promise<void> {
  await invoke('plugin:sageleaf-scanleaf|start_scan', { ...options })
}

/**
 * Stop detection. Camera preview remains open.
 */
export async function stopScan(): Promise<void> {
  await invoke('plugin:sageleaf-scanleaf|stop_scan')
}

// ─── Detection events ────────────────────────────────────────────────────────

/**
 * Subscribe to scan frames emitted during an active scan.
 * Each frame contains simultaneous barcode, text, and label findings.
 * Returns an unlisten function to remove the subscription.
 *
 * @example
 * const unlisten = await onDetection((frame) => {
 *   for (const barcode of frame.barcodes) {
 *     console.log(barcode.format, barcode.rawValue, barcode.valueType)
 *     if (barcode.url) console.log('URL:', barcode.url.url)
 *     if (barcode.wifi) console.log('WiFi:', barcode.wifi.ssid)
 *   }
 *   if (frame.text) console.log(frame.text.fullText)
 *   for (const label of frame.labels) console.log(label.text, label.confidence)
 * })
 * // later:
 * unlisten()
 */
export async function onDetection(handler: (frame: ScanFrame) => void): Promise<UnlistenFn> {
  return listen<ScanFrame>('plugin:sageleaf-scanleaf:detection', (event) => {
    handler(event.payload)
  })
}

// ─── Permissions ─────────────────────────────────────────────────────────────

/**
 * Get the current camera permission state.
 */
export async function checkPermissions(): Promise<PermissionStatus> {
  return checkPermissions_<PermissionStatus>('sageleaf-scanleaf')
}

/**
 * Request camera permission. Shows system prompt if not yet decided.
 */
export async function requestPermissions(): Promise<PermissionStatus> {
  return requestPermissions_<PermissionStatus>('sageleaf-scanleaf')
}

/**
 * Open the app's system settings page.
 * Useful when permission was denied and the user must re-enable it manually.
 */
export async function openAppSettings(): Promise<void> {
  await invoke('plugin:sageleaf-scanleaf|open_app_settings')
}
