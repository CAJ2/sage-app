import { invoke, addPluginListener, checkPermissions as checkPermissions$1, requestPermissions as requestPermissions$1 } from '@tauri-apps/api/core';

// Copyright 2019-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT
// ─── Camera lifecycle ────────────────────────────────────────────────────────
/**
 * Open the camera preview.
 * Must be called before startScan.
 */
async function openCamera(options) {
    await invoke('plugin:sageleaf-scanleaf|open_camera', { ...options });
}
/**
 * Close the camera preview and release all camera resources.
 */
async function closeCamera() {
    await invoke('plugin:sageleaf-scanleaf|close_camera');
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
async function startScan(options) {
    await invoke('plugin:sageleaf-scanleaf|start_scan', { ...options });
}
/**
 * Stop detection. Camera preview remains open.
 */
async function stopScan() {
    await invoke('plugin:sageleaf-scanleaf|stop_scan');
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
async function onDetection(handler) {
    const listener = await addPluginListener('sageleaf-scanleaf', 'detection', handler);
    return () => listener.unregister();
}
// ─── Permissions ─────────────────────────────────────────────────────────────
/**
 * Get the current camera permission state.
 */
async function checkPermissions() {
    return checkPermissions$1('sageleaf-scanleaf');
}
/**
 * Request camera permission. Shows system prompt if not yet decided.
 */
async function requestPermissions() {
    return requestPermissions$1('sageleaf-scanleaf');
}
/**
 * Open the app's system settings page.
 * Useful when permission was denied and the user must re-enable it manually.
 */
async function openAppSettings() {
    await invoke('plugin:sageleaf-scanleaf|open_app_settings');
}

export { checkPermissions, closeCamera, onDetection, openAppSettings, openCamera, requestPermissions, startScan, stopScan };
//# sourceMappingURL=index.js.map
