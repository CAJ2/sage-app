// Copyright 2019-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

import AVFoundation
import Tauri
import UIKit
import Vision
import WebKit

// MARK: - Decodable arg types

struct CameraOptions: Decodable {
  var windowed: Bool?
  var facing: String?
}

struct ScanOptions: Decodable {
  var barcodeFormats: [String]?
  var confidenceThreshold: Float?
}

// MARK: - Barcode format mapping (Vision)

enum SupportedFormat: String, CaseIterable {
  case UPC_A, UPC_E, EAN_8, EAN_13
  case CODE_39, CODE_93, CODE_128
  case CODABAR, ITF, AZTEC, DATA_MATRIX, PDF_417, QR_CODE

  var visionSymbology: VNBarcodeSymbology {
    switch self {
    case .QR_CODE:     return .qr
    case .EAN_13:      return .ean13
    case .EAN_8:       return .ean8
    case .UPC_A:       return .ean13  // UPC-A decoded as EAN-13 with leading zero in Vision
    case .UPC_E:       return .upce
    case .CODE_39:     return .code39
    case .CODE_93:     return .code93
    case .CODE_128:    return .code128
    case .ITF:         return .itf14
    case .AZTEC:       return .aztec
    case .DATA_MATRIX: return .dataMatrix
    case .PDF_417:     return .pdf417
    case .CODABAR:
      if #available(iOS 15.0, *) { return .codabar }
      return .code128  // unreachable on iOS 15+ deployment target
    }
  }
}

func formatString(from symbology: VNBarcodeSymbology) -> String {
  if #available(iOS 15.0, *), symbology == .codabar { return "CODABAR" }
  switch symbology {
  case .qr:         return "QR_CODE"
  case .ean13:      return "EAN_13"
  case .ean8:       return "EAN_8"
  case .upce:       return "UPC_E"
  case .code39:     return "CODE_39"
  case .code93:     return "CODE_93"
  case .code128:    return "CODE_128"
  case .itf14:      return "ITF"
  case .aztec:      return "AZTEC"
  case .dataMatrix: return "DATA_MATRIX"
  case .pdf417:     return "PDF_417"
  default:          return "UNKNOWN"
  }
}

// MARK: - Orientation

/// Map device orientation + camera position to CGImagePropertyOrientation for Vision.
/// Mirrors the MLKit imageOrientation() mapping.
func visionOrientation(
  deviceOrientation: UIDeviceOrientation,
  cameraPosition: AVCaptureDevice.Position
) -> CGImagePropertyOrientation {
  switch deviceOrientation {
  case .portrait:           return cameraPosition == .front ? .leftMirrored : .right
  case .landscapeLeft:      return cameraPosition == .front ? .downMirrored : .up
  case .portraitUpsideDown: return cameraPosition == .front ? .rightMirrored : .left
  case .landscapeRight:     return cameraPosition == .front ? .upMirrored : .down
  default:                  return .right
  }
}

// MARK: - Coordinate conversion

/// Vision bounding boxes use normalized coords with bottom-left origin.
/// Convert to pixel-space with top-left origin to match MLKit output.
func pixelBounds(from normalized: CGRect, imageWidth: Int, imageHeight: Int) -> [String: Any] {
  let x = normalized.minX * CGFloat(imageWidth)
  let y = (1.0 - normalized.maxY) * CGFloat(imageHeight)
  let w = normalized.width * CGFloat(imageWidth)
  let h = normalized.height * CGFloat(imageHeight)
  return ["x": Double(x), "y": Double(y), "width": Double(w), "height": Double(h)]
}

// MARK: - Barcode value type + structured field parsing

func detectValueType(_ raw: String) -> String {
  let lower = raw.lowercased()
  if lower.hasPrefix("http://") || lower.hasPrefix("https://") { return "url" }
  if lower.hasPrefix("wifi:")                                   { return "wifi" }
  if lower.hasPrefix("mailto:")                                 { return "email" }
  if lower.hasPrefix("tel:")                                    { return "phone" }
  if lower.hasPrefix("smsto:") || lower.hasPrefix("sms:")       { return "sms" }
  if lower.hasPrefix("geo:")                                    { return "geo" }
  if lower.hasPrefix("begin:vcard")                             { return "contact" }
  return "text"
}

func serializeBarcode(_ obs: VNBarcodeObservation, imageWidth: Int, imageHeight: Int) -> [String: Any]? {
  guard let rawValue = obs.payloadStringValue else { return nil }
  let fmt = formatString(from: obs.symbology)
  guard fmt != "UNKNOWN" else { return nil }

  let valueType = detectValueType(rawValue)
  var result: [String: Any] = [
    "format": fmt,
    "rawValue": rawValue,
    "displayValue": rawValue,
    "valueType": valueType,
    "bounds": pixelBounds(from: obs.boundingBox, imageWidth: imageWidth, imageHeight: imageHeight),
  ]

  switch valueType {
  case "url":
    result["url"] = ["title": "", "url": rawValue]

  case "wifi":
    // Format: WIFI:S:<ssid>;T:<auth>;P:<password>;H:<hidden>;;
    var ssid = "", password = "", enc = "open"
    for part in rawValue.dropFirst(5).components(separatedBy: ";") {
      if part.hasPrefix("S:")      { ssid = String(part.dropFirst(2)) }
      else if part.hasPrefix("P:") { password = String(part.dropFirst(2)) }
      else if part.hasPrefix("T:") {
        let t = part.dropFirst(2).lowercased()
        enc = (t == "wpa" || t == "wpa2") ? "wpa" : t == "wep" ? "wep" : "open"
      }
    }
    result["wifi"] = ["ssid": ssid, "password": password, "encryptionType": enc]

  case "email":
    let addr = rawValue.hasPrefix("mailto:") ? String(rawValue.dropFirst(7)) : rawValue
    result["email"] = [
      "address": addr.components(separatedBy: "?").first ?? addr,
      "subject": "", "body": "",
    ]

  case "phone":
    result["phone"] = ["number": rawValue.hasPrefix("tel:") ? String(rawValue.dropFirst(4)) : rawValue]

  case "sms":
    let body = rawValue.hasPrefix("smsto:") ? String(rawValue.dropFirst(6))
             : rawValue.hasPrefix("sms:")   ? String(rawValue.dropFirst(4)) : rawValue
    let parts = body.components(separatedBy: ":")
    result["sms"] = ["phoneNumber": parts.first ?? "", "message": parts.dropFirst().joined(separator: ":")]

  case "geo":
    let coords = rawValue.dropFirst(4).components(separatedBy: ",")
    if coords.count >= 2 {
      result["geo"] = [
        "latitude": Double(coords[0]) ?? 0,
        "longitude": Double((coords[1].components(separatedBy: "?").first) ?? "") ?? 0,
      ]
    }

  default:
    break
  }

  return result
}

// MARK: - Text serialization
//
// Vision gives one VNRecognizedTextObservation per text region.
// We map each observation → one block → one line → one element,
// matching MLKit's Block/Line/Element hierarchy shape.

func serializeText(
  _ observations: [VNRecognizedTextObservation],
  imageWidth: Int,
  imageHeight: Int
) -> [String: Any]? {
  let pairs: [(obs: VNRecognizedTextObservation, text: String)] = observations.compactMap {
    guard let top = $0.topCandidates(1).first, !top.string.isEmpty else { return nil }
    return ($0, top.string)
  }
  guard !pairs.isEmpty else { return nil }

  let fullText = pairs.map { $0.text }.joined(separator: "\n")
  let blocks: [[String: Any]] = pairs.map { pair in
    let bounds = pixelBounds(from: pair.obs.boundingBox, imageWidth: imageWidth, imageHeight: imageHeight)
    let element: [String: Any] = ["text": pair.text, "bounds": bounds]
    let line: [String: Any] = ["text": pair.text, "bounds": bounds, "elements": [element]]
    return ["text": pair.text, "bounds": bounds, "languages": [String](), "lines": [line]]
  }
  return ["fullText": fullText, "blocks": blocks]
}

// MARK: - Error types

enum CaptureError: Error {
  case backCameraUnavailable
  case frontCameraUnavailable
  case couldNotCaptureInput(error: NSError)
}

// MARK: - Plugin

class SageleafScanleafPlugin: Plugin, AVCaptureVideoDataOutputSampleBufferDelegate {

  var webView: WKWebView!
  var cameraView: CameraView!

  // Session
  var captureSession: AVCaptureSession?
  var captureVideoPreviewLayer: AVCaptureVideoPreviewLayer?
  var videoOutput: AVCaptureVideoDataOutput?

  // State
  var isOpen = false
  var isScanning = false
  var cameraPosition: AVCaptureDevice.Position = .back

  // Vision requests — recreated in startScan when options change
  var barcodeRequest: VNDetectBarcodesRequest?
  var textRequest: VNRecognizeTextRequest?
  var classifyRequest: VNClassifyImageRequest?
  var confidenceThreshold: Float = 0.7

  // Camera config
  var windowed = true
  var facing = "back"
  var frontCamera: AVCaptureDevice?
  var backCamera: AVCaptureDevice?
  var previousBackgroundColor: UIColor? = UIColor.white

  // Frame throttle (~10 fps)
  var lastProcessedTime: TimeInterval = 0
  let throttleInterval: TimeInterval = 0.1

  // Background queues
  let sessionQueue = DispatchQueue(label: "app.sageleaf.scanleaf.session", qos: .userInitiated)
  let visionQueue = DispatchQueue(label: "app.sageleaf.scanleaf.vision")

  public override func load(webview: WKWebView) {
    self.webView = webview
  }

  // MARK: - Camera lifecycle

  @objc func openCamera(_ invoke: Invoke) throws {
    let args = try invoke.parseArgs(CameraOptions.self)
    self.windowed = args.windowed ?? true
    self.facing = args.facing ?? "back"

    guard checkCameraUsageDescription(invoke) else { return }
    guard !discoverCaptureDevices().isEmpty else {
      invoke.reject("No camera available on this device")
      return
    }

    DispatchQueue.main.async { [self] in
      do {
        try self.setupCamera()
        self.isOpen = true
        invoke.resolve()
      } catch CaptureError.backCameraUnavailable {
        invoke.reject("Back camera unavailable")
      } catch CaptureError.frontCameraUnavailable {
        invoke.reject("Front camera unavailable")
      } catch let CaptureError.couldNotCaptureInput(error) {
        invoke.reject("Could not capture input: \(error.localizedDescription)")
      } catch {
        invoke.reject(error.localizedDescription)
      }
    }
  }

  @objc func closeCamera(_ invoke: Invoke) {
    DispatchQueue.main.async { [self] in
      self.dismantleCamera()
      invoke.resolve()
    }
  }

  // MARK: - Scan lifecycle

  @objc func startScan(_ invoke: Invoke) throws {
    let args = try invoke.parseArgs(ScanOptions.self)

    guard isOpen else {
      invoke.reject("Camera is not open. Call openCamera first.")
      return
    }

    confidenceThreshold = args.confidenceThreshold ?? 0.7

    let req = VNDetectBarcodesRequest()
    let formats = args.barcodeFormats ?? []
    if !formats.isEmpty {
      req.symbologies = formats.compactMap { SupportedFormat(rawValue: $0)?.visionSymbology }
    }
    barcodeRequest = req

    let textReq = VNRecognizeTextRequest()
    textReq.recognitionLevel = .fast
    textReq.usesLanguageCorrection = false
    textRequest = textReq

    classifyRequest = VNClassifyImageRequest()

    isScanning = true
    invoke.resolve()
  }

  @objc func stopScan(_ invoke: Invoke) {
    isScanning = false
    barcodeRequest = nil
    textRequest = nil
    classifyRequest = nil
    invoke.resolve()
  }

  // MARK: - Private: camera setup / teardown

  private func setupCamera() throws {
    let devices = discoverCaptureDevices()
    for device in devices {
      if device.position == .back { backCamera = device }
      else if device.position == .front { frontCamera = device }
    }

    var direction = self.facing
    if direction == "back" && backCamera == nil { direction = "front" }
    if direction == "front" && frontCamera == nil { direction = "back" }
    cameraPosition = direction == "back" ? .back : .front

    let input = try createCaptureDeviceInput(
      cameraDirection: direction, backCamera: backCamera, frontCamera: frontCamera)

    captureSession = AVCaptureSession()
    captureSession!.addInput(input)

    videoOutput = AVCaptureVideoDataOutput()
    videoOutput!.videoSettings = [
      kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA
    ]
    videoOutput!.alwaysDiscardsLateVideoFrames = true
    captureSession!.addOutput(videoOutput!)
    videoOutput!.setSampleBufferDelegate(self, queue: visionQueue)

    cameraView = CameraView(frame: CGRect(
      x: 0, y: 0,
      width: UIScreen.main.bounds.width,
      height: UIScreen.main.bounds.height))
    cameraView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    cameraView.backgroundColor = .clear

    captureVideoPreviewLayer = AVCaptureVideoPreviewLayer(session: captureSession!)
    cameraView.addPreviewLayer(captureVideoPreviewLayer)

    if windowed {
      webView.superview?.insertSubview(cameraView, belowSubview: webView)
      previousBackgroundColor = webView.backgroundColor
      webView.isOpaque = false
      webView.backgroundColor = .clear
      webView.scrollView.backgroundColor = .clear
    } else {
      webView.superview?.insertSubview(cameraView, aboveSubview: webView)
    }

    sessionQueue.async { self.captureSession?.startRunning() }
  }

  private func dismantleCamera() {
    isScanning = false
    isOpen = false
    barcodeRequest = nil
    textRequest = nil
    classifyRequest = nil
    sessionQueue.async { self.captureSession?.stopRunning() }
    cameraView?.removePreviewLayer()
    cameraView?.removeFromSuperview()
    captureVideoPreviewLayer = nil
    videoOutput = nil
    captureSession = nil
    frontCamera = nil
    backCamera = nil
    cameraView = nil

    if windowed {
      let bg = previousBackgroundColor ?? .white
      webView.isOpaque = true
      webView.backgroundColor = bg
      webView.scrollView.backgroundColor = bg
    }
  }

  // MARK: - AVCaptureVideoDataOutputSampleBufferDelegate

  func captureOutput(
    _ output: AVCaptureOutput,
    didOutput sampleBuffer: CMSampleBuffer,
    from connection: AVCaptureConnection
  ) {
    guard isScanning else { return }

    let now = Date().timeIntervalSince1970
    guard (now - lastProcessedTime) >= throttleInterval else { return }
    lastProcessedTime = now

    processFrame(sampleBuffer, timestamp: now)
  }

  // MARK: - Frame processing (Vision)
  //
  // All three Vision requests run in a single VNImageRequestHandler per frame on visionQueue.
  // alwaysDiscardsLateVideoFrames = true means frames arriving during processing are dropped —
  // no external locking needed. Mirrors the MLKit parallel-detector pattern.

  private func processFrame(_ sampleBuffer: CMSampleBuffer, timestamp: TimeInterval) {
    guard let barcodeReq = barcodeRequest,
      let textReq = textRequest,
      let classifyReq = classifyRequest
    else { return }

    guard let pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else { return }
    let imageWidth = CVPixelBufferGetWidth(pixelBuffer)
    let imageHeight = CVPixelBufferGetHeight(pixelBuffer)

    let orientation = visionOrientation(
      deviceOrientation: UIDevice.current.orientation,
      cameraPosition: cameraPosition)

    let handler = VNImageRequestHandler(cvPixelBuffer: pixelBuffer, orientation: orientation)
    do {
      try handler.perform([barcodeReq, textReq, classifyReq])
    } catch {
      return
    }

    let barcodes = (barcodeReq.results ?? [])
      .compactMap { serializeBarcode($0, imageWidth: imageWidth, imageHeight: imageHeight) }

    let serializedText = serializeText(
      textReq.results ?? [], imageWidth: imageWidth, imageHeight: imageHeight)

    let threshold = self.confidenceThreshold
    let labels: [[String: Any]] = (classifyReq.results ?? [])
      .filter { $0.confidence >= threshold }
      .prefix(10)
      .enumerated()
      .map { i, obs in ["text": obs.identifier, "confidence": Double(obs.confidence), "index": i] }

    guard !barcodes.isEmpty || serializedText != nil || !labels.isEmpty else { return }

    var frame: [String: Any] = [
      "barcodes": barcodes,
      "labels": labels,
      "timestamp": timestamp * 1000,
      "imageWidth": imageWidth,
      "imageHeight": imageHeight,
    ]
    if let text = serializedText { frame["text"] = text }

    guard let data = try? JSONSerialization.data(withJSONObject: frame),
      let str = String(data: data, encoding: .utf8)
    else { return }
    try? self.trigger("detection", data: str)
  }

  // MARK: - Permissions

  private func getPermissionState() -> String {
    switch AVCaptureDevice.authorizationStatus(for: .video) {
    case .authorized: return "granted"
    case .denied:     return "denied"
    default:          return "prompt"
    }
  }

  private func checkCameraUsageDescription(_ invoke: Invoke) -> Bool {
    let entry = Bundle.main.infoDictionary?["NSCameraUsageDescription"] as? String
    if entry == nil || entry?.isEmpty == true {
      invoke.reject("NSCameraUsageDescription is not set in Info.plist")
      return false
    }
    return true
  }

  @objc override func checkPermissions(_ invoke: Invoke) {
    invoke.resolve(["camera": getPermissionState()])
  }

  @objc override func requestPermissions(_ invoke: Invoke) {
    let state = getPermissionState()
    if state == "prompt" {
      AVCaptureDevice.requestAccess(for: .video) { authorized in
        invoke.resolve(["camera": authorized ? "granted" : "denied"])
      }
    } else {
      invoke.resolve(["camera": state])
    }
  }

  @objc func openAppSettings(_ invoke: Invoke) {
    guard let url = URL(string: UIApplication.openSettingsURLString) else { return }
    DispatchQueue.main.async {
      if UIApplication.shared.canOpenURL(url) {
        UIApplication.shared.open(url) { _ in invoke.resolve() }
      }
    }
  }
}

// MARK: - AVFoundation helpers

func discoverCaptureDevices() -> [AVCaptureDevice] {
  return AVCaptureDevice.DiscoverySession(
    deviceTypes: [
      .builtInTripleCamera, .builtInDualCamera, .builtInTelephotoCamera,
      .builtInTrueDepthCamera, .builtInUltraWideCamera, .builtInDualWideCamera,
      .builtInWideAngleCamera,
    ], mediaType: .video, position: .unspecified
  ).devices
}

func createCaptureDeviceInput(
  cameraDirection: String, backCamera: AVCaptureDevice?, frontCamera: AVCaptureDevice?
) throws -> AVCaptureDeviceInput {
  let device: AVCaptureDevice
  if cameraDirection == "back" {
    guard let cam = backCamera else { throw CaptureError.backCameraUnavailable }
    device = cam
  } else {
    guard let cam = frontCamera else { throw CaptureError.frontCameraUnavailable }
    device = cam
  }
  do {
    return try AVCaptureDeviceInput(device: device)
  } catch let error as NSError {
    throw CaptureError.couldNotCaptureInput(error: error)
  }
}

// MARK: - Entry point

@_cdecl("init_plugin_sageleaf_scanleaf")
func initPlugin() -> Plugin {
  return SageleafScanleafPlugin()
}
