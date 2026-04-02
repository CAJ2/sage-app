// Copyright 2019-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

import AVFoundation
import Tauri
import UIKit
import WebKit
#if canImport(MLKitBarcodeScanning)
  import MLKitBarcodeScanning
  import MLKitImageLabeling
  import MLKitTextRecognition
  import MLKitVision
#endif

// MARK: - Decodable arg types

struct CameraOptions: Decodable {
  var windowed: Bool?
  var facing: String?
}

struct ScanOptions: Decodable {
  var barcodeFormats: [String]?
  var confidenceThreshold: Float?
}

// MARK: - Barcode format mapping (MLKit)

enum SupportedFormat: String, CaseIterable {
  case UPC_A, UPC_E, EAN_8, EAN_13
  case CODE_39, CODE_93, CODE_128
  case CODABAR, ITF, AZTEC, DATA_MATRIX, PDF_417, QR_CODE

  var mlkitFormat: BarcodeFormat {
    switch self {
    case .QR_CODE:     return .qrCode
    case .EAN_13:      return .EAN13
    case .EAN_8:       return .EAN8
    case .UPC_A:       return .UPCA
    case .UPC_E:       return .UPCE
    case .CODE_39:     return .code39
    case .CODE_93:     return .code93
    case .CODE_128:    return .code128
    case .ITF:         return .ITF
    case .AZTEC:       return .aztec
    case .DATA_MATRIX: return .dataMatrix
    case .PDF_417:     return .PDF417
    case .CODABAR:     return .codaBar
    }
  }
}

func formatString(from format: BarcodeFormat) -> String {
  switch format {
  case .qrCode:     return "QR_CODE"
  case .EAN13:      return "EAN_13"
  case .EAN8:       return "EAN_8"
  case .UPCA:       return "UPC_A"
  case .UPCE:       return "UPC_E"
  case .code39:     return "CODE_39"
  case .code93:     return "CODE_93"
  case .code128:    return "CODE_128"
  case .ITF:        return "ITF"
  case .aztec:      return "AZTEC"
  case .dataMatrix: return "DATA_MATRIX"
  case .PDF417:     return "PDF_417"
  case .codaBar:    return "CODABAR"
  default:          return "UNKNOWN"
  }
}

func valueTypeString(from type: BarcodeValueType) -> String {
  switch type {
  case .URL:                   return "url"
  case .wiFi:                  return "wifi"
  case .contactInfo:           return "contact"
  case .email:                 return "email"
  case .phone:                 return "phone"
  case .SMS:                   return "sms"
  case .geographicCoordinates: return "geo"
  case .ISBN:                  return "isbn"
  case .product:               return "product"
  case .driverLicense:         return "driver-license"
  case .calendarEvent:         return "calendar"
  case .text:                  return "text"
  case .unknown:               return "unknown"
  @unknown default:            return "unknown"
  }
}

/// Matches the MLKit iOS reference implementation from google-mlkit-swiftpm/Example.
func imageOrientation(
  deviceOrientation: UIDeviceOrientation,
  cameraPosition: AVCaptureDevice.Position
) -> UIImage.Orientation {
  switch deviceOrientation {
  case .portrait:           return cameraPosition == .front ? .leftMirrored : .right
  case .landscapeLeft:      return cameraPosition == .front ? .downMirrored : .up
  case .portraitUpsideDown: return cameraPosition == .front ? .rightMirrored : .left
  case .landscapeRight:     return cameraPosition == .front ? .upMirrored : .down
  case .faceDown, .faceUp, .unknown: return .up
  @unknown default: return .up
  }
}

// MARK: - Serialization helpers

/// Serialize an MLKit Barcode to a dictionary.
/// MLKit provides pixel-space CGRect bounds (top-left origin) — no coordinate conversion needed.
/// Structured fields (url, wifi, email, phone, sms, geo, contact) come from MLKit natively;
/// no manual payload parsing required.
func serializeBarcode(_ barcode: Barcode) -> [String: Any]? {
  guard let rawValue = barcode.rawValue else { return nil }
  let fmt = formatString(from: barcode.format)
  guard fmt != "UNKNOWN" else { return nil }

  let frame = barcode.frame
  var result: [String: Any] = [
    "format": fmt,
    "rawValue": rawValue,
    "displayValue": barcode.displayValue ?? rawValue,
    "valueType": valueTypeString(from: barcode.valueType),
    "bounds": [
      "x": Double(frame.minX),
      "y": Double(frame.minY),
      "width": Double(frame.width),
      "height": Double(frame.height),
    ],
  ]

  switch barcode.valueType {
  case .URL:
    if let url = barcode.url {
      result["url"] = ["title": url.title ?? "", "url": url.url ?? ""]
    }
  case .wiFi:
    if let wifi = barcode.wifi {
      let enc: String
      switch wifi.encryptionType {
      case .open: enc = "open"
      case .wpa:  enc = "wpa"
      case .wep:  enc = "wep"
      @unknown default: enc = "unknown"
      }
      result["wifi"] = [
        "ssid": wifi.ssid ?? "",
        "password": wifi.password ?? "",
        "encryptionType": enc,
      ]
    }
  case .email:
    if let email = barcode.email {
      result["email"] = [
        "address": email.address ?? "",
        "subject": email.subject ?? "",
        "body": email.body ?? "",
      ]
    }
  case .phone:
    if let phone = barcode.phone {
      result["phone"] = ["number": phone.number ?? ""]
    }
  case .SMS:
    if let sms = barcode.sms {
      result["sms"] = ["phoneNumber": sms.phoneNumber ?? "", "message": sms.message ?? ""]
    }
  case .geographicCoordinates:
    if let geo = barcode.geoPoint {
      result["geo"] = ["latitude": geo.latitude, "longitude": geo.longitude]
    }
  case .contactInfo:
    if let contact = barcode.contactInfo {
      var contactDict: [String: Any] = [:]
      if let name = contact.name {
        contactDict["name"] = [
          "first": name.first ?? "",
          "last": name.last ?? "",
          "middle": name.middle ?? "",
          "prefix": name.prefix ?? "",
          "suffix": name.suffix ?? "",
          "formattedName": name.formattedName ?? "",
        ]
      }
      contactDict["organization"] = contact.organization ?? ""
      contactDict["jobTitle"] = contact.jobTitle ?? ""
      contactDict["phones"] = contact.phones.map { ["number": $0.number ?? ""] }
      contactDict["emails"] = contact.emails.map { ["address": $0.address ?? ""] }
      contactDict["urls"] = contact.urls
      result["contact"] = contactDict
    }
  default:
    break
  }

  return result
}

func serializeTextBlock(_ block: TextBlock) -> [String: Any] {
  let frame = block.frame
  return [
    "text": block.text,
    "bounds": [
      "x": Double(frame.minX), "y": Double(frame.minY),
      "width": Double(frame.width), "height": Double(frame.height),
    ],
    "languages": block.recognizedLanguages.compactMap { $0.languageCode }.filter { !$0.isEmpty },
    "lines": block.lines.map { serializeTextLine($0) },
  ]
}

func serializeTextLine(_ line: TextLine) -> [String: Any] {
  let frame = line.frame
  return [
    "text": line.text,
    "bounds": [
      "x": Double(frame.minX), "y": Double(frame.minY),
      "width": Double(frame.width), "height": Double(frame.height),
    ],
    "elements": line.elements.map { serializeTextElement($0) },
  ]
}

func serializeTextElement(_ element: TextElement) -> [String: Any] {
  let frame = element.frame
  return [
    "text": element.text,
    "bounds": [
      "x": Double(frame.minX), "y": Double(frame.minY),
      "width": Double(frame.width), "height": Double(frame.height),
    ],
  ]
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

  // MLKit detector instances — recreated in startScan when options change
  var barcodeScanner: BarcodeScanner?
  var textRecognizer: TextRecognizer?
  var labeler: ImageLabeler?
  var confidenceThreshold: Float = 0.7

  // Camera config
  var windowed = true
  var facing = "back"
  var frontCamera: AVCaptureDevice?
  var backCamera: AVCaptureDevice?
  var previousBackgroundColor: UIColor? = UIColor.white

  // Frame throttle (~10 fps) — plugin controls sampling rate, not the caller
  var lastProcessedTime: TimeInterval = 0
  let throttleInterval: TimeInterval = 0.1

  // Background queues
  let sessionQueue = DispatchQueue(label: "app.sageleaf.scanleaf.session", qos: .userInitiated)
  let visionQueue = DispatchQueue(label: "app.sageleaf.scanleaf.mlkit")

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

    // Build BarcodeFormat option set from the requested format strings
    let formats = args.barcodeFormats ?? []
    let barcodeFormat: BarcodeFormat
    if formats.isEmpty {
      barcodeFormat = .all
    } else {
      barcodeFormat = formats
        .compactMap { SupportedFormat(rawValue: $0)?.mlkitFormat }
        .reduce(into: BarcodeFormat()) { $0.formUnion($1) }
    }

    barcodeScanner = BarcodeScanner.barcodeScanner(options: BarcodeScannerOptions(formats: barcodeFormat))
    textRecognizer = TextRecognizer.textRecognizer(options: TextRecognizerOptions())
    let labelerOptions = ImageLabelerOptions()
    labelerOptions.confidenceThreshold = confidenceThreshold
    labeler = ImageLabeler.imageLabeler(options: labelerOptions)

    isScanning = true
    invoke.resolve()
  }

  @objc func stopScan(_ invoke: Invoke) {
    isScanning = false
    barcodeScanner = nil
    textRecognizer = nil
    labeler = nil
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
    barcodeScanner = nil
    textRecognizer = nil
    labeler = nil
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

  // MARK: - Unified frame processing (MLKit)

  // All three MLKit detectors run synchronously per frame on visionQueue.
  // alwaysDiscardsLateVideoFrames = true means frames arriving during processing
  // are dropped automatically — no external locking needed.
  // This is the MLKit-recommended pattern for video frame analysis.
  private func processFrame(_ sampleBuffer: CMSampleBuffer, timestamp: TimeInterval) {
    guard let scanner = barcodeScanner,
      let recognizer = textRecognizer,
      let labeler = labeler
    else { return }

    guard let imageBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else { return }
    let imageWidth = CVPixelBufferGetWidth(imageBuffer)
    let imageHeight = CVPixelBufferGetHeight(imageBuffer)

    let visionImage = VisionImage(buffer: sampleBuffer)
    visionImage.orientation = imageOrientation(
      deviceOrientation: UIDevice.current.orientation,
      cameraPosition: cameraPosition)

    // Synchronous results(in:) — designed for use from captureOutput(_:didOutput:from:)
    let rawBarcodes = (try? scanner.results(in: visionImage)) ?? []
    let textResult = try? recognizer.results(in: visionImage)
    let rawLabels = (try? labeler.results(in: visionImage)) ?? []

    // ── Barcodes ──────────────────────────────────────────────────────────────
    // MLKit barcode.frame is already in pixel-space top-left coordinates.
    // Structured fields (url, wifi, email, etc.) come directly from the MLKit Barcode object.
    let barcodes = rawBarcodes.compactMap { serializeBarcode($0) }

    // ── Text ──────────────────────────────────────────────────────────────────
    // MLKit gives the full TextBlock → TextLine → TextElement hierarchy with pixel bounds,
    // plus per-block language detection — richer than Apple Vision.
    var serializedText: [String: Any]? = nil
    if let text = textResult, !text.text.isEmpty {
      serializedText = [
        "fullText": text.text,
        "blocks": text.blocks.map { serializeTextBlock($0) },
      ]
    }

    // ── Labels ────────────────────────────────────────────────────────────────
    // confidenceThreshold is already applied at the ImageLabelerOptions level.
    let labels: [[String: Any]] = rawLabels.prefix(10).map { label in
      ["text": label.text, "confidence": Double(label.confidence), "index": label.index]
    }

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
    self.trigger("detection", data: str)
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
