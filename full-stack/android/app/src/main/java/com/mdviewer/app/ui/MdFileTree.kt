package com.mdviewer.app.ui

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.mdviewer.app.data.MdFile
import com.mdviewer.app.data.MdTreeNode

private sealed interface MdTreeRow {
    val key: String
    val depth: Int

    data class Folder(val node: MdTreeNode, override val depth: Int) : MdTreeRow {
        override val key: String get() = "dir:${node.path}"
    }

    data class File(val node: MdTreeNode, override val depth: Int) : MdTreeRow {
        override val key: String get() = "file:${node.path}"
    }
}

private fun flattenMdTree(
    nodes: List<MdTreeNode>,
    depth: Int = 0,
    collapsedDirs: Set<String> = emptySet(),
): List<MdTreeRow> {
    val rows = mutableListOf<MdTreeRow>()
    for (node in nodes) {
        when (node.type) {
            "dir" -> {
                rows.add(MdTreeRow.Folder(node, depth))
                if (node.path !in collapsedDirs && !node.children.isNullOrEmpty()) {
                    rows.addAll(flattenMdTree(node.children, depth + 1, collapsedDirs))
                }
            }
            "file" -> rows.add(MdTreeRow.File(node, depth))
        }
    }
    return rows
}

@Composable
fun MdFileTreeList(
    tree: List<MdTreeNode>,
    onFileClick: (MdFile) -> Unit,
    modifier: Modifier = Modifier,
) {
    var collapsedDirs by remember { mutableStateOf(emptySet<String>()) }
    val rows = remember(tree, collapsedDirs) {
        flattenMdTree(tree, collapsedDirs = collapsedDirs)
    }

    LazyColumn(modifier = modifier) {
        items(rows, key = { it.key }) { row ->
            when (row) {
                is MdTreeRow.Folder -> {
                    val collapsed = row.node.path in collapsedDirs
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                collapsedDirs = if (collapsed) {
                                    collapsedDirs - row.node.path
                                } else {
                                    collapsedDirs + row.node.path
                                }
                            }
                            .padding(
                                start = (12 + row.depth * 16).dp,
                                end = 16.dp,
                                top = 10.dp,
                                bottom = 10.dp,
                            ),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Text(
                            text = if (collapsed) "▸" else "▾",
                            style = MaterialTheme.typography.bodyLarge,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                        Text(
                            text = row.node.name,
                            style = MaterialTheme.typography.bodyLarge.copy(
                                fontWeight = FontWeight.Medium,
                            ),
                            modifier = Modifier.padding(start = 8.dp),
                        )
                    }
                }

                is MdTreeRow.File -> {
                    val title = row.node.title?.takeIf { it.isNotBlank() } ?: row.node.name
                    Text(
                        text = title,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                onFileClick(MdFile(path = row.node.path, title = title))
                            }
                            .padding(
                                start = (28 + row.depth * 16).dp,
                                end = 16.dp,
                                top = 10.dp,
                                bottom = 10.dp,
                            ),
                        style = MaterialTheme.typography.bodyLarge.copy(
                            color = MaterialTheme.colorScheme.primary,
                            textDecoration = TextDecoration.Underline,
                        ),
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis,
                    )
                }
            }
        }
    }
}
