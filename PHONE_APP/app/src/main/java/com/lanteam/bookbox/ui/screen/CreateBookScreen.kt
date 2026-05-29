package com.lanteam.bookbox.ui.screen

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.runtime.Composable
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.lanteam.bookbox.ViewModels.UserContext

@Composable
fun CreateBookScreen(userContext: UserContext){
    var status by remember { mutableStateOf("") }
    var title by remember { mutableStateOf("") }
    var author by remember { mutableStateOf("") }
    var genre by remember { mutableStateOf("") }
    var glossary by remember { mutableStateOf("") }
    var weight by remember { mutableStateOf("") }
    var imageUri by remember { mutableStateOf<Uri?>(null) }

    val launcher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? -> imageUri = uri }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
    OutlinedTextField(value = title, onValueChange = { title = it }, label = { Text("Title") })
    OutlinedTextField(value = author, onValueChange = { author = it }, label = { Text("Author") })
    OutlinedTextField(value = genre, onValueChange = { genre = it }, label = { Text("Genre") })
    OutlinedTextField(value = glossary, onValueChange = { glossary = it }, label = { Text("Glossary") })
    OutlinedTextField(value = weight, onValueChange = { weight = it }, label = { Text("Weight") },
        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
    )

    Button(onClick = { launcher.launch("image/*") }) {
        Text(if (imageUri != null) "Image selected ✓" else "Pick Image")
    }

    Button(onClick = {
        userContext.addBook(title, author, genre, glossary, weight, imageUri) { status=it}
    }) {
        Text("Add Book")
    }
    Text(
        text = status,
        modifier = Modifier.padding(top = 16.dp),
        style = MaterialTheme.typography.bodyMedium,
        color = if (status.contains("Error") || status.contains("Exception")) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary
    )
    }
}