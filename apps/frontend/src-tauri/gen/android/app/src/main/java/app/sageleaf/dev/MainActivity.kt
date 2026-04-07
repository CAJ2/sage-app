package app.sageleaf.dev

import android.os.Bundle
import android.view.View
import android.webkit.WebView
import androidx.activity.enableEdgeToEdge
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import kotlin.math.max

object WindowInsetsUtil {
  fun applySystemBarsPadding(view: View) {
    ViewCompat.setOnApplyWindowInsetsListener(view) { v, insets ->
      val systemBars = insets.getInsets(
        WindowInsetsCompat.Type.systemBars()
          or WindowInsetsCompat.Type.displayCutout()
      )
      val ime = insets.getInsets(WindowInsetsCompat.Type.ime())
      v.setPadding(
        systemBars.left,
        systemBars.top,
        systemBars.right,
        max(systemBars.bottom, ime.bottom),
      )
      WindowInsetsCompat.CONSUMED
    }
  }
}
class MainActivity : TauriActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
  }

  override fun onWebViewCreate(webView: WebView) {
    // Disable native Android overscroll stretch/glow effect on the WebView.
    // CSS overscroll-behavior does not affect the native EdgeEffect layer.
    webView.overScrollMode = View.OVER_SCROLL_NEVER
  }
}
