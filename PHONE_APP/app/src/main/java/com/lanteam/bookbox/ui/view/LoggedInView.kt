package com.lanteam.bookbox.ui.view

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.List
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import com.lanteam.bookbox.AppScreen
import com.lanteam.bookbox.R
import com.lanteam.bookbox.ViewModels.UserContext
import com.lanteam.bookbox.model.User

@Composable
fun LoggedInView(onNavigate: (AppScreen) -> Unit = {}, userContext: UserContext){

    var status by remember { mutableStateOf("") }
    val userState = userContext.userState
    if(userState.username.isBlank())
    userContext.getUserProfile(onResult = {status=it})

    Column(
    modifier = Modifier
    .verticalScroll(rememberScrollState())
    .fillMaxSize()
    .padding(16.dp)
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 16.dp)
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Image(
                    painter = painterResource(id = R.drawable.bookbox_mascot), //marker je PLACEHOLDER za PFP
                    contentDescription = null,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .size(200.dp)
                        .clip(CircleShape)
                )
                Text(
                    text = userState.username,
                    style = MaterialTheme.typography.headlineSmall,
                    modifier = Modifier.padding(top = 16.dp, bottom = 4.dp)
                )
                Text(
                    text =  userState.email,
                    style = MaterialTheme.typography.bodyMedium,
                    modifier = Modifier.padding(bottom = 12.dp)
                )
                HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
                Text(text = "books borrowed: "+ userState.booksBorrowed.toString())
                Text(text = "currently borrowed books: "+userState.currentlyBorrowed.toString())
                if(status!=""){
                HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
                Text(
                    text = status,
                    modifier = Modifier.padding(top = 16.dp),
                    style = MaterialTheme.typography.bodyMedium,
                    color = if (status.contains("Error") || status.contains("Exception")) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary
                )
                }
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
            onClick = { userContext.logout() },
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(
                containerColor = MaterialTheme.colorScheme.error
            )
        ) {
            Text("Logout")
        }
    }
}