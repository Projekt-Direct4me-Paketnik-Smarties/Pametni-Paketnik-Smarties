package com.lanteam.bookbox

import android.app.Application
import android.widget.Toast
import androidx.activity.compose.BackHandler
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.lanteam.bookbox.ViewModels.UserContext
import com.lanteam.bookbox.ui.screen.BorrowHistoryScreen
import com.lanteam.bookbox.ui.screen.CreateBookScreen
import com.lanteam.bookbox.ui.view.BookDetailScreen
import com.lanteam.bookbox.ui.screen.EditProfileScreen
import com.lanteam.bookbox.ui.screen.ListScreen
import com.lanteam.bookbox.ui.screen.LoginScreen
import com.lanteam.bookbox.ui.screen.MapScreen
import com.lanteam.bookbox.ui.screen.MyBooksScreen
import com.lanteam.bookbox.ui.screen.ProfileScreen
import com.lanteam.bookbox.ui.screen.RegisterScreen
import com.lanteam.bookbox.ui.view.ActionSelectionView
import com.lanteam.bookbox.ui.view.LogInImageView
import com.lanteam.bookbox.ui.view.QrScannerView
import com.lanteam.bookbox.utils.extractBoxId
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
    LogIn,
    CreateBook,
    ActionSelection,
    LogInImage
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BookBoxApp() {
    var currentScreen by remember { mutableStateOf(AppScreen.Map) }
    var previousScreen by remember { mutableStateOf(AppScreen.List) }
    val context = LocalContext.current
    val userContext = remember {UserContext(application = context.applicationContext as Application) }
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
            AppScreen.EditProfile, AppScreen.BorrowHistory, AppScreen.LogIn, AppScreen.Register, AppScreen.LogInImage -> AppScreen.Profile
            AppScreen.QrScanner , AppScreen.ActionSelection-> AppScreen.Map
            AppScreen.BookDetail -> AppScreen.List
            AppScreen.CreateBook -> AppScreen.MyBooks
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
                AppScreen.LogInImage ->LogInImageView(userContext,
                    onBackClick = { currentScreen = AppScreen.Profile }

                    )
                AppScreen.CreateBook -> CreateBookScreen(userContext)
                AppScreen.ActionSelection-> ActionSelectionView(
                    userContext
                )
                AppScreen.Map -> MapScreen(userContext)
                AppScreen.List -> ListScreen(
                    userContext,
                    onBookSelected = { book ->
                        userContext.activeBook=book
                        currentScreen = AppScreen.BookDetail
                        previousScreen= AppScreen.List
                    }
                )
                AppScreen.MyBooks -> MyBooksScreen(
                    onNavigate = { currentScreen = it },
                    userContext= userContext,
                    onBookSelected = { book ->
                        userContext.activeBook=book
                        currentScreen = AppScreen.BookDetail
                        previousScreen= AppScreen.MyBooks
                    }
                )
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
                AppScreen.BorrowHistory -> BorrowHistoryScreen(userContext)
                AppScreen.EditProfile -> EditProfileScreen(userContext)
                AppScreen.BookDetail -> BookDetailScreen(
                    userContext= userContext,
                    onBackClick = { currentScreen = previousScreen }
                )
                AppScreen.QrScanner -> QrScannerView(
                    onQrScanned = { scannedValue ->
                        val boxId = extractBoxId(scannedValue)
                        if (boxId == null) {
                            currentScreen = AppScreen.Map
                        } else {
                            userContext.activeBoxId = boxId.toString()
                            currentScreen = AppScreen.ActionSelection
                        }
                    },
                    userContext,
                    onBackClick = { currentScreen = AppScreen.Map }
                )
            }
        }
    }
}