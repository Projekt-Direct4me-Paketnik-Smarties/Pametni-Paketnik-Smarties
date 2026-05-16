package lanteam.bookbox

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.List
import androidx.compose.material.icons.filled.Place
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.Divider
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import lanteam.bookbox.ui.theme.MyApplicationTheme

enum class AppScreen {
    Map,
    List,
    MyBooks,
    Profile,
    Settings,
    BorrowHistory,
    EditProfile
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
                title = { Text(stringResource(R.string.app_name)) },
                actions = {
                    IconButton(onClick = { currentScreen = AppScreen.Settings }) {
                        Icon(Icons.Filled.Settings, contentDescription = stringResource(R.string.navMap))
                    }
                }
            )
        },
        bottomBar = {
            NavigationBar {
                NavigationBarItem(
                    selected = currentScreen == AppScreen.Map,
                    onClick = { currentScreen = AppScreen.Map },
                    icon = { Icon(Icons.Filled.Place, contentDescription = stringResource(R.string.navMap)) },
                    label = { Text(text = stringResource(R.string.navMap)) }
                )
                NavigationBarItem(
                    selected = currentScreen == AppScreen.List,
                    onClick = { currentScreen = AppScreen.List },
                    icon = { Icon(Icons.Filled.List, contentDescription = stringResource(R.string.navMap)) },
                    label = { Text(text = stringResource(R.string.navList))}
                )
                NavigationBarItem(
                    selected = currentScreen == AppScreen.MyBooks,
                    onClick = { currentScreen = AppScreen.MyBooks },
                    icon = { Icon(Icons.Filled.List, contentDescription = stringResource(R.string.navMap)) },
                    label = { Text(text = stringResource(R.string.navMyBooks))}
                )
                NavigationBarItem(
                    selected = currentScreen == AppScreen.Profile,
                    onClick = { currentScreen = AppScreen.Profile },
                    icon =  {Icon(Icons.Filled.AccountCircle, contentDescription = stringResource(R.string.navMap)) },
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
                AppScreen.Profile -> ProfileScreen(onNavigate = { currentScreen = it })
                AppScreen.Settings -> SettingsScreen()
                AppScreen.BorrowHistory -> BorrowHistoryScreen()
                AppScreen.EditProfile -> EditProfileScreen()
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
fun ProfileScreen(onNavigate: (AppScreen) -> Unit = {}) {
    var isLoggedIn by remember { mutableStateOf(true) }

    if (isLoggedIn) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
        ) {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 16.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "John Reader",
                        style = MaterialTheme.typography.headlineSmall,
                        modifier = Modifier.padding(bottom = 4.dp)
                    )
                    Text(
                        text = "john.reader@example.com",
                        style = MaterialTheme.typography.bodyMedium,
                        modifier = Modifier.padding(bottom = 12.dp)
                    )
                    Divider(modifier = Modifier.padding(vertical = 8.dp))
                    Text(text = "Member since: Jan 2024", modifier = Modifier.padding(top = 8.dp))
                    Text(text = "Member Tier: Gold")
                    Text(text = "Books borrowed: 27")
                    Text(text = "Currently borrowed: 2")
                    Text(text = "Books returned on time: 25/27")
                }
            }

            Button(
                onClick = { onNavigate(AppScreen.BorrowHistory) },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 12.dp)
            ) {
                Icon(Icons.Filled.List, contentDescription = null, modifier = Modifier.padding(end = 8.dp))
                Text("View Borrow History")
            }

            Button(
                onClick = { onNavigate(AppScreen.EditProfile) },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 12.dp)
            ) {
                Icon(Icons.Filled.Settings, contentDescription = null, modifier = Modifier.padding(end = 8.dp))
                Text("Edit Profile")
            }

            Button(
                onClick = { /* perform logout logic */ },
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.error
                )
            ) {
                Text("Logout")
            }
        }
    } else {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                Icons.Filled.AccountCircle,
                contentDescription = null,
                modifier = Modifier
                    .fillMaxWidth(0.3f)
                    .aspectRatio(1f),
                tint = MaterialTheme.colorScheme.primary
            )
            Text(
                text = "Not logged in",
                style = MaterialTheme.typography.headlineSmall,
                modifier = Modifier.padding(top = 16.dp, bottom = 8.dp)
            )
            Text("Please log in to view your profile", modifier = Modifier.padding(bottom = 24.dp))
            Button(onClick = { isLoggedIn = true }) {
                Text("Login")
            }
        }
    }
}

@Composable
fun SettingsScreen() {
    Text("Settings Screen")
}

@Composable
fun EditProfileScreen() {
    Text("Edit Profile Screen")
}


@Composable
fun BorrowHistoryScreen() {
    Text("Borrow History Screen")
}