package com.lanteam.bookbox.ui.screen

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.lanteam.bookbox.ViewModels.UserContext
import com.lanteam.bookbox.model.Borrow
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.TimeZone

fun formatDate(isoDate: String): String {
    return try {
        val parser = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault())
        parser.timeZone = TimeZone.getTimeZone("UTC")
        val date = parser.parse(isoDate)
        val formatter = SimpleDateFormat("dd. MM. yyyy, HH:mm", Locale.getDefault())
        formatter.format(date!!)
    } catch (e: Exception) {
        isoDate // fallback to raw string if parsing fails
    }
}

@Composable
fun BorrowHistoryScreen(userContext: UserContext) {
    LaunchedEffect(Unit) {
        userContext.fetchBorrows()
    }
    Text("Borrow History")

    LazyColumn { //TODO: color the differently
        items(userContext.borrowHistory) { borrow ->
            Card(modifier = Modifier.fillMaxWidth().padding(8.dp)) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(borrow.action.uppercase(), style = MaterialTheme.typography.titleMedium)
                    Text(formatDate(borrow.date))
                    borrow.books.forEach { book ->
                        Text("• ${book.title} by ${book.author}")
                    }
                }
            }
        }
    }
}