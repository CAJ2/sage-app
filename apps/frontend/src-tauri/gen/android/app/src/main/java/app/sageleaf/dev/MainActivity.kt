package app.sageleaf.dev

import android.content.res.Configuration
import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.WindowInsetsController
import android.webkit.JavascriptInterface
import android.webkit.WebView
import androidx.activity.enableEdgeToEdge
import androidx.core.view.WindowInsetsControllerCompat

class MainActivity : TauriActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
  }

  override fun onResume() {
    super.onResume()
    applySystemBarsAppearance()
  }

  override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)
    applySystemBarsAppearance()
  }

  // Called after window is fully presented to the user — most reliable hook
  override fun onWindowFocusChanged(hasFocus: Boolean) {
    super.onWindowFocusChanged(hasFocus)
    if (hasFocus) applySystemBarsAppearance()
  }

  override fun onWebViewCreate(webView: WebView) {
    webView.overScrollMode = View.OVER_SCROLL_NEVER
    // The Vue app watches isDark and calls AndroidStatusBar.setLight(!dark)
    // so the status bar icons reflect the app theme, not the system theme.
    webView.addJavascriptInterface(StatusBarBridge(), "AndroidStatusBar")
  }

  // Tracks the app's actual theme as last reported by the Vue side.
  // null means the JS bridge hasn't fired yet (use system dark mode as fallback).
  private var lastKnownLight: Boolean? = null

  // Bridge called from Vue when the app's color scheme changes
  inner class StatusBarBridge {
    @JavascriptInterface
    fun setLight(isLight: Boolean) {
      lastKnownLight = isLight
      runOnUiThread { applySystemBarsAppearanceForLight(isLight) }
    }
  }

  // Uses the last value reported by Vue, falling back to system dark mode before
  // the JS bridge has communicated for the first time (e.g. before page load).
  private fun applySystemBarsAppearance() {
    val isLight = lastKnownLight ?: run {
      val nightMask = resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK
      nightMask != Configuration.UI_MODE_NIGHT_YES
    }
    applySystemBarsAppearanceForLight(isLight)
  }

  private fun applySystemBarsAppearanceForLight(isLight: Boolean) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      val bits = WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS or
        WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS
      window.decorView.windowInsetsController?.setSystemBarsAppearance(
        if (isLight) bits else 0,
        bits,
      )
    } else {
      WindowInsetsControllerCompat(window, window.decorView).apply {
        isAppearanceLightStatusBars = isLight
        isAppearanceLightNavigationBars = isLight
      }
    }
  }
}
