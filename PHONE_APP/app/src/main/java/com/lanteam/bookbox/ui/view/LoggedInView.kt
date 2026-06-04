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
import androidx.compose.runtime.LaunchedEffect
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
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.VerticalDivider
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight

@Composable
fun LoggedInView(onNavigate: (AppScreen) -> Unit = {}, userContext: UserContext) {

    var status by remember { mutableStateOf("") }
    val userState = userContext.userState
    LaunchedEffect(Unit) {
        if (userState.username.isBlank() || !userContext.activeBoxId.isNullOrBlank()) {
            userContext.getUserProfile(onResult = { status = it })
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFF211A14),
                        Color(0xFF3E2723)
                    )
                )
            )
            .verticalScroll(rememberScrollState())
            .padding(20.dp)
    ) {
        // Profilna kartica
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 16.dp),
            shape = RoundedCornerShape(14.dp),
            colors = CardDefaults.cardColors(
                containerColor = Color.White.copy(alpha = 0.12f)
            ),
            border = BorderStroke(0.5.dp, Color.White.copy(alpha = 0.18f)),
            elevation = CardDefaults.cardElevation(0.dp)
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Image(
                    painter = painterResource(id = R.drawable.bookbox_mascot),
                    contentDescription = null,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .size(100.dp)
                        .clip(CircleShape)
                )
                Text(
                    text = userState.username,
                    style = MaterialTheme.typography.headlineSmall,
                    color = Color.White,
                    modifier = Modifier.padding(top = 12.dp, bottom = 2.dp)
                )
                Text(
                    text = userState.email,
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color.White.copy(alpha = 0.6f),
                    modifier = Modifier.padding(bottom = 16.dp)
                )

                HorizontalDivider(color = Color.White.copy(alpha = 0.15f))
                Spacer(modifier = Modifier.height(16.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = userState.booksBorrowed.toString(),
                            style = MaterialTheme.typography.headlineMedium,
                            color = Color.White,
                            fontWeight = FontWeight.Medium
                        )
                        Text(
                            text = "Total borrowed",
                            style = MaterialTheme.typography.labelSmall,
                            color = Color.White.copy(alpha = 0.5f)
                        )
                    }
                    VerticalDivider(
                        color = Color.White.copy(alpha = 0.15f),
                        modifier = Modifier.height(48.dp)
                    )
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = userState.currentlyBorrowed.toString(),
                            style = MaterialTheme.typography.headlineMedium,
                            color = Color.White,
                            fontWeight = FontWeight.Medium
                        )
                        Text(
                            text = "Currently borrowed",
                            style = MaterialTheme.typography.labelSmall,
                            color = Color.White.copy(alpha = 0.5f)
                        )
                    }
                }

                if (status.isNotBlank()) {
                    Spacer(modifier = Modifier.height(12.dp))
                    HorizontalDivider(color = Color.White.copy(alpha = 0.15f))
                    Spacer(modifier = Modifier.height(8.dp))
                    val isError = status.contains("Error") || status.contains("Exception")
                    Text(
                        text = status,
                        style = MaterialTheme.typography.bodySmall,
                        color = if (isError) Color(0xFFEF9A9A) else Color(0xFFA5D6A7)
                    )
                }
            }
        }

        // Gumbi
        OutlinedButton(
            onClick = { onNavigate(AppScreen.BorrowHistory) },
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 10.dp),
            shape = RoundedCornerShape(10.dp),
            colors = ButtonDefaults.outlinedButtonColors(
                contentColor = Color.White
            ),
            border = BorderStroke(0.5.dp, Color.White.copy(alpha = 0.3f))
        ) {
            Icon(Icons.Filled.List, contentDescription = null, modifier = Modifier.padding(end = 8.dp))
            Text("View borrow history")
        }

        OutlinedButton(
            onClick = { onNavigate(AppScreen.EditProfile) },
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 10.dp),
            shape = RoundedCornerShape(10.dp),
            colors = ButtonDefaults.outlinedButtonColors(
                contentColor = Color.White
            ),
            border = BorderStroke(0.5.dp, Color.White.copy(alpha = 0.3f))
        ) {
            Icon(Icons.Filled.Settings, contentDescription = null, modifier = Modifier.padding(end = 8.dp))
            Text("Edit profile")
        }

        OutlinedButton(
            onClick = { userContext.logout() },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(10.dp),
            colors = ButtonDefaults.outlinedButtonColors(
                contentColor = Color(0xFFEF9A9A)
            ),
            border = BorderStroke(0.5.dp, Color(0xFFE53935).copy(alpha = 0.35f))
        ) {
            Text("Logout")
        }
    }
}