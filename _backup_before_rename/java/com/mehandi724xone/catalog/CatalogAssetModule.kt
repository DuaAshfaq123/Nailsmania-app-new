package com.mehandi724xone.catalog

import android.app.Activity
import android.content.res.AssetManager
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.android.play.core.assetpacks.AssetPackManager
import com.google.android.play.core.assetpacks.AssetPackManagerFactory
import com.google.android.play.core.assetpacks.AssetPackState
import com.google.android.play.core.assetpacks.AssetPackStateUpdateListener
import com.google.android.play.core.assetpacks.model.AssetPackStatus
import com.mehandi724xone.BuildConfig
import java.io.File

class CatalogAssetModule(
  private val context: ReactApplicationContext,
) : ReactContextBaseJavaModule(context) {
  private val assetPackManager: AssetPackManager =
    AssetPackManagerFactory.getInstance(context)
  private val promptedPacks = mutableSetOf<String>()
  private val lastProgress = mutableMapOf<String, PackProgress>()

  override fun getName(): String = "CatalogAssets"

  /**
   * Required so JS NativeEventEmitter does not warn, and used to replay the latest state
   * per pack: device events are not buffered, so a screen that mounts after a download
   * already reported would otherwise sit with no status to display at all.
   */
  @ReactMethod
  fun addListener(eventName: String?) {
    if (eventName != PROGRESS_EVENT) {
      return
    }

    synchronized(lastProgress) {
      lastProgress.values.toList()
    }.forEach { progress ->
      emitProgress(
        progress.packName,
        progress.status,
        progress.bytesDownloaded,
        progress.totalBytes,
      )
    }
  }

  @ReactMethod
  fun removeListeners(count: Int) {
  }

  @ReactMethod
  fun ensurePack(packName: String, promise: Promise) {
    installedPackPath(packName)?.let {
      emitProgress(packName, "completed", 1, 1)
      promise.resolve(it)
      return
    }

    if (BuildConfig.DEBUG && debugPackExists(packName)) {
      try {
        emitProgress(packName, "completed", 1, 1)
        promise.resolve(materializeDebugPack(packName).absolutePath)
      } catch (error: Exception) {
        promise.reject("DEBUG_PACK_COPY_FAILED", error)
      }
      return
    }

    lateinit var listener: AssetPackStateUpdateListener
    listener = AssetPackStateUpdateListener { state ->
      if (state.name() != packName) {
        return@AssetPackStateUpdateListener
      }

      emitProgress(state)

      when (state.status()) {
        AssetPackStatus.REQUIRES_USER_CONFIRMATION,
        AssetPackStatus.WAITING_FOR_WIFI -> requestMeteredConfirmation(packName)
        AssetPackStatus.COMPLETED -> {
          promptedPacks.remove(packName)
          assetPackManager.unregisterListener(listener)
          val path = installedPackPath(packName)
          if (path != null) {
            promise.resolve(path)
          } else {
            emitProgress(packName, "failed", 0, 0)
            promise.reject(
              "PACK_PATH_MISSING",
              "Pack $packName reported complete but its assets directory is missing or empty",
            )
          }
        }
        AssetPackStatus.FAILED,
        AssetPackStatus.CANCELED -> {
          promptedPacks.remove(packName)
          assetPackManager.unregisterListener(listener)
          promise.reject(
            "PACK_DOWNLOAD_FAILED",
            "Asset pack $packName failed with error ${state.errorCode()}",
          )
        }
      }
    }

    assetPackManager.registerListener(listener)
    assetPackManager.getPackStates(listOf(packName))
      .addOnSuccessListener { states ->
        states.packStates()[packName]?.let { emitProgress(it) }
      }
    assetPackManager.fetch(listOf(packName))
      .addOnFailureListener { error ->
        assetPackManager.unregisterListener(listener)
        emitProgress(packName, "failed", 0, 0)
        promise.reject("PACK_FETCH_FAILED", error)
      }
  }

  /**
   * Re-opens Play's download approval sheet. `ensurePack` already asks once per pack,
   * so this only exists for the in-app "use mobile data" action after a dismissal.
   */
  @ReactMethod
  fun confirmMeteredDownload(promise: Promise) {
    val activity = context.currentActivity
    if (activity == null) {
      promise.resolve(false)
      return
    }

    UiThreadUtil.runOnUiThread {
      assetPackManager.showConfirmationDialog(activity)
        .addOnSuccessListener { result -> promise.resolve(result == Activity.RESULT_OK) }
        .addOnFailureListener { promise.resolve(false) }
    }
  }

  @ReactMethod
  fun resolveBaseAsset(relativePath: String, promise: Promise) {
    try {
      val cacheRoot = File(context.cacheDir, "base-catalog")
      val output = File(cacheRoot, relativePath)
      if (!output.exists()) {
        output.parentFile?.mkdirs()
        context.assets.open(relativePath).use { input ->
          output.outputStream().use { stream -> input.copyTo(stream) }
        }
      }
      promise.resolve("file://${output.absolutePath}")
    } catch (error: Exception) {
      promise.reject("BASE_ASSET_RESOLVE_FAILED", error)
    }
  }

  /**
   * The catalog is not pinned to Wi-Fi. Play parks large packs at WAITING_FOR_WIFI (or
   * REQUIRES_USER_CONFIRMATION) until the user approves a metered download, so ask as
   * soon as that happens instead of stalling until Wi-Fi shows up. Asking once per pack
   * keeps a dismissal from turning into a dialog loop; the panel's button asks again.
   */
  private fun requestMeteredConfirmation(packName: String) {
    val activity = context.currentActivity ?: return
    if (!promptedPacks.add(packName)) {
      return
    }

    UiThreadUtil.runOnUiThread { assetPackManager.showConfirmationDialog(activity) }
  }

  private fun emitProgress(state: AssetPackState) {
    emitProgress(
      state.name(),
      statusLabel(state.status()),
      state.bytesDownloaded(),
      state.totalBytesToDownload(),
    )
  }

  private fun emitProgress(
    packName: String,
    status: String,
    bytesDownloaded: Long,
    totalBytes: Long,
  ) {
    synchronized(lastProgress) {
      lastProgress[packName] =
        PackProgress(packName, status, bytesDownloaded, totalBytes)
    }

    if (!context.hasActiveReactInstance()) {
      return
    }

    val map = Arguments.createMap()
    map.putString("packName", packName)
    map.putString("status", status)
    map.putDouble("bytesDownloaded", bytesDownloaded.toDouble())
    map.putDouble("totalBytes", totalBytes.toDouble())
    context
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(PROGRESS_EVENT, map)
  }

  private fun statusLabel(status: Int): String =
    when (status) {
      AssetPackStatus.PENDING -> "pending"
      AssetPackStatus.DOWNLOADING -> "downloading"
      AssetPackStatus.TRANSFERRING -> "transferring"
      AssetPackStatus.COMPLETED -> "completed"
      AssetPackStatus.FAILED -> "failed"
      AssetPackStatus.CANCELED -> "canceled"
      AssetPackStatus.WAITING_FOR_WIFI -> "waitingForWifi"
      AssetPackStatus.NOT_INSTALLED -> "notInstalled"
      AssetPackStatus.REQUIRES_USER_CONFIRMATION -> "needsConfirmation"
      else -> "pending"
    }

  /**
   * A location alone is NOT proof the pack is usable. A store install whose download was
   * interrupted (Play logs "Session not found") leaves getPackLocation returning an assets
   * path for a directory Play created but never filled, and trusting it made the app skip
   * fetch(), report the pack complete, and then fail reading  with ENOENT —
   * an empty gallery with no download in flight. Requiring real files means such a pack is
   * treated as absent, so fetch() runs and repairs it.
   */
  private fun installedPackPath(packName: String): String? {
    val path = assetPackManager.getPackLocation(packName)?.assetsPath() ?: return null
    val hasAssets = File(path).list()?.isNotEmpty() == true
    return if (hasAssets) path else null
  }

  private fun debugPackExists(packName: String): Boolean =
    try {
      context.assets.list("catalog_debug/$packName")?.isNotEmpty() == true
    } catch (_: Exception) {
      false
    }

  private fun materializeDebugPack(packName: String): File {
    val output = File(context.cacheDir, "catalog-debug/$packName")
    val marker = File(output, ".ready")
    if (!marker.exists()) {
      output.deleteRecursively()
      copyAssetTree(context.assets, "catalog_debug/$packName", output)
      marker.writeText("ok")
    }
    return output
  }

  private fun copyAssetTree(
    assets: AssetManager,
    assetPath: String,
    output: File,
  ) {
    val children = assets.list(assetPath).orEmpty()
    if (children.isEmpty()) {
      output.parentFile?.mkdirs()
      assets.open(assetPath).use { input ->
        output.outputStream().use { stream -> input.copyTo(stream) }
      }
      return
    }

    output.mkdirs()
    children.forEach { child ->
      copyAssetTree(assets, "$assetPath/$child", File(output, child))
    }
  }

  private data class PackProgress(
    val packName: String,
    val status: String,
    val bytesDownloaded: Long,
    val totalBytes: Long,
  )

  companion object {
    const val PROGRESS_EVENT = "CatalogPackProgress"
  }
}
