package com.lanteam.bookbox.ui.view

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.QrCode
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.lanteam.bookbox.AppScreen

@Composable
fun NotLoggedInOptions(onNavigate: (AppScreen) -> Unit = {}){

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
        Text("Please log in or register", modifier = Modifier.padding(bottom = 24.dp))
        Button(onClick = { onNavigate(AppScreen.LogIn)}) {
            Text("Login")
        }
        Button(onClick = { onNavigate(AppScreen.LogInImage)}) {
            Text("Login")
            Icon(
                Icons.Filled.Image,
                contentDescription = null,
                modifier = Modifier
                    .fillMaxWidth(0.3f)
                    .aspectRatio(1f),
                tint = MaterialTheme.colorScheme.background
            )
        }
        Button(onClick = { onNavigate(AppScreen.Register)}) {
            Text("Register")
        }
    }
}