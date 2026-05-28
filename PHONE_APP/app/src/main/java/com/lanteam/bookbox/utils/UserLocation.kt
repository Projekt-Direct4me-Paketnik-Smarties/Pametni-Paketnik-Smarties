package com.lanteam.bookbox.utils

import android.Manifest
import android.annotation.SuppressLint
import android.util.Log
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.getValue
import androidx.compose.ui.platform.LocalContext
import com.google.android.gms.location.LocationServices
import org.osmdroid.util.GeoPoint

@SuppressLint("MissingPermission")
@Composable
fun rememberUserLocation(): GeoPoint? {
    val context = LocalContext.current
    var location by remember { mutableStateOf<GeoPoint?>(null) } // its mutable, since if changed (by permission granted) the map should recenter

    val launcher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted ->
        if (granted) {
            Log.i("Location debug", "Permission granted")
            val client = LocationServices.getFusedLocationProviderClient(context)
            client.lastLocation.addOnSuccessListener { loc ->
                loc?.let { location = GeoPoint(it.latitude, it.longitude)
                    Log.i("Location debug", "Cooridinates: lat: ${it.latitude}, long: ${it.longitude}") }
            }
        }
    }

    LaunchedEffect(Unit){  // runs once when function first called
        launcher.launch(Manifest.permission.ACCESS_FINE_LOCATION) //triggers system permission popup
    }

    return location
}