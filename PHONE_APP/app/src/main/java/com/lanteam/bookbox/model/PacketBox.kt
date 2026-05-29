package com.lanteam.bookbox.model

data class PacketBox(
  val id:String="",
  val name:String,
  val location: Location,
  val bookIds: List<String> = listOf<String>(),
  val books:List<Book> = listOf<Book>()
) {}

