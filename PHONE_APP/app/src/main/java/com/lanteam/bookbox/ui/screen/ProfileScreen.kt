package com.lanteam.bookbox.ui.screen


import androidx.compose.runtime.Composable
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
