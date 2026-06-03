package com.lanteam.bookbox.ui.view

import androidx.camera.core.CameraSelector
import androidx.camera.core.ExperimentalGetImage
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.Card
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import androidx.lifecycle.compose.LocalLifecycleOwner
import com.lanteam.bookbox.ViewModels.UserContext
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicBoolean
import java.util.concurrent.atomic.AtomicLong

@androidx.annotation.OptIn(ExperimentalGetImage::class)
@Composable
fun LogInImageView(userContext: UserContext,
                   onBackClick: () -> Unit) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    val scannerExecutor = remember { Executors.newSingleThreadExecutor() }
    val isProcessing = remember { AtomicBoolean(false) } // throttle flag
    val loginSuccess = remember { AtomicBoolean(false) } // stop after success
    var statusText by remember { mutableStateOf("Scanning for face...") }
    var previewView by remember { mutableStateOf<PreviewView?>(null) }

    // Throttle — only send one request every 2 seconds
    val lastSentTime = remember { AtomicLong(0) }

    DisposableEffect(Unit) {
        onDispose { scannerExecutor.shutdown() }
    }

    DisposableEffect(previewView) {
        val currentPreviewView = previewView ?: return@DisposableEffect onDispose {}

        val cameraProviderFuture = ProcessCameraProvider.getInstance(context)
        cameraProviderFuture.addListener({
            val cameraProvider = cameraProviderFuture.get()
            val preview = Preview.Builder().build().also {
                it.setSurfaceProvider(currentPreviewView.surfaceProvider)
            }

            val imageAnalysis = ImageAnalysis.Builder()
                .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                .build()
                .apply {
                    setAnalyzer(scannerExecutor) { imageProxy ->
                        val now = System.currentTimeMillis()
                        val shouldSend = !isProcessing.get()
                                && !loginSuccess.get()
                                && now - lastSentTime.get() > 5000 // 2 second throttle

                        if (shouldSend) {
                            val mediaImage = imageProxy.image
                            if (mediaImage != null) {
                                isProcessing.set(true)
                                lastSentTime.set(now)

                                // Convert frame to JPEG bytes
                                val bitmap = imageProxy.toBitmap()
                                val stream = java.io.ByteArrayOutputStream()
                                bitmap.compress(android.graphics.Bitmap.CompressFormat.JPEG, 80, stream)
                                val imageBytes = stream.toByteArray()

                                userContext.scanImageLogin(imageBytes) { success ->
                                    if (success) {
                                        loginSuccess.set(true)
                                        statusText = "Face recognised!"
                                    } else {
                                        statusText = "No match, keep scanning..."
                                    }
                                    isProcessing.set(false)
                                }
                            }
                        }
                        imageProxy.close()
                    }
                }

            cameraProvider.unbindAll()
            cameraProvider.bindToLifecycle(
                lifecycleOwner,
                CameraSelector.DEFAULT_FRONT_CAMERA, //chnge this for back camera
                preview,
                imageAnalysis
            )
        }, ContextCompat.getMainExecutor(context))

        onDispose {
            try { cameraProviderFuture.get().unbindAll() } catch (_: Exception) {}
        }
    }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Log in with 2FA")
        Spacer(modifier = Modifier.height(8.dp))
        TextButton(onClick = onBackClick) {
            Icon(Icons.Filled.ArrowBack, contentDescription = null)
            Text("Back")
        }
        Spacer(modifier = Modifier.height(8.dp))
        Text(statusText, style = MaterialTheme.typography.titleMedium)
        Spacer(modifier = Modifier.height(16.dp))
        Card(modifier = Modifier.fillMaxSize()) {
            Box(modifier = Modifier.fillMaxSize()) {
                AndroidView(
                    factory = { ctx -> PreviewView(ctx).also { previewView = it } },
                    modifier = Modifier.fillMaxSize()
                )
            }
        }
    }
}