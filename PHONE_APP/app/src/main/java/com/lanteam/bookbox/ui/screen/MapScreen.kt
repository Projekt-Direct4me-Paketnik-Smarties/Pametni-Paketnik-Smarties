package com.lanteam.bookbox.ui.screen

import OsmMapView
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import com.lanteam.bookbox.model.Location
import com.lanteam.bookbox.model.PacketBox

@Composable
fun MapScreen() {
    val packetBoxes = listOf<PacketBox>(
        PacketBox("Box1", Location(16.4001, 16.5001)),
        PacketBox("Box2", Location(16.4002, 16.5002)),
        PacketBox("Box3", Location(16.4003, 16.50003))
    )

    OsmMapView(
        modifier = Modifier.fillMaxSize(),
        packetBoxes = packetBoxes,
        startLocation = Location(16.4, 16.5)
    )
}