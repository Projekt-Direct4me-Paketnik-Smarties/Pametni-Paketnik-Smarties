package com.lanteam.bookbox.ui.screen

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Book
import androidx.compose.material.icons.filled.Error
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.rememberVectorPainter
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.lanteam.bookbox.AppScreen
import com.lanteam.bookbox.ViewModels.UserContext
import com.lanteam.bookbox.model.Book

@Composable
fun MyBooksScreen(
    onNavigate: (AppScreen) -> Unit = {},
    userContext: UserContext,
    onBookSelected: (Book) -> Unit
) {

    val books=userContext.getMyBooks()
    Scaffold(
        floatingActionButton = {
            FloatingActionButton(
                containerColor = MaterialTheme.colorScheme.primary,
                onClick = {
                    onNavigate(AppScreen.CreateBook)
                }
            ) {
                Icon(Icons.Filled.Add, contentDescription = "Add book")
            }
        }
    ) { innerPadding ->
        LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier.padding(innerPadding)) {
            items(books) { book ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onBookSelected(book) },
                    elevation = CardDefaults.cardElevation(defaultElevation = 3.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp)
                            .background( if(book.status!="available" &&book.status!="owned") MaterialTheme.colorScheme.errorContainer else MaterialTheme.colorScheme.primaryContainer ),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        AsyncImage(
                            model = book.imageUrl,
                            contentDescription = "Book cover",
                            placeholder = rememberVectorPainter(Icons.Filled.Book), //TODO rememberVectorPainter is probobaly quite expensive idk, can replace with actul images
                            error = rememberVectorPainter(Icons.Filled.Error),
                            modifier = Modifier.size(80.dp)
                        )
                        Column(modifier = Modifier.weight(1f)) {
                            Text(book.title, style = MaterialTheme.typography.titleMedium)
                            Text(book.author, style = MaterialTheme.typography.bodyMedium)
                        }
                        if(!book.packetBoxId.isNullOrBlank()){
                            Column(modifier = Modifier.weight(1f)) {
                                Text("add an arrow emoji")
                                Text(book.packetBoxId)
                                Text(book.distance.toString() + "m", style = MaterialTheme.typography.titleMedium)
                            }
                        }
                    }
                }
            }
        }
    }
}