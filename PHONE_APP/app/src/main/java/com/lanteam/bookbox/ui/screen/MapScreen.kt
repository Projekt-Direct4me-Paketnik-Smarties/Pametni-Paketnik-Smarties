package com.lanteam.bookbox.ui.screen

import OsmMapView
import android.util.Log
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.lanteam.bookbox.ViewModels.UserContext
import com.lanteam.bookbox.model.Location
import com.lanteam.bookbox.model.PacketBox
import com.lanteam.bookbox.utils.rememberUserLocation
import org.osmdroid.util.GeoPoint
import kotlin.random.Random

@Composable
fun MapScreen(userContext: UserContext) {
    LaunchedEffect(Unit) {
        if (userContext.packetBoxess.isEmpty()) {
            userContext.fetchPacketBoxes()
        }
    }

    var userLocation = rememberUserLocation()
    userLocation?.let{
        userContext.userLocation=Location(userLocation.latitude, userLocation.longitude)
    }
    //temporary testing, change this for when in maribor
    userLocation = GeoPoint(46.543749, 15.639577)
    OsmMapView(
        modifier = Modifier.fillMaxSize(),
        packetBoxes = userContext.packetBoxess,
        startLocation = userLocation ?: GeoPoint(46.543749, 15.639577) //should be Maribor
    )
}