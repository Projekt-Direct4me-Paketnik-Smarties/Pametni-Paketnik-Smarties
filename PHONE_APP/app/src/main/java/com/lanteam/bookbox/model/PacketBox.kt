package com.lanteam.bookbox.model

data class PacketBox(
  val name:String,
  val location: Location,
  val books:List<Book> = listOf<Book>()
) {}

