package com.lanteam.bookbox.model

data class Borrow(
    val packetBox:String,
    val date:String,
    val books:List<Book>,
    val action:String
)