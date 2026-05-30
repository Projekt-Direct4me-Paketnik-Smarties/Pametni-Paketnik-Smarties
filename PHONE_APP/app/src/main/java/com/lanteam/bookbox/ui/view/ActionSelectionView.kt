package com.lanteam.bookbox.ui.view

import android.util.Log
import androidx.compose.runtime.Composable
import com.lanteam.bookbox.ViewModels.BoxAction
import com.lanteam.bookbox.ViewModels.UserContext

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Checkbox
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.lanteam.bookbox.model.Book

@Composable
fun ActionSelectionView(
    userContext: UserContext
){
    var selectedAction by remember { mutableStateOf(BoxAction.BORROW) }
    var selectedBookIds by remember { mutableStateOf<List<String>>(emptyList()) }
    var status by remember { mutableStateOf("") }
    var books by remember {
        mutableStateOf(userContext.getBorrowBooks())
    }
    fun onResult(str:String){
        status=str
    }

    fun selectAction(action: BoxAction) {
        selectedBookIds = emptyList()

        books = when (action) {
            BoxAction.BORROW -> userContext.getBorrowBooks()
            BoxAction.REPOSSESS -> userContext.getReposesBooks()
            BoxAction.DONATE -> userContext.getDonateBooks()
            BoxAction.RETURN -> userContext.getReturnBooks()
        }
    }
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Box #${userContext.activeBoxId}", style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(16.dp))

        // Action selector
        Text("Action", style = MaterialTheme.typography.titleMedium)
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            BoxAction.entries.forEach { action ->
                FilterChip(
                    selected = selectedAction == action,
                    onClick = {
                        selectedAction = action
                        selectAction(action)
                    },
                    label = { Text(action.name) }
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Book selector
        Text("Select Books", style = MaterialTheme.typography.titleMedium)
        books.forEach { book ->
            Row(verticalAlignment = Alignment.CenterVertically) {
                Checkbox(
                    checked = book.id in selectedBookIds,
                    onCheckedChange = { checked ->
                        selectedBookIds = if (checked)
                            selectedBookIds + book.id
                        else
                            selectedBookIds - book.id
                    }
                )
                Text(book.title)
            }
        }

        Spacer(modifier = Modifier.weight(1f))

        Button(
            onClick = {
                if (selectedBookIds.isEmpty()) {
                    onResult("Select at least one book")
                } else {
                    userContext.performBoxAction(selectedAction, selectedBookIds, onResult={status=it})
                }
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Confirm")
        }
        Text(
            text = status,
            modifier = Modifier.padding(top = 16.dp),
            style = MaterialTheme.typography.bodyMedium,
            color = if (status.contains("Error") || status.contains("Exception")) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary
        )
    }
}