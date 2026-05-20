package com.lanteam.bookbox.model

import org.osmdroid.util.GeoPoint

data class Location (
    var latitude:Double,
    var longitude:Double
) {
    fun toGeoPoint(): GeoPoint{
        return GeoPoint(latitude,longitude)
    }
}