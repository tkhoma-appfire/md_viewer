package com.mdviewer.app.ui

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.ChatBubbleOutline
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import org.intellij.markdown.ast.ASTNode

fun lineNumberForOffset(content: String, offset: Int): Int {
    if (offset <= 0) {
        return 1
    }
    val safeOffset = offset.coerceAtMost(content.length)
    var line = 1
    for (index in 0 until safeOffset) {
        if (content[index] == '\n') {
            line++
        }
    }
    return line
}

fun blockHasComments(
    content: String,
    node: ASTNode,
    commentedLines: Set<Int>,
): Boolean {
    if (commentedLines.isEmpty()) {
        return false
    }
    val startLine = lineNumberForOffset(content, node.startOffset)
    val endLine = lineNumberForOffset(content, node.endOffset)
    return commentedLines.any { it in startLine..endLine }
}

@Composable
fun CommentLineWrapper(
    lineNumber: Int,
    hasComments: Boolean,
    onCommentClick: (Int) -> Unit,
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit,
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .clickable { onCommentClick(lineNumber) }
            .padding(vertical = 2.dp),
        verticalAlignment = Alignment.Top,
    ) {
        Box(modifier = Modifier.weight(1f)) {
            content()
        }
        if (hasComments) {
            Icon(
                imageVector = Icons.Outlined.ChatBubbleOutline,
                contentDescription = "Comments on line $lineNumber",
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier
                    .padding(start = 4.dp, top = 4.dp)
                    .size(20.dp),
            )
        }
    }
}
