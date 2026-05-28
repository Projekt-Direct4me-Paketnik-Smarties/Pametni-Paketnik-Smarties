package com.lanteam.bookbox.model


data class User(
    val username: String="",
    val email:String="",
    val booksBorrowed: Int=0,
    val currentlyBorrowed:Int=0
)