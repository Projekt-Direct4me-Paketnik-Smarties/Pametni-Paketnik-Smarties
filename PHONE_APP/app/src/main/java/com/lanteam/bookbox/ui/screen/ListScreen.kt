package com.lanteam.bookbox.ui.screen

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Book
import androidx.compose.material.icons.filled.Error
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.rememberVectorPainter
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.lanteam.bookbox.ViewModels.UserContext
import com.lanteam.bookbox.model.Book
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Surface
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextOverflow

@Composable
fun ListScreen(
    userContext: UserContext,
    onBookSelected: (Book) -> Unit
) {
    LaunchedEffect(Unit) {
        if (userContext.bookss.isEmpty()) {
            userContext.fetchBooks()
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFF211A14),
                        Color(0xFF3E2723)
                    )
                )
            )
            .padding(horizontal = 20.dp)
    ) {
        Text(
            "All books",
            style = MaterialTheme.typography.headlineSmall,
            color = Color.White,
            modifier = Modifier.padding(top = 20.dp, bottom = 2.dp)
        )
        Text(
            "Tap a book to see details.",
            style = MaterialTheme.typography.bodyMedium,
            color = Color.White.copy(alpha = 0.6f),
            modifier = Modifier.padding(bottom = 16.dp)
        )

        LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            items(userContext.bookss) { book ->
                val isAvailable = book.status == "available"
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onBookSelected(book) },
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = if (isAvailable)
                            Color.White.copy(alpha = 0.12f)
                        else
                            Color(0xFFB43220).copy(alpha = 0.22f)
                    ),
                    border = BorderStroke(
                        0.5.dp,
                        if (isAvailable)
                            Color.White.copy(alpha = 0.18f)
                        else
                            Color(0xFFFF7864).copy(alpha = 0.3f)
                    ),
                    elevation = CardDefaults.cardElevation(0.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        AsyncImage(
                            model = book.imageUrl,
                            contentDescription = "Book cover",
                            placeholder = rememberVectorPainter(Icons.Filled.Book),
                            error = rememberVectorPainter(Icons.Filled.Error),
                            modifier = Modifier
                                .size(56.dp, 72.dp)
                                .clip(RoundedCornerShape(6.dp))
                        )
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                book.title,
                                style = MaterialTheme.typography.titleSmall,
                                color = Color.White,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                            Text(
                                book.author,
                                style = MaterialTheme.typography.bodySmall,
                                color = Color.White.copy(alpha = 0.6f),
                                modifier = Modifier.padding(bottom = 6.dp)
                            )
                            Surface(
                                shape = RoundedCornerShape(20.dp),
                                color = if (isAvailable)
                                    Color(0xFF4CAF50).copy(alpha = 0.25f)
                                else
                                    Color(0xFFE53935).copy(alpha = 0.25f)
                            ) {
                                Text(
                                    text = if (isAvailable) "Available" else "Borrowed",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = if (isAvailable) Color(0xFFA5D6A7) else Color(0xFFEF9A9A),
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                                )
                            }
                        }
                        if (!book.packetBoxId.isNullOrBlank()) {
                            Column(horizontalAlignment = Alignment.End) {
                                Text(
                                    "Box #${book.packetBoxId}",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = Color.White.copy(alpha = 0.5f)
                                )
                                Text(
                                    "${book.distance} m",
                                    style = MaterialTheme.typography.titleSmall,
                                    color = Color.White
                                )
                                Text(
                                    "→",
                                    color = Color.White.copy(alpha = 0.4f)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}