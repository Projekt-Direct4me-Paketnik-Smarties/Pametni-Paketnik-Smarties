package lanteam.bookbox

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.getValue
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.Alignment
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
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
                title = { Text(text = "@string/app_name") }
            )
        },
        bottomBar = {
            NavigationBar {
                NavigationBarItem(
                    selected = currentScreen == AppScreen.Map,
                    onClick = { currentScreen = AppScreen.Map },
                    icon = {},
                    label = { Text("@string/navMap") }
                )
                NavigationBarItem(
                    selected = currentScreen == AppScreen.List,
                    onClick = { currentScreen = AppScreen.List },
                    icon = {},
                    label = { Text("@string/navList") }
                )
                NavigationBarItem(
                    selected = currentScreen == AppScreen.MyBooks,
                    onClick = { currentScreen = AppScreen.MyBooks },
                    icon = {},
                    label = { Text("@string/navMyBooks") }
                )
                NavigationBarItem(
                    selected = currentScreen == AppScreen.Profile,
                    onClick = { currentScreen = AppScreen.Profile },
                    icon = {},
                    label = { Text("@string/navProfile") }
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
                AppScreen.Map -> Text("Map Screen")

                AppScreen.List -> Text("List Screen")

                AppScreen.MyBooks -> Text("My Books Screen")

                AppScreen.Profile -> Text("Profile Screen")
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