package com.lanteam.bookbox.ui.screen

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.List
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
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
import com.lanteam.bookbox.ui.view.LoggedInView
import com.lanteam.bookbox.ui.view.NotLoggedInOptions

@Composable
fun ProfileScreen(onNavigate: (AppScreen) -> Unit = {}, userContext: UserContext) {
    if (userContext.loggedIn) {
        LoggedInView(onNavigate, userContext)
    } else {
        NotLoggedInOptions(onNavigate)
    }
}
