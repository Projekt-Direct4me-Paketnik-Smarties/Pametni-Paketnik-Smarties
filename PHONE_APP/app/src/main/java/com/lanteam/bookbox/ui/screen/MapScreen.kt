package com.lanteam.bookbox.ui.screen

import OsmMapView
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.lanteam.bookbox.model.Location
import com.lanteam.bookbox.model.PacketBox
import com.lanteam.bookbox.utils.rememberUserLocation
import org.osmdroid.util.GeoPoint
import kotlin.random.Random

@Composable
fun MapScreen() {
    val userLocation = rememberUserLocation()
    val packetBoxes = listOf<PacketBox>(
        PacketBox("Box1",  Location( userLocation?.latitude?: 46.0, userLocation?.longitude?:14.5)),
        PacketBox("Box2", Location(userLocation?.latitude?:46.001, userLocation?.longitude?:14.502)),
        PacketBox("Box3", Location(userLocation?.latitude?:46.002, userLocation?.longitude?:14.501))
    )
    packetBoxes.forEach { it.location.latitude+= Random.nextDouble(-0.005,0.005)
        it.location.longitude+=Random.nextDouble(-0.005,0.005)
    }
    //testing rn
    OsmMapView(
        modifier = Modifier.fillMaxSize(),
        packetBoxes = packetBoxes,
        startLocation = userLocation ?: GeoPoint(46.0, 14.5) //should be ljubljana
    )
}