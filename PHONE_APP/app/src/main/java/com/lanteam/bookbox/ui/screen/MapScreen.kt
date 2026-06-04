package com.lanteam.bookbox.ui.screen

import OsmMapView
import android.util.Log
import androidx.compose.foundation.background
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
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

@Composable
fun MapScreen(userContext: UserContext) {
    LaunchedEffect(Unit) {
        if (userContext.packetBoxess.isEmpty()) {
            userContext.fetchPacketBoxes()
        }
    }

    var userLocation = rememberUserLocation()
    userLocation?.let {
        userContext.userLocation = Location(userLocation.latitude, userLocation.longitude)
    }
    userLocation = GeoPoint(46.543749, 15.639577)

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFF211A14), // svetlo rjava zgoraj
                        Color(0xFF3E2723)  // temno rjava spodaj
                    )
                )
            )
            .padding(horizontal = 20.dp)
    ) {
        Text(
            text = "Locations of BookBox packet boxes:",
            style = MaterialTheme.typography.bodyMedium,
            fontWeight = FontWeight.Medium,
            modifier = Modifier.padding(top = 20.dp, bottom = 10.dp)
        )

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
                .padding(bottom = 10.dp)
                .clip(RoundedCornerShape(16.dp))
                .border(
                    width = 5.0.dp,
                    color = MaterialTheme.colorScheme.outlineVariant,
                    shape = RoundedCornerShape(16.dp)
                )
        ) {
            OsmMapView(
                modifier = Modifier.fillMaxSize(),
                packetBoxes = userContext.packetBoxess,
                startLocation = userLocation ?: GeoPoint(46.543749, 15.639577)
            )
        }
    }
}