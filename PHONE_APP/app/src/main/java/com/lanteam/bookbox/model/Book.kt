package com.lanteam.bookbox.model

data class Book (
    val title: String,
    val author: String,
    val summary: String
)

val sampleBooks = listOf(
    Book(
        title = "The Little Prince",
        author = "Antoine de Saint-Exupéry",
        summary = "A timeless story about curiosity, friendship, and what really matters."
    ),
    Book(
        title = "1984",
        author = "George Orwell",
        summary = "A classic dystopian novel about surveillance, control, and freedom."
    ),
    Book(
        title = "The Hobbit",
        author = "J.R.R. Tolkien",
        summary = "A cozy adventure that follows Bilbo Baggins into an unexpected journey."
    )
)