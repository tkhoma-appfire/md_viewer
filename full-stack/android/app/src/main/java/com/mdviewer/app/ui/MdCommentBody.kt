package com.mdviewer.app.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.mdviewer.app.data.MdComment

@Composable
fun MdCommentBody(
    comment: MdComment,
    modifier: Modifier = Modifier,
    canDelete: Boolean = false,
    onDelete: (() -> Unit)? = null,
    useDeleteIcon: Boolean = false,
) {
    Column(modifier = modifier, verticalArrangement = Arrangement.spacedBy(2.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = "${comment.email} · ${formatCommentTime(comment.createdAt)}",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.primary,
            )
            if (canDelete && onDelete != null) {
                if (useDeleteIcon) {
                    IconButton(onClick = onDelete) {
                        Icon(
                            imageVector = Icons.Filled.Close,
                            contentDescription = "Remove comment",
                        )
                    }
                } else {
                    TextButton(onClick = onDelete) {
                        Text("Delete")
                    }
                }
            }
        }
        Text(
            text = comment.text,
            style = MaterialTheme.typography.bodyMedium,
        )
    }
}
