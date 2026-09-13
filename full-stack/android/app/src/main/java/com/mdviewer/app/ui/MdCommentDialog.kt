package com.mdviewer.app.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import com.mdviewer.app.data.MdComment

@Composable
fun MdCommentDialog(
    lineNumber: Int,
    lineText: String,
    comments: List<MdComment>,
    userEmail: String,
    error: String?,
    onDismiss: () -> Unit,
    onAddComment: (text: String, onSuccess: () -> Unit) -> Unit,
    onDeleteComment: (commentId: String) -> Unit,
    onClearError: () -> Unit,
) {
    var commentText by rememberSaveable(lineNumber) { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Line $lineNumber") },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .heightIn(max = 420.dp)
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                Text(
                    text = lineText.ifEmpty { "(empty line)" },
                    style = MaterialTheme.typography.bodySmall.copy(
                        fontFamily = FontFamily.Monospace,
                    ),
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )

                if (comments.isNotEmpty()) {
                    Text(
                        text = "Comments",
                        style = MaterialTheme.typography.titleSmall,
                    )
                    comments.forEach { comment ->
                        MdCommentBody(
                            comment = comment,
                            canDelete = comment.email.equals(userEmail, ignoreCase = true),
                            onDelete = { onDeleteComment(comment.id) },
                            useDeleteIcon = true,
                        )
                    }
                }

                OutlinedTextField(
                    value = commentText,
                    onValueChange = {
                        commentText = it
                        if (error != null) {
                            onClearError()
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Add a comment") },
                    minLines = 2,
                    isError = error != null,
                    supportingText = error?.let { { Text(it) } },
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    onAddComment(commentText) {
                        commentText = ""
                    }
                },
                enabled = commentText.isNotBlank(),
            ) {
                Text("Post")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Close")
            }
        },
    )
}
