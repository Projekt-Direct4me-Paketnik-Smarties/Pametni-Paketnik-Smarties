package com.lanteam.bookbox.model

import android.location.Location as ALocation
import org.osmdroid.util.GeoPoint

data class Location (
    var latitude:Double,
    var longitude:Double
) {
    companion object{
        fun getDistanceBetweenLoations(l1: Location, l2: Location):Float{
            val results = FloatArray(1)
            ALocation.distanceBetween(
                l1.latitude, l1.longitude,
                l2.latitude, l2.longitude,
                results
            )
            return results[0]
        }
    }
    fun toGeoPoint(): GeoPoint{
        return GeoPoint(latitude,longitude)
    }
}