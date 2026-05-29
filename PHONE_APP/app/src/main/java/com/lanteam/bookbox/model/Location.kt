package com.lanteam.bookbox.model

import org.osmdroid.util.GeoPoint
import kotlin.math.abs
import kotlin.math.pow
import kotlin.math.sqrt

data class Location (
    var latitude:Double,
    var longitude:Double
) {
    companion object{
        fun getDistanceBetweenLoations(l1: Location, l2: Location):Double{
            return sqrt((l1.latitude - l2.latitude).pow(2) + (l1.longitude - l2.longitude).pow(2))
        }
    }
    fun toGeoPoint(): GeoPoint{
        return GeoPoint(latitude,longitude)
    }
}