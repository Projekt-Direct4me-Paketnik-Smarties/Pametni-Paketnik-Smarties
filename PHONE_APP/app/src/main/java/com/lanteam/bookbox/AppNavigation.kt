package com.lanteam.bookbox

import android.app.Application
import android.widget.Toast
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.Book
import androidx.compose.material.icons.filled.List
import androidx.compose.material.icons.filled.Map
import androidx.compose.material.icons.filled.QrCodeScanner
import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FabPosition
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarDuration
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.lanteam.bookbox.ViewModels.UserContext
import com.lanteam.bookbox.model.sampleBooks
import com.lanteam.bookbox.ui.screen.BookDetailScreen
import com.lanteam.bookbox.ui.screen.EditProfileScreen
import com.lanteam.bookbox.ui.screen.ListScreen
import com.lanteam.bookbox.ui.screen.LoginScreen
import com.lanteam.bookbox.ui.screen.MapScreen
import com.lanteam.bookbox.ui.screen.MyBooksScreen
import com.lanteam.bookbox.ui.screen.ProfileScreen
import com.lanteam.bookbox.ui.screen.QrScannerScreen
import com.lanteam.bookbox.ui.screen.RegisterScreen
import com.lanteam.bookbox.utils.extractBoxId
import com.lanteam.bookbox.utils.openBoxAndPlayAudio
import kotlinx.coroutines.launch

enum class AppScreen {
    Map,
    List,
    MyBooks,
    Profile,
    BookDetail,
    QrScanner,
    BorrowHistory,
    EditProfile,
    Register,
    LogIn
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BookBoxApp() {
    var currentScreen by remember { mutableStateOf(AppScreen.Map) }
    var selectedBook by remember { mutableStateOf(sampleBooks.first()) }
    var unlockMessage by remember { mutableStateOf<String?>(null) }
    val context = LocalContext.current
    val userContext = remember {UserContext(application = context.applicationContext as Application) }
    val scope = rememberCoroutineScope()
    val snackbarHostState = remember { SnackbarHostState() }

    //this is for errors
    LaunchedEffect(userContext) {
        userContext.errorEvent.collect { message ->
            snackbarHostState.showSnackbar(
                message = message,
                duration = SnackbarDuration.Short
            )
        }
    }
    //this is for redirecting after succesful AIP request
    LaunchedEffect(userContext) {
        userContext.navEvent.collect { destination ->
            currentScreen = destination
        }
    }


    BackHandler(enabled = currentScreen != AppScreen.Map) {
        currentScreen = when (currentScreen) {
            AppScreen.EditProfile, AppScreen.BorrowHistory, AppScreen.LogIn, AppScreen.Register -> AppScreen.Profile
            AppScreen.QrScanner -> AppScreen.Map
            AppScreen.BookDetail -> AppScreen.List
            else -> AppScreen.Map
        }
    }

    val showBottomBar = currentScreen in listOf(
        AppScreen.Map, AppScreen.List, AppScreen.MyBooks, AppScreen.Profile
    )

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        modifier = Modifier.fillMaxSize(),
        topBar = {
            CenterAlignedTopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = "Book",
                            style = MaterialTheme.typography.headlineMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary
                        )
                        Text(
                            text = "Box",
                            style = MaterialTheme.typography.headlineMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.inversePrimary
                        )
                    }
                }
            )
        },
        floatingActionButton = {
            if (showBottomBar) {
                FloatingActionButton(
                    onClick = {
                        unlockMessage = null
                        currentScreen = AppScreen.QrScanner
                    },
                    shape = CircleShape,
                    modifier = Modifier
                        .size(64.dp)
                        .offset(y = 88.dp),
                    containerColor = MaterialTheme.colorScheme.primary,
                    contentColor = MaterialTheme.colorScheme.onPrimary
                ) {
                    Icon(
                        imageVector = Icons.Filled.QrCodeScanner,
                        contentDescription = "Scan QR",
                        modifier = Modifier.size(28.dp)
                    )
                }
            }
        },
        floatingActionButtonPosition = FabPosition.Center,
        bottomBar = {
            if (showBottomBar) {
                NavigationBar {
                    NavigationBarItem(
                        selected = currentScreen == AppScreen.Map,
                        onClick = { currentScreen = AppScreen.Map },
                        icon = {
                            Icon(Icons.Filled.Map, contentDescription = null)
                        },
                        label = { Text(stringResource(R.string.navMap)) }
                    )
                    NavigationBarItem(
                        selected = currentScreen == AppScreen.List,
                        onClick = { currentScreen = AppScreen.List },
                        icon = {
                            Icon(Icons.Filled.List, contentDescription = null)
                        },
                        label = { Text(stringResource(R.string.navList)) }
                    )
                    // Prazen prostor za FAB
                    NavigationBarItem(
                        selected = false,
                        onClick = {},
                        enabled = false,
                        icon = {},
                        label = {}
                    )
                    NavigationBarItem(
                        selected = currentScreen == AppScreen.MyBooks,
                        onClick = { currentScreen = AppScreen.MyBooks },
                        icon = {
                            Icon(Icons.Filled.Book, contentDescription = null)
                        },
                        label = { Text(stringResource(R.string.navMyBooks)) }
                    )
                    NavigationBarItem(
                        selected = currentScreen == AppScreen.Profile,
                        onClick = { currentScreen = AppScreen.Profile },
                        icon = {
                            Icon(Icons.Filled.AccountCircle, contentDescription = null)
                        },
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
                AppScreen.Map -> MapScreen(userContext)
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
                    onNavigate = { currentScreen = it },
                    userContext= userContext
                )
                AppScreen.LogIn -> LoginScreen(
                    onNavigate = { currentScreen = it },
                    userContext= userContext
                    )
                AppScreen.Register -> RegisterScreen(
                    onNavigate = { currentScreen = it },
                    userContext= userContext
                )
                AppScreen.BorrowHistory -> Text("Borrow History Screen")
                AppScreen.EditProfile -> EditProfileScreen(userContext)
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
                            currentScreen = AppScreen.Map
                        } else {
                            unlockMessage = "Odpiram paketnik $boxId..."
                            Toast.makeText(context, "Odpiram paketnik $boxId", Toast.LENGTH_SHORT).show()
                            scope.launch {
                                val success = openBoxAndPlayAudio(context, boxId)
                                unlockMessage = if (success)
                                    "Zvok za paketnik $boxId je bil predvajan."
                                else
                                    "Napaka pri odpiranju paketnika $boxId."
                                currentScreen = AppScreen.Map
                            }
                        }
                    },
                    onBackClick = { currentScreen = AppScreen.Map }
                )
            }
        }
    }
}