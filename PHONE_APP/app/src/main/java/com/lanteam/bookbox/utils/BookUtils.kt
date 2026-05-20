package com.lanteam.bookbox.utils

import android.content.Context
import android.media.MediaPlayer
import android.util.Base64
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.Dispatcher
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.File

fun extractBoxIf (qrValue: String) : Int? {
    val uri = android.net.Uri.parse(qrValue)
    val rawId = uri.pathSegments.getOrNull(1) ?: return null
    return rawId.trimStart('0').toIntOrNull()
}

suspend fun openBoxAndPlayAudio (
    context: Context,
    boxId: Int
): Boolean = withContext(Dispatchers.IO) {
    try {
        val client = OkHttpClient()
        val json = JSONObject().apply {
            put("boxId", boxId)
            put("qrCodeInfo", "String")
            put("tokenFormat", 5)
            put("addAccessLog", true)
        }

        val body = json.toString().toRequestBody("application/json".toMediaType())

        val request = Request.Builder()
            .url("https://api-d4me-stage.direct4.me/sandbox/v1/Access/openbox")
            .addHeader("Authorization", "Bearer 9ea96945-3a37-4638-a5d4-22e89fbc998f")
            .addHeader("Content-Type", "application/json")
            .post(body)
            .build()

        val response = client.newCall(request).execute()
        if (!response.isSuccessful) return@withContext false

        val responseText = response.body?.string() ?: return@withContext false
        val audioBase64 = JSONObject(responseText).getString("data")
        val audioBytes = Base64.decode(audioBase64, Base64.DEFAULT)

        val audioFile = File(context.cacheDir, "openbox_audio.mp3")
        audioFile.writeBytes(audioBytes)

        withContext(Dispatchers.Main) {
            MediaPlayer().apply {
                setDataSource(audioFile.absolutePath)
                prepare()
                start()
                setOnCompletionListener { it.release() }
            }
        }

        true
    } catch (e: Exception) {
        e.printStackTrace()
        false
    }
}