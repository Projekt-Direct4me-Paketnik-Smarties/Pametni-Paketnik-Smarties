package lanteam.bookbox

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import lanteam.bookbox.ui.theme.MyApplicationTheme

enum class AppScreen {
    Map,
    List,
    MyBooks,
    Profile
}

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

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text(text = stringResource(R.string.app_name)) }
            )
        },
        bottomBar = {
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
                    label = { Text(text = stringResource(R.string.navList))}
                )
                NavigationBarItem(
                    selected = currentScreen == AppScreen.MyBooks,
                    onClick = { currentScreen = AppScreen.MyBooks },
                    icon = {},
                    label = { Text(text = stringResource(R.string.navMyBooks))}
                )
                NavigationBarItem(
                    selected = currentScreen == AppScreen.Profile,
                    onClick = { currentScreen = AppScreen.Profile },
                    icon = {},
                    label = { Text(text = stringResource(R.string.navProfile)) }
                )
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
                AppScreen.List -> ListScreen()
                AppScreen.MyBooks -> MyBooksScreen()
                AppScreen.Profile -> ProfileScreen()
            }
        }
    }
}


@Preview(showBackground = true)
@Composable
fun BookBoxAppPreview() {
    MyApplicationTheme {
        BookBoxApp()
    }
}

@Composable
fun MapScreen() {
    Text("Map Screen")
}

@Composable
fun ListScreen() {
    Text("List Screen")
}

@Composable
fun MyBooksScreen() {
    Text("List Screen")
}

@Composable
fun ProfileScreen() {
    Text("Profile Screen")
}