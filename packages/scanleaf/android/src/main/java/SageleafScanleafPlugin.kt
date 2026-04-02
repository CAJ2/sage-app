// Copyright 2019-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

package app.sageleaf.scanleaf

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.content.Intent
import android.graphics.Color
import android.graphics.drawable.Drawable
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.util.Size
import android.view.ViewGroup
import android.webkit.WebView
import android.widget.FrameLayout
import androidx.activity.result.ActivityResult
import androidx.camera.core.Camera
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.core.content.ContextCompat
import androidx.lifecycle.LifecycleOwner
import app.tauri.PermissionState
import app.tauri.annotation.ActivityCallback
import app.tauri.annotation.Command
import app.tauri.annotation.InvokeArg
import app.tauri.annotation.Permission
import app.tauri.annotation.PermissionCallback
import app.tauri.annotation.TauriPlugin
import app.tauri.plugin.Invoke
import app.tauri.plugin.JSArray
import app.tauri.plugin.JSObject
import app.tauri.plugin.Plugin
import com.google.mlkit.vision.barcode.BarcodeScannerOptions
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.label.ImageLabel
import com.google.mlkit.vision.label.ImageLabeler
import com.google.mlkit.vision.label.ImageLabeling
import com.google.mlkit.vision.label.defaults.ImageLabelerOptions
import com.google.mlkit.vision.text.Text
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.TextRecognizer
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import android.util.Log
import java.util.Collections
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicInteger
import java.util.concurrent.atomic.AtomicReference

private const val CAMERA_ALIAS = "camera"
private const val TAG = "Scanleaf"

@InvokeArg
class CameraOptions {
    var windowed: Boolean = true
    var facing: String? = null
}

@InvokeArg
class ScanOptions {
    var barcodeFormats: Array<String>? = null
    var confidenceThreshold: Float = 0.7f
}

@TauriPlugin(
    permissions = [Permission(strings = [Manifest.permission.CAMERA], alias = CAMERA_ALIAS)]
)
class SageleafScanleafPlugin(private val activity: Activity) : Plugin(activity),
    ImageAnalysis.Analyzer {

    private lateinit var webView: WebView

    // Camera
    private var previewView: PreviewView? = null
    private var cameraProvider: ProcessCameraProvider? = null
    private var imageAnalysis: ImageAnalysis? = null
    private var camera: Camera? = null
    private var webViewBackground: Drawable? = null

    // State
    @Volatile private var isOpen = false
    @Volatile private var isScanning = false
    @Volatile private var windowed = true

    // Scan config
    private var confidenceThreshold = 0.7f
    private var requestPermissionResponse: JSObject? = null

    // MLKit clients — all three active while scanning
    private var barcodeScanner: com.google.mlkit.vision.barcode.BarcodeScanner? = null
    private var textRecognizer: TextRecognizer? = null
    private var imageLabeler: ImageLabeler? = null

    // Frame throttle — plugin decides sampling rate (300 ms)
    @Volatile private var lastProcessedMs: Long = 0
    private val throttleMs = 300L

    // Background executor for image analysis — keeps analysis off the main thread
    private val analysisExecutor = Executors.newSingleThreadExecutor()

    // Supported barcode format strings → MLKit constants
    private val supportedBarcodeFormats: Map<String, Int> = Collections.unmodifiableMap(
        hashMapOf(
            "UPC_A" to Barcode.FORMAT_UPC_A,
            "UPC_E" to Barcode.FORMAT_UPC_E,
            "EAN_8" to Barcode.FORMAT_EAN_8,
            "EAN_13" to Barcode.FORMAT_EAN_13,
            "CODE_39" to Barcode.FORMAT_CODE_39,
            "CODE_93" to Barcode.FORMAT_CODE_93,
            "CODE_128" to Barcode.FORMAT_CODE_128,
            "CODABAR" to Barcode.FORMAT_CODABAR,
            "ITF" to Barcode.FORMAT_ITF,
            "AZTEC" to Barcode.FORMAT_AZTEC,
            "DATA_MATRIX" to Barcode.FORMAT_DATA_MATRIX,
            "PDF_417" to Barcode.FORMAT_PDF417,
            "QR_CODE" to Barcode.FORMAT_QR_CODE
        )
    )

    override fun load(webView: WebView) {
        super.load(webView)
        this.webView = webView
    }

    // ─── Camera lifecycle ────────────────────────────────────────────────────

    @Command
    fun openCamera(invoke: Invoke) {
        val args = invoke.parseArgs(CameraOptions::class.java)
        windowed = args.windowed
        Log.d(TAG, "openCamera: facing=${args.facing ?: "back"} windowed=$windowed")

        if (getPermissionState(CAMERA_ALIAS) != PermissionState.GRANTED) {
            Log.w(TAG, "openCamera: camera permission not granted")
            invoke.reject("Camera permission not granted. Call requestPermissions first.")
            return
        }

        activity.runOnUiThread {
            setupPreviewView()

            val facingInt = if (args.facing == "front")
                CameraSelector.LENS_FACING_FRONT
            else
                CameraSelector.LENS_FACING_BACK

            val future = ProcessCameraProvider.getInstance(activity)
            future.addListener({
                try {
                    val provider = future.get()
                    bindCamera(provider, facingInt)
                    cameraProvider = provider
                    isOpen = true
                    Log.d(TAG, "openCamera: camera bound and ready")
                    invoke.resolve()
                } catch (e: Exception) {
                    Log.e(TAG, "openCamera: failed to bind camera", e)
                    invoke.reject(e.message ?: "Failed to open camera")
                }
            }, ContextCompat.getMainExecutor(activity))
        }
    }

    @Command
    fun closeCamera(invoke: Invoke) {
        Log.d(TAG, "closeCamera")
        dismantleCamera()
        invoke.resolve()
    }

    // ─── Scan lifecycle ──────────────────────────────────────────────────────

    @Command
    fun startScan(invoke: Invoke) {
        if (!isOpen) {
            Log.w(TAG, "startScan: camera is not open")
            invoke.reject("Camera is not open. Call openCamera first.")
            return
        }
        val args = invoke.parseArgs(ScanOptions::class.java)
        confidenceThreshold = args.confidenceThreshold

        closeMLKitClients()

        // Barcode scanner — narrow to requested formats or detect all
        val formats = args.barcodeFormats ?: arrayOf()
        val mappedInts = formats.mapNotNull { supportedBarcodeFormats[it] }
        val barcodeOptions = if (mappedInts.isNotEmpty()) {
            BarcodeScannerOptions.Builder()
                .setBarcodeFormats(mappedInts.first(), *mappedInts.drop(1).toIntArray())
                .build()
        } else {
            BarcodeScannerOptions.Builder()
                .setBarcodeFormats(Barcode.FORMAT_ALL_FORMATS)
                .build()
        }
        barcodeScanner = BarcodeScanning.getClient(barcodeOptions)
        textRecognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)
        imageLabeler = ImageLabeling.getClient(
            ImageLabelerOptions.Builder()
                .setConfidenceThreshold(confidenceThreshold)
                .build()
        )

        isScanning = true
        Log.d(TAG, "startScan: scanning started — formats=${formats.toList().ifEmpty { listOf("ALL") }} confidenceThreshold=$confidenceThreshold")
        invoke.resolve()
    }

    @Command
    fun stopScan(invoke: Invoke) {
        Log.d(TAG, "stopScan")
        isScanning = false
        closeMLKitClients()
        invoke.resolve()
    }

    // ─── Internal camera helpers ─────────────────────────────────────────────

    private fun setupPreviewView() {
        val pv = PreviewView(activity)
        pv.layoutParams = FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        )
        previewView = pv
        val parent = webView.parent as ViewGroup
        parent.addView(pv, 0)
        Log.d(TAG, "setupPreviewView: added PreviewView to parent (windowed=$windowed)")

        if (windowed) {
            webView.bringToFront()
            webViewBackground = webView.background
            webView.setBackgroundColor(Color.TRANSPARENT)
        }
    }

    private fun bindCamera(provider: ProcessCameraProvider, facing: Int) {
        val facingLabel = if (facing == CameraSelector.LENS_FACING_FRONT) "front" else "back"
        val preview = Preview.Builder().build()
        val selector = CameraSelector.Builder().requireLensFacing(facing).build()
        preview.setSurfaceProvider(previewView?.surfaceProvider)

        val analysis = ImageAnalysis.Builder()
            .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
            .setTargetResolution(Size(1280, 720))
            .build()
        analysis.setAnalyzer(analysisExecutor, this)
        imageAnalysis = analysis

        provider.bindToLifecycle(
            activity as LifecycleOwner,
            selector,
            preview,
            analysis
        )
        Log.d(TAG, "bindCamera: bound Preview + ImageAnalysis (facing=$facingLabel)")
    }

    private fun dismantleCamera() {
        Log.d(TAG, "dismantleCamera: unbinding all use cases")
        isScanning = false
        isOpen = false
        closeMLKitClients()
        activity.runOnUiThread {
            cameraProvider?.unbindAll()
            previewView?.let { (webView.parent as? ViewGroup)?.removeView(it) }
            previewView = null
            cameraProvider = null
            imageAnalysis = null
            camera = null
            if (windowed) {
                if (webViewBackground != null) {
                    webView.background = webViewBackground
                    webViewBackground = null
                } else {
                    webView.setBackgroundColor(Color.WHITE)
                }
            }
        }
    }

    private fun closeMLKitClients() {
        barcodeScanner?.close(); barcodeScanner = null
        textRecognizer?.close(); textRecognizer = null
        imageLabeler?.close(); imageLabeler = null
    }

    // ─── ImageAnalysis.Analyzer ──────────────────────────────────────────────

    // Throttled log counter — print one "frames flowing" message per 30 frames
    @Volatile private var frameCount = 0L

    @SuppressLint("UnsafeOptInUsageError")
    override fun analyze(image: ImageProxy) {
        if (!isScanning) { image.close(); return }

        val now = System.currentTimeMillis()
        if (now - lastProcessedMs < throttleMs) { image.close(); return }
        lastProcessedMs = now

        val count = ++frameCount
        if (count == 1L || count % 30 == 0L) {
            Log.d(TAG, "analyze: processing frame #$count (${image.width}x${image.height} rot=${image.imageInfo.rotationDegrees}°)")
        }

        val mediaImage = image.image
        if (mediaImage == null) {
            Log.w(TAG, "analyze: mediaImage is null, skipping frame")
            image.close()
            return
        }

        val inputImage = InputImage.fromMediaImage(mediaImage, image.imageInfo.rotationDegrees)
        processAllDetectors(inputImage, image, now)
    }

    // Runs all three MLKit detectors in parallel on the same frame.
    // A countdown latch (AtomicInteger) fires buildAndEmitFrame once all complete.
    private fun processAllDetectors(inputImage: InputImage, image: ImageProxy, timestamp: Long) {
        val barcodesRef = AtomicReference<List<Barcode>>(emptyList())
        val textRef = AtomicReference<Text?>(null)
        val labelsRef = AtomicReference<List<ImageLabel>>(emptyList())
        val pending = AtomicInteger(3)
        val imgWidth = inputImage.width
        val imgHeight = inputImage.height

        fun done() {
            if (pending.decrementAndGet() == 0) {
                image.close()
                buildAndEmitFrame(barcodesRef.get(), textRef.get(), labelsRef.get(), timestamp, imgWidth, imgHeight)
            }
        }

        barcodeScanner!!.process(inputImage)
            .addOnSuccessListener { barcodesRef.set(it) }
            .addOnFailureListener { e -> Log.e(TAG, "barcode detector failed", e) }
            .addOnCompleteListener { done() }

        textRecognizer!!.process(inputImage)
            .addOnSuccessListener { textRef.set(it) }
            .addOnFailureListener { e -> Log.e(TAG, "text recognizer failed", e) }
            .addOnCompleteListener { done() }

        imageLabeler!!.process(inputImage)
            .addOnSuccessListener { labelsRef.set(it) }
            .addOnFailureListener { e -> Log.e(TAG, "image labeler failed", e) }
            .addOnCompleteListener { done() }
    }

    private fun barcodeValueType(type: Int): String = when (type) {
        Barcode.TYPE_URL -> "url"
        Barcode.TYPE_EMAIL -> "email"
        Barcode.TYPE_PHONE -> "phone"
        Barcode.TYPE_SMS -> "sms"
        Barcode.TYPE_WIFI -> "wifi"
        Barcode.TYPE_GEO -> "geo"
        Barcode.TYPE_CONTACT_INFO -> "contact"
        Barcode.TYPE_CALENDAR_EVENT -> "calendar"
        Barcode.TYPE_ISBN -> "isbn"
        Barcode.TYPE_PRODUCT -> "product"
        Barcode.TYPE_DRIVER_LICENSE -> "driver-license"
        Barcode.TYPE_TEXT -> "text"
        else -> "unknown"
    }

    private fun wifiEncryptionType(type: Int): String = when (type) {
        Barcode.WiFi.TYPE_WPA -> "wpa"
        Barcode.WiFi.TYPE_WEP -> "wep"
        Barcode.WiFi.TYPE_OPEN -> "open"
        else -> "unknown"
    }

    private fun buildAndEmitFrame(
        barcodes: List<Barcode>,
        visionText: Text?,
        labels: List<ImageLabel>,
        timestamp: Long,
        imageWidth: Int,
        imageHeight: Int
    ) {
        // ── Barcodes ──────────────────────────────────────────────────────────
        val barcodesArray = JSArray()
        for (barcode in barcodes) {
            val rawValue = barcode.rawValue ?: continue
            val format = supportedBarcodeFormats.entries
                .firstOrNull { it.value == barcode.format }?.key ?: "UNKNOWN"
            if (format == "UNKNOWN") continue

            val obj = JSObject()
            obj.put("format", format)
            obj.put("rawValue", rawValue)
            barcode.displayValue?.let { obj.put("displayValue", it) }
            obj.put("valueType", barcodeValueType(barcode.valueType))

            barcode.boundingBox?.let { rect ->
                val bb = JSObject()
                bb.put("x", rect.left)
                bb.put("y", rect.top)
                bb.put("width", rect.right - rect.left)
                bb.put("height", rect.bottom - rect.top)
                obj.put("bounds", bb)
            }

            // Structured payload
            when (barcode.valueType) {
                Barcode.TYPE_URL -> barcode.url?.let { url ->
                    val urlObj = JSObject()
                    urlObj.put("url", url.url ?: "")
                    url.title?.let { urlObj.put("title", it) }
                    obj.put("url", urlObj)
                }
                Barcode.TYPE_WIFI -> barcode.wifi?.let { wifi ->
                    val wifiObj = JSObject()
                    wifiObj.put("ssid", wifi.ssid ?: "")
                    wifi.password?.let { wifiObj.put("password", it) }
                    wifiObj.put("encryptionType", wifiEncryptionType(wifi.encryptionType))
                    obj.put("wifi", wifiObj)
                }
                Barcode.TYPE_EMAIL -> barcode.email?.let { email ->
                    val emailObj = JSObject()
                    emailObj.put("address", email.address ?: "")
                    email.subject?.let { emailObj.put("subject", it) }
                    email.body?.let { emailObj.put("body", it) }
                    obj.put("email", emailObj)
                }
                Barcode.TYPE_PHONE -> barcode.phone?.let { phone ->
                    val phoneObj = JSObject()
                    phoneObj.put("number", phone.number ?: "")
                    obj.put("phone", phoneObj)
                }
                Barcode.TYPE_SMS -> barcode.sms?.let { sms ->
                    val smsObj = JSObject()
                    smsObj.put("phoneNumber", sms.phoneNumber ?: "")
                    sms.message?.let { smsObj.put("message", it) }
                    obj.put("sms", smsObj)
                }
                Barcode.TYPE_GEO -> barcode.geoPoint?.let { geo ->
                    val geoObj = JSObject()
                    geoObj.put("latitude", geo.lat)
                    geoObj.put("longitude", geo.lng)
                    obj.put("geo", geoObj)
                }
                Barcode.TYPE_CONTACT_INFO -> barcode.contactInfo?.let { contact ->
                    val contactObj = JSObject()
                    contact.name?.let { name ->
                        val parts = listOfNotNull(name.first, name.last)
                        if (parts.isNotEmpty()) contactObj.put("name", parts.joinToString(" "))
                    }
                    contact.organization?.let { contactObj.put("organization", it) }
                    contact.phones.firstOrNull()?.number?.let { contactObj.put("phone", it) }
                    contact.emails.firstOrNull()?.address?.let { contactObj.put("email", it) }
                    obj.put("contact", contactObj)
                }
                else -> Unit
            }

            barcodesArray.put(obj)
        }

        // ── Text ──────────────────────────────────────────────────────────────
        var textObj: JSObject? = null
        if (visionText != null && visionText.text.isNotEmpty()) {
            val blocksArray = JSArray()
            for (block in visionText.textBlocks) {
                val blockObj = JSObject()
                blockObj.put("text", block.text)
                block.boundingBox?.let { rect ->
                    val bb = JSObject()
                    bb.put("x", rect.left); bb.put("y", rect.top)
                    bb.put("width", rect.right - rect.left)
                    bb.put("height", rect.bottom - rect.top)
                    blockObj.put("bounds", bb)
                }
                val linesArray = JSArray()
                for (line in block.lines) {
                    val lineObj = JSObject()
                    lineObj.put("text", line.text)
                    line.boundingBox?.let { rect ->
                        val lb = JSObject()
                        lb.put("x", rect.left); lb.put("y", rect.top)
                        lb.put("width", rect.right - rect.left)
                        lb.put("height", rect.bottom - rect.top)
                        lineObj.put("bounds", lb)
                    }
                    // Word-level elements
                    if (line.elements.isNotEmpty()) {
                        val elems = JSArray()
                        for (elem in line.elements) {
                            val eObj = JSObject()
                            eObj.put("text", elem.text)
                            elem.boundingBox?.let { rect ->
                                val eb = JSObject()
                                eb.put("x", rect.left); eb.put("y", rect.top)
                                eb.put("width", rect.right - rect.left)
                                eb.put("height", rect.bottom - rect.top)
                                eObj.put("bounds", eb)
                            }
                            elems.put(eObj)
                        }
                        lineObj.put("elements", elems)
                    }
                    linesArray.put(lineObj)
                }
                blockObj.put("lines", linesArray)
                blocksArray.put(blockObj)
            }
            textObj = JSObject()
            textObj.put("fullText", visionText.text)
            textObj.put("blocks", blocksArray)
        }

        // ── Labels ────────────────────────────────────────────────────────────
        val labelsArray = JSArray()
        for (label in labels) {
            val obj = JSObject()
            obj.put("text", label.text)
            obj.put("confidence", label.confidence)
            obj.put("index", label.index)
            labelsArray.put(obj)
        }

        // Only emit when at least one detector found something
        val hasResults = barcodesArray.length() > 0 || textObj != null || labelsArray.length() > 0
        Log.d(TAG, "buildAndEmitFrame: barcodes=${barcodesArray.length()} text=${textObj != null} labels=${labelsArray.length()} — ${if (hasResults) "emitting" else "skipping (empty)"}")
        if (!hasResults) return

        val frame = JSObject()
        frame.put("barcodes", barcodesArray)
        frame.put("labels", labelsArray)
        frame.put("timestamp", timestamp)
        frame.put("imageWidth", imageWidth)
        frame.put("imageHeight", imageHeight)
        textObj?.let { frame.put("text", it) }

        trigger("detection", frame)
    }

    // ─── Permissions ─────────────────────────────────────────────────────────

    @SuppressLint("ObsoleteSdkInt")
    @Command
    override fun requestPermissions(invoke: Invoke) {
        val response = JSObject()
        if (getPermissionState(CAMERA_ALIAS) == PermissionState.GRANTED) {
            response.put(CAMERA_ALIAS, PermissionState.GRANTED)
            invoke.resolve(response)
        } else {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                requestPermissionResponse = response
                requestPermissionForAlias(CAMERA_ALIAS, invoke, "cameraPermissionCallback")
            } else {
                response.put(CAMERA_ALIAS, PermissionState.GRANTED)
                invoke.resolve(response)
            }
        }
    }

    @PermissionCallback
    fun cameraPermissionCallback(invoke: Invoke) {
        val response = requestPermissionResponse ?: return
        val granted = getPermissionState(CAMERA_ALIAS) == PermissionState.GRANTED
        response.put(CAMERA_ALIAS, if (granted) PermissionState.GRANTED else PermissionState.DENIED)
        invoke.resolve(response)
        requestPermissionResponse = null
    }

    @Command
    fun openAppSettings(invoke: Invoke) {
        val intent = Intent(
            Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
            Uri.fromParts("package", activity.packageName, null)
        )
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        startActivityForResult(invoke, intent, "openSettingsResult")
    }

    @ActivityCallback
    private fun openSettingsResult(invoke: Invoke, result: ActivityResult) {
        invoke.resolve()
    }
}
