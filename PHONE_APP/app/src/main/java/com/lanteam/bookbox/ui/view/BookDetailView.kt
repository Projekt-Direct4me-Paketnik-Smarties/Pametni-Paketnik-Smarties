package com.lanteam.bookbox.ui.view

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Error
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.unit.dp
import com.lanteam.bookbox.model.Book
import androidx.compose.foundation.Image
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material.icons.filled.Book
import androidx.compose.material.icons.filled.Polyline
import androidx.compose.ui.graphics.vector.rememberVectorPainter
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.layout.heightIn
import androidx.compose.material.icons.filled.CheckBox
import androidx.compose.ui.layout.ContentScale
import coil.compose.AsyncImage
import com.lanteam.bookbox.AppScreen
import com.lanteam.bookbox.R
import com.lanteam.bookbox.ViewModels.UserContext
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.sp

@Composable
fun BookDetailScreen(
    userContext: UserContext,
    onBackClick: () -> Unit
) {
    val book = userContext.activeBook!!

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
            .padding(16.dp)
    ) {
        TextButton(onClick = onBackClick) {
            Icon(
                Icons.Filled.ArrowBack,
                contentDescription = null,
                modifier = Modifier.size(18.dp),
                tint = Color.White.copy(alpha = 0.7f)
            )
            Spacer(modifier = Modifier.width(4.dp))
            Text("Return to list", color = Color.White.copy(alpha = 0.7f))
        }

        Spacer(modifier = Modifier.height(8.dp))

        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(14.dp),
            colors = CardDefaults.cardColors(
                containerColor = Color.White.copy(alpha = 0.12f)
            ),
            border = BorderStroke(0.5.dp, Color.White.copy(alpha = 0.18f)),
            elevation = CardDefaults.cardElevation(0.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {

                AsyncImage(
                    model = book.imageUrl,
                    contentDescription = "Book cover",
                    placeholder = rememberVectorPainter(Icons.Filled.Book),
                    error = rememberVectorPainter(Icons.Filled.Error),
                    contentScale = ContentScale.Fit,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(200.dp)
                        .clip(RoundedCornerShape(8.dp))
                )

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = book.title,
                    style = MaterialTheme.typography.headlineSmall,
                    color = Color.White
                )
                Text(
                    text = book.author,
                    style = MaterialTheme.typography.bodyLarge,
                    fontStyle = FontStyle.Italic,
                    color = Color.White.copy(alpha = 0.65f),
                    modifier = Modifier.padding(bottom = 12.dp)
                )

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.padding(bottom = 8.dp)
                ) {
                    Icon(
                        Icons.Filled.CheckBox,
                        contentDescription = null,
                        tint = Color.White.copy(alpha = 0.5f),
                        modifier = Modifier.size(16.dp)
                    )
                    val isAvailable = book.status == "available"
                    Surface(
                        shape = RoundedCornerShape(20.dp),
                        color = if (isAvailable)
                            Color(0xFF4CAF50).copy(alpha = 0.25f)
                        else
                            Color(0xFFE53935).copy(alpha = 0.25f)
                    ) {
                        Text(
                            text = book.status,
                            style = MaterialTheme.typography.labelSmall,
                            color = if (isAvailable) Color(0xFFA5D6A7) else Color(0xFFEF9A9A),
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 2.dp)
                        )
                    }
                }

                if (!book.packetBoxId.isNullOrBlank()) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.padding(bottom = 8.dp)
                    ) {
                        Icon(
                            Icons.Filled.Polyline,
                            contentDescription = null,
                            tint = Color.White.copy(alpha = 0.5f),
                            modifier = Modifier.size(16.dp)
                        )
                        Text(
                            text = "Box #${book.packetBoxId} · ${book.distance} m away",
                            style = MaterialTheme.typography.bodyMedium,
                            color = Color.White.copy(alpha = 0.75f)
                        )
                    }
                }

                HorizontalDivider(
                    color = Color.White.copy(alpha = 0.15f),
                    modifier = Modifier.padding(vertical = 12.dp)
                )

                Text(
                    text = "SUMMARY",
                    style = MaterialTheme.typography.labelSmall,
                    color = Color.White.copy(alpha = 0.5f),
                    letterSpacing = 0.08.sp,
                    modifier = Modifier.padding(bottom = 6.dp)
                )

                val scrollState = rememberScrollState()
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(max = 200.dp)
                        .verticalScroll(scrollState)
                ) {
                    Text(
                        text = book.summary,
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color.White.copy(alpha = 0.75f),
                        lineHeight = MaterialTheme.typography.bodyMedium.lineHeight
                    )
                }
            }
        }

        if (book.status == "owned" && book.owner == userContext.userId) {
            Spacer(modifier = Modifier.height(16.dp))
            OutlinedButton(
                onClick = { userContext.removeBook() },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.outlinedButtonColors(
                    contentColor = Color(0xFFEF9A9A)
                ),
                border = BorderStroke(0.5.dp, Color(0xFFE53935).copy(alpha = 0.35f))
            ) {
                Text("Remove book from database")
            }
        }
    }
}