package com.camgig

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.Settings
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class BrightnessModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "BrightnessModule"

    @ReactMethod
    fun setBrightness(value: Float) {
        val activity = reactContext.currentActivity ?: return
        activity.runOnUiThread {
            val params = activity.window.attributes
            params.screenBrightness = value.coerceIn(0f, 1f)
            activity.window.attributes = params
        }
    }

    @ReactMethod
    fun getBrightness(promise: Promise) {
        val activity = reactContext.currentActivity
        if (activity == null) {
            promise.resolve(0.5)
            return
        }
        val b = activity.window.attributes.screenBrightness
        promise.resolve(if (b < 0) 0.5 else b.toDouble())
    }

    @ReactMethod
    fun getDownloadsPath(promise: Promise) {
        val path = Environment
            .getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
            .absolutePath
        promise.resolve(path)
    }

    @ReactMethod
    fun hasStoragePermission(promise: Promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            promise.resolve(Environment.isExternalStorageManager())
        } else {
            promise.resolve(true)
        }
    }

    @ReactMethod
    fun setKeepScreenOn(enabled: Boolean) {
        val activity = reactContext.currentActivity ?: return
        activity.runOnUiThread {
            if (enabled) {
                activity.window.addFlags(android.view.WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
            } else {
                activity.window.clearFlags(android.view.WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
            }
        }
    }

    @ReactMethod
    fun setNavigationBarColor(red: Int, green: Int, blue: Int) {
        val activity = reactContext.currentActivity ?: return
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            activity.runOnUiThread {
                activity.window.navigationBarColor = android.graphics.Color.rgb(red, green, blue)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    val decorView = activity.window.decorView
                    @Suppress("DEPRECATION")
                    var flags = decorView.systemUiVisibility
                    @Suppress("DEPRECATION")
                    flags = if (red + green + blue > 382) {
                        flags or android.view.View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR
                    } else {
                        flags and android.view.View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR.inv()
                    }
                    @Suppress("DEPRECATION")
                    decorView.systemUiVisibility = flags
                }
            }
        }
    }

    @ReactMethod
    fun requestStoragePermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            val intent = Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION).apply {
                data = Uri.parse("package:${reactContext.packageName}")
            }
            reactContext.currentActivity?.startActivity(intent)
        }
    }
}
