package com.lanteam.bookbox.ui.screen

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Error
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.QrCodeScanner
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ModifierLocalBeyondBoundsLayout
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.unit.dp
import com.lanteam.bookbox.model.Book
import androidx.compose.foundation.Image
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import com.lanteam.bookbox.R

@Composable
fun BookDetailScreen(
    book: Book,
    unlockMessage: String?,
    onUnlockClick: () -> Unit,
    onBackClick: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        TextButton(onClick = onBackClick) {
            Icon(
                Icons.Filled.ArrowBack,
                contentDescription = null,
                modifier = Modifier.size(18.dp)
            )
            Spacer(
                modifier = Modifier.width(4.dp)
            )
            Text("Return to list")
        }

        Spacer(modifier = Modifier.height(16.dp))

        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surfaceVariant
            )
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Filled.MenuBook,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier
                            .size(36.dp)
                            .padding(end = 8.dp)
                    )
                    // book title
                    Text(
                        text = book.title,
                        style = MaterialTheme.typography.headlineSmall,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                // book author
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Filled.Person,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.secondary,
                        modifier = Modifier
                            .size(18.dp)
                            .padding(end = 4.dp)
                    )
                    Text(
                        text = book.author,
                        style = MaterialTheme.typography.bodyLarge,
                        fontStyle = FontStyle.Italic,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))
                HorizontalDivider()
                Spacer(modifier = Modifier.height(16.dp))

                // book summary
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Filled.Description,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.secondary,
                        modifier = Modifier
                            .size(18.dp)
                            .padding(end = 4.dp)
                    )

                    Text(
                        text = "Summary:",
                        style = MaterialTheme.typography.bodyMedium,
                        fontStyle = FontStyle.Italic,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        lineHeight = MaterialTheme.typography.bodyMedium.lineHeight
                    )
                }
                Text(
                    text = book.summary,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    lineHeight = MaterialTheme.typography.bodyMedium.lineHeight
                )

                HorizontalDivider()
                Spacer(modifier = Modifier.height(16.dp))

                Image(
                    painter = painterResource(id = R.drawable.marker),
                    contentDescription = "Book cover",
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(250.dp)
                        .clip(RoundedCornerShape(8.dp)),
                    contentScale = ContentScale.Crop
                )

                Spacer(modifier = Modifier.height(16.dp))
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        if (unlockMessage != null) {
            Spacer(modifier = Modifier.height(16.dp))

            val isError = unlockMessage.startsWith("Napaka") || unlockMessage.startsWith("Neveljaven")

            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(
                    containerColor = if (isError)
                        MaterialTheme.colorScheme.errorContainer
                    else
                        MaterialTheme.colorScheme.primaryContainer
                )
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = if (isError) Icons.Filled.Error else Icons.Filled.CheckCircle,
                        contentDescription = null,
                        tint = if (isError)
                            MaterialTheme.colorScheme.error
                        else
                            MaterialTheme.colorScheme.primary,
                        modifier = Modifier
                            .size(20.dp)
                            .padding(end = 4.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = unlockMessage,
                        style = MaterialTheme.typography.bodyLarge,
                        color = if (isError)
                            MaterialTheme.colorScheme.onErrorContainer
                        else
                            MaterialTheme.colorScheme.onPrimaryContainer
                    )
                }
            }
        }
    }
}