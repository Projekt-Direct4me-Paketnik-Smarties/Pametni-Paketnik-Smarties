package com.lanteam.bookbox

import android.app.Application
import android.preference.PreferenceManager
import org.osmdroid.config.Configuration

class MyApp : Application() { // if loading anything that works with the map, initialize it here
    override fun onCreate() {
        super.onCreate()
        Configuration.getInstance().apply {
            load(this@MyApp, PreferenceManager.getDefaultSharedPreferences(this@MyApp))
            userAgentValue = packageName // required by OSM tile policy
        }
    }
}