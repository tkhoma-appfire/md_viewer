package com.mdviewer.app.ui

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.material3.Badge
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.mdviewer.app.data.MdComment

@Composable
fun MdLineList(
    content: String,
    comments: List<MdComment>,
    onLineClick: (Int) -> Unit,
    modifier: Modifier = Modifier,
) {
    val lines = content.split(Regex("\r?\n"))
    val countsByLine = comments.groupingBy { it.line }.eachCount()

    LazyColumn(
        modifier = modifier.fillMaxSize(),
    ) {
        itemsIndexed(lines) { index, line ->
            val lineNumber = index + 1
            val commentCount = countsByLine[lineNumber] ?: 0
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onLineClick(lineNumber) }
                    .padding(horizontal = 12.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.Top,
            ) {
                Text(
                    text = lineNumber.toString(),
                    style = MaterialTheme.typography.bodySmall.copy(
                        fontFamily = FontFamily.Monospace,
                        color = MaterialTheme.colorScheme.primary,
                    ),
                    modifier = Modifier.padding(top = 2.dp),
                )
                Text(
                    text = line.ifEmpty { " " },
                    style = MaterialTheme.typography.bodyMedium.copy(
                        fontFamily = FontFamily.Monospace,
                    ),
                    modifier = Modifier.weight(1f),
                    maxLines = 3,
                    overflow = TextOverflow.Ellipsis,
                )
                if (commentCount > 0) {
                    Badge { Text(commentCount.toString()) }
                }
            }
        }
    }
}
