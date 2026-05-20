package com.lanteam.bookbox

import android.widget.Toast
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import com.lanteam.bookbox.model.sampleBooks
import com.lanteam.bookbox.ui.screen.BookDetailScreen
import com.lanteam.bookbox.ui.screen.ListScreen
import com.lanteam.bookbox.ui.screen.MapScreen
import com.lanteam.bookbox.ui.screen.MyBooksScreen
import com.lanteam.bookbox.ui.screen.ProfileScreen
import com.lanteam.bookbox.ui.screen.QrScannerScreen
import com.lanteam.bookbox.utils.extractBoxId
import com.lanteam.bookbox.utils.openBoxAndPlayAudio
import kotlinx.coroutines.launch
import lanteam.bookbox.R


enum class AppScreen {
    Map,
    List,
    MyBooks,
    Profile,
    BookDetail,
    QrScanner
}

@OptIn(ExperimentalMaterial3Api::class)

@Composable
fun BookBoxApp() {
    var currentScreen by remember { mutableStateOf(AppScreen.Map) }
    var selectedBook by remember { mutableStateOf(sampleBooks.first()) }
    var unlockMessage by remember { mutableStateOf<String?>(null) }
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    val showBottomBar = currentScreen in listOf(
        AppScreen.Map, AppScreen.List, AppScreen.MyBooks, AppScreen.Profile
    )

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text(text = stringResource(R.string.app_name)) }
            )
        },
        bottomBar = {
            if (showBottomBar) {
                NavigationBar {
                    NavigationBarItem(
                        selected = currentScreen == AppScreen.Map,
                        onClick = { currentScreen = AppScreen.Map },
                        icon = {},
                        label = { Text(stringResource(R.string.navMap)) }
                    )
                    NavigationBarItem(
                        selected = currentScreen == AppScreen.List,
                        onClick = { currentScreen = AppScreen.List },
                        icon = {},
                        label = { Text(stringResource(R.string.navList)) }
                    )
                    NavigationBarItem(
                        selected = currentScreen == AppScreen.MyBooks,
                        onClick = { currentScreen = AppScreen.MyBooks },
                        icon = {},
                        label = { Text(stringResource(R.string.navMyBooks)) }
                    )
                    NavigationBarItem(
                        selected = currentScreen == AppScreen.Profile,
                        onClick = { currentScreen = AppScreen.Profile },
                        icon = {},
                        label = { Text(stringResource(R.string.navProfile)) }
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
                AppScreen.Profile -> ProfileScreen(
                    onNavigate = { currentScreen = it }
                )
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
                            Toast.makeText(context, "Odpiram paketnik $boxId", Toast.LENGTH_SHORT)
                                .show()
                            scope.launch {
                                val success = openBoxAndPlayAudio(context, boxId)
                                unlockMessage = if (success)
                                    "Zvok za paketnik $boxId je bil predvajan."
                                else
                                    "Napaka pri odpiranju paketnika $boxId."
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