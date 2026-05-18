package lanteam.bookbox

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Book
import androidx.compose.material.icons.filled.QrCodeScanner
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.barcode.BarcodeScannerOptions
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.common.InputImage
import androidx.lifecycle.compose.LocalLifecycleOwner
import kotlinx.coroutines.launch
import lanteam.bookbox.ui.theme.MyApplicationTheme
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicBoolean
import android.content.Context
import android.media.MediaPlayer
import android.util.Base64
import androidx.camera.core.ExperimentalGetImage
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import androidx.compose.runtime.rememberCoroutineScope
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.File

enum class AppScreen {
    Map,
    List,
    MyBooks,
    Profile,
    BookDetail,
    QrScanner
}

data class Book(
    val title: String,
    val author: String,
    val description: String
)

private val sampleBooks = listOf(
    Book(
        title = "The Little Prince",
        author = "Antoine de Saint-Exupéry",
        description = "A timeless story about curiosity, friendship, and what really matters."
    ),
    Book(
        title = "1984",
        author = "George Orwell",
        description = "A classic dystopian novel about surveillance, control, and freedom."
    ),
    Book(
        title = "The Hobbit",
        author = "J.R.R. Tolkien",
        description = "A cozy adventure that follows Bilbo Baggins into an unexpected journey."
    )
)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MyApplicationTheme {
                BookBoxApp()
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BookBoxApp() {
    var currentScreen by remember { mutableStateOf(AppScreen.Map) }
    var selectedBook by remember { mutableStateOf(sampleBooks.first()) }
    var unlockMessage by remember { mutableStateOf<String?>(null) }
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text(text = stringResource(R.string.app_name)) }
            )
        },
        bottomBar = {
            if (currentScreen == AppScreen.Map || currentScreen == AppScreen.List || currentScreen == AppScreen.MyBooks || currentScreen == AppScreen.Profile) {
                NavigationBar {
                    NavigationBarItem(
                        selected = currentScreen == AppScreen.Map,
                        onClick = { currentScreen = AppScreen.Map },
                        icon = {},
                        label = { Text(text = stringResource(R.string.navMap)) }
                    )
                    NavigationBarItem(
                        selected = currentScreen == AppScreen.List,
                        onClick = { currentScreen = AppScreen.List },
                        icon = {},
                        label = { Text(text = stringResource(R.string.navList)) }
                    )
                    NavigationBarItem(
                        selected = currentScreen == AppScreen.MyBooks,
                        onClick = { currentScreen = AppScreen.MyBooks },
                        icon = {},
                        label = { Text(text = stringResource(R.string.navMyBooks)) }
                    )
                    NavigationBarItem(
                        selected = currentScreen == AppScreen.Profile,
                        onClick = { currentScreen = AppScreen.Profile },
                        icon = {},
                        label = { Text(text = stringResource(R.string.navProfile)) }
                    )
                }
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            when (currentScreen) {
                AppScreen.Map -> MapScreen()
                AppScreen.List -> ListScreen(
                    books = sampleBooks,
                    onBookSelected = { book ->
                        selectedBook = book
                        unlockMessage = null
                        currentScreen = AppScreen.BookDetail
                    }
                )
                AppScreen.MyBooks -> MyBooksScreen()
                AppScreen.Profile -> ProfileScreen(onNavigate = { currentScreen = it })
                AppScreen.BookDetail -> BookDetailScreen(
                    book = selectedBook,
                    unlockMessage = unlockMessage,
                    onUnlockClick = { currentScreen = AppScreen.QrScanner },
                    onBackClick = { currentScreen = AppScreen.List }
                )
                AppScreen.QrScanner -> QrScannerScreen(
                    onQrScanned = { scannedValue ->
                        val boxId = extractBoxId(scannedValue)

                        if (boxId == null) {
                            unlockMessage = "Neveljaven QR: $scannedValue"
                            currentScreen = AppScreen.BookDetail
                        } else {
                            unlockMessage = "Odpiram paketnik $boxId..."
                            Toast.makeText(context, "Odpiram paketnik $boxId", Toast.LENGTH_SHORT).show()

                            scope.launch {
                                val success = openBoxAndPlayAudio(context, boxId)

                                unlockMessage = if (success) {
                                    "Zvok za paketnik $boxId je bil predvajan."
                                } else {
                                    "Napaka pri odpiranju paketnika $boxId."
                                }

                                currentScreen = AppScreen.BookDetail
                            }
                        }
                    },
                    onBackClick = { currentScreen = AppScreen.BookDetail }
                )
            }
        }
    }
}

@Composable
fun MapScreen() {
    Text("Map Screen")
}

@Composable
fun ListScreen(
    books: List<Book>,
    onBookSelected: (Book) -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "Available Books",
            style = MaterialTheme.typography.headlineSmall
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = "Tap a book to open its detail screen.",
            style = MaterialTheme.typography.bodyMedium
        )
        Spacer(modifier = Modifier.height(16.dp))

        LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            items(books) { book ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onBookSelected(book) },
                    elevation = CardDefaults.cardElevation(defaultElevation = 3.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Book,
                            contentDescription = null,
                            modifier = Modifier.padding(end = 12.dp)
                        )
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = book.title,
                                style = MaterialTheme.typography.titleMedium
                            )
                            Text(
                                text = book.author,
                                style = MaterialTheme.typography.bodyMedium
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun BookDetailScreen(
    book: Book,
    unlockMessage: String?,
    onUnlockClick: () -> Unit,
    onBackClick: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        TextButton(onClick = onBackClick) {
            Icon(Icons.Filled.ArrowBack, contentDescription = null)
            Text(text = "Back to list")
        }

        Spacer(modifier = Modifier.height(16.dp))

        Card(
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = book.title,
                    style = MaterialTheme.typography.headlineSmall
                )
                Text(
                    text = book.author,
                    style = MaterialTheme.typography.bodyLarge
                )
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    text = book.description,
                    style = MaterialTheme.typography.bodyMedium
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Button(
            onClick = onUnlockClick,
            modifier = Modifier.fillMaxWidth()
        ) {
            Icon(Icons.Filled.QrCodeScanner, contentDescription = null)
            Spacer(modifier = Modifier.height(0.dp))
            Text(text = "Unlock BookBox")
        }

        if (unlockMessage != null) {
            Spacer(modifier = Modifier.height(16.dp))
            Card(
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = unlockMessage,
                    modifier = Modifier.padding(16.dp),
                    style = MaterialTheme.typography.bodyLarge
                )
            }
        }
    }
}

@androidx.annotation.OptIn(ExperimentalGetImage::class)
@Composable
fun QrScannerScreen(
    onQrScanned: (String) -> Unit,
    onBackClick: () -> Unit
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    val scannerExecutor = remember { Executors.newSingleThreadExecutor() }
    val scannerOptions: BarcodeScannerOptions = remember {
        BarcodeScannerOptions.Builder()
            .setBarcodeFormats(Barcode.FORMAT_QR_CODE)
            .build()
    }
    val barcodeScanner = remember { BarcodeScanning.getClient(scannerOptions) }
    val scanTriggered = remember { AtomicBoolean(false) }
    var hasCameraPermission by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED
        )
    }
    var previewView by remember { mutableStateOf<PreviewView?>(null) }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { granted ->
        hasCameraPermission = granted
    }

    LaunchedEffect(Unit) {
        if (!hasCameraPermission) {
            permissionLauncher.launch(Manifest.permission.CAMERA)
        }
    }

    DisposableEffect(Unit) {
        onDispose {
            scannerExecutor.shutdown()
            barcodeScanner.close()
        }
    }

    DisposableEffect(previewView, hasCameraPermission) {
        val currentPreviewView = previewView
        if (!hasCameraPermission || currentPreviewView == null) {
            onDispose { }
        } else {
            val cameraProviderFuture = ProcessCameraProvider.getInstance(context)
            val cameraProviderListener = Runnable {
                val cameraProvider = cameraProviderFuture.get()
                val preview = Preview.Builder().build().also {
                    it.setSurfaceProvider(currentPreviewView.surfaceProvider)
                }
                val imageAnalysis = ImageAnalysis.Builder()
                    .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                    .build()

                imageAnalysis.setAnalyzer(scannerExecutor) { imageProxy ->
                    analyzeImageProxy(
                        imageProxy = imageProxy,
                        barcodeScanner = barcodeScanner,
                        onQrDetected = { value ->
                            if (scanTriggered.compareAndSet(false, true)) {
                                onQrScanned(value)
                            }
                        }
                    )
                }

                cameraProvider.unbindAll()
                cameraProvider.bindToLifecycle(
                    lifecycleOwner,
                    CameraSelector.DEFAULT_BACK_CAMERA,
                    preview,
                    imageAnalysis
                )
            }

            cameraProviderFuture.addListener(cameraProviderListener, ContextCompat.getMainExecutor(context))

            onDispose {
                try {
                    cameraProviderFuture.get().unbindAll()
                } catch (_: Exception) {
                    // Camera provider may not have been ready yet.
                }
            }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        TextButton(onClick = onBackClick) {
            Icon(Icons.Filled.ArrowBack, contentDescription = null)
            Text(text = "Back to book")
        }

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = "Point the camera at the QR code on the BookBox.",
            style = MaterialTheme.typography.titleMedium
        )

        Spacer(modifier = Modifier.height(16.dp))

        if (hasCameraPermission) {
            Card(modifier = Modifier.fillMaxSize()) {
                Box(modifier = Modifier.fillMaxSize()) {
                    AndroidView(
                        factory = { viewContext ->
                            PreviewView(viewContext).also { previewView = it }
                        },
                        modifier = Modifier.fillMaxSize()
                    )

                    Text(
                        text = "Scanning QR code...",
                        modifier = Modifier
                            .align(Alignment.BottomCenter)
                            .padding(16.dp),
                        color = MaterialTheme.colorScheme.onPrimaryContainer
                    )
                }
            }
        } else {
            Card(modifier = Modifier.fillMaxSize()) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(16.dp),
                    verticalArrangement = Arrangement.Center,
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Camera permission is needed to scan the QR code.",
                        style = MaterialTheme.typography.bodyLarge
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(onClick = { permissionLauncher.launch(Manifest.permission.CAMERA) }) {
                        Text(text = "Grant camera permission")
                    }
                }
            }
        }
    }
}

@androidx.camera.core.ExperimentalGetImage
private fun analyzeImageProxy(
    imageProxy: ImageProxy,
    barcodeScanner: com.google.mlkit.vision.barcode.BarcodeScanner,
    onQrDetected: (String) -> Unit
) {
    val mediaImage = imageProxy.image
    if (mediaImage == null) {
        imageProxy.close()
        return
    }

    val image = InputImage.fromMediaImage(mediaImage, imageProxy.imageInfo.rotationDegrees)
    barcodeScanner.process(image)
        .addOnSuccessListener { barcodes ->
            barcodes.firstOrNull { it.rawValue != null }?.rawValue?.let(onQrDetected)
        }
        .addOnFailureListener {
            // No-op: keep scanning.
        }
        .addOnCompleteListener {
            imageProxy.close()
        }
}

@Composable
fun MyBooksScreen() {
    val context = LocalContext.current
    Scaffold(
        floatingActionButton = {
            FloatingActionButton(
                containerColor = MaterialTheme.colorScheme.primary,
                onClick = {
                    Toast.makeText(context, "Button clicked", Toast.LENGTH_SHORT).show()
                }
            ) {
                Icon(Icons.Filled.Add, contentDescription = "Add")
            }
        }
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxWidth()
                .padding(innerPadding)
        ) {
            repeat(100) { index ->
                item {
                    Text("Book $index")
                }
            }
        }
    }
}

@Composable
fun ProfileScreen(onNavigate: (AppScreen) -> Unit = {}) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(text = "Profile Screen", style = MaterialTheme.typography.headlineSmall)
        Spacer(modifier = Modifier.height(12.dp))
        Button(onClick = { onNavigate(AppScreen.List) }) {
            Text(text = "Go to book list")
        }
    }
}

fun extractBoxId(qrValue: String): Int? {
    val uri = android.net.Uri.parse(qrValue)

    val rawId = uri.pathSegments.getOrNull(1) ?: return null

    return rawId.trimStart('0').toIntOrNull()
}

suspend fun openBoxAndPlayAudio(
    context: Context,
    boxId: Int
): Boolean = withContext(Dispatchers.IO) {
    try {
        val client = OkHttpClient()

        val json = JSONObject().apply {
            put("boxId", boxId)
            put("qrCodeInfo", "string")
            put("tokenFormat", 5)
            put("addAccessLog", true)
        }

        val body = json.toString()
            .toRequestBody("application/json".toMediaType())

        val request = Request.Builder()
            .url("https://api-d4me-stage.direct4.me/sandbox/v1/Access/openbox")
            .addHeader("Authorization", "Bearer 9ea96945-3a37-4638-a5d4-22e89fbc998f")
            .addHeader("Content-Type", "application/json")
            .post(body)
            .build()

        val response = client.newCall(request).execute()

        if (!response.isSuccessful) {
            return@withContext false
        }

        val responseText = response.body?.string() ?: return@withContext false
        val responseJson = JSONObject(responseText)

        val audioBase64 = responseJson.getString("data")
        val audioBytes = Base64.decode(audioBase64, Base64.DEFAULT)

        val audioFile = File(context.cacheDir, "openbox_audio.mp3")
        audioFile.writeBytes(audioBytes)

        withContext(Dispatchers.Main) {
            val mediaPlayer = MediaPlayer().apply {
                setDataSource(audioFile.absolutePath)
                prepare()
                start()
            }

            mediaPlayer.setOnCompletionListener {
                it.release()
            }
        }

        true
    } catch (e: Exception) {
        e.printStackTrace()
        false
    }
}