package com.lanteam.bookbox.model

data class Book (
    val id: String ="",
    val title: String,
    val author: String,
    val summary: String,
    val imageUrl: String ="",
    val genre: String ="",
    val status: String ="available", //maybe bool?
    val weight: Int =5,
    val packetBoxId: String? =null,
    var distance: Float?=null,
    val owner:String="",
    val currentBorrower:String?=null
)