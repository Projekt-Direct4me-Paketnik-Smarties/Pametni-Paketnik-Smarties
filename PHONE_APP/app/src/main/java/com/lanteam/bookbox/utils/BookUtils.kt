package com.lanteam.bookbox.utils

import android.content.Context
import android.media.MediaPlayer
import android.util.Base64
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.File

fun extractBoxId (qrValue: String) : Int? {
    val uri = android.net.Uri.parse(qrValue)
    val rawId = uri.pathSegments.getOrNull(1) ?: return null
    return rawId.trimStart('0').toIntOrNull()
}