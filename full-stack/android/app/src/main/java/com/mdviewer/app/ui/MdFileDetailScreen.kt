package com.mdviewer.app.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.zIndex
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.mikepenz.markdown.model.rememberMarkdownState
import com.mikepenz.markdown.m3.Markdown
import com.mdviewer.app.data.MdComment
import com.mdviewer.app.data.MdFile

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MdFileDetailScreen(
    file: MdFile,
    userEmail: String,
    onBack: () -> Unit,
    viewModel: MdFileDetailViewModel = viewModel(
        key = file.path,
        factory = MdFileDetailViewModel.factory(file.path),
    ),
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val isRefreshing by viewModel.isRefreshing.collectAsStateWithLifecycle()
    val comments by viewModel.comments.collectAsStateWithLifecycle()
    val commentError by viewModel.commentError.collectAsStateWithLifecycle()
    var selectedLine by remember { mutableStateOf<Int?>(null) }
    var selectedTab by remember { mutableIntStateOf(0) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = file.title,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back",
                        )
                    }
                },
            )
        },
    ) { innerPadding ->
        PullToRefreshBox(
            isRefreshing = isRefreshing,
            onRefresh = viewModel::refresh,
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding),
        ) {
            Box(modifier = Modifier.fillMaxSize()) {
                when (val state = uiState) {
                    MdFileDetailUiState.Loading -> {
                        LoadingGifBox(modifier = Modifier.fillMaxSize())
                    }

                    is MdFileDetailUiState.Error -> {
                        Column(
                            modifier = Modifier
                                .align(Alignment.Center)
                                .padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(12.dp),
                        ) {
                            Text(
                                text = state.message,
                                style = MaterialTheme.typography.bodyMedium,
                                textAlign = TextAlign.Center,
                            )
                            Button(onClick = viewModel::refresh) {
                                Text("Retry")
                            }
                        }
                    }

                    is MdFileDetailUiState.Success -> {
                        val lines = remember(state.content) {
                            state.content.split(Regex("\r?\n"))
                        }
                        val markdownState = rememberMarkdownState(state.content)
                        val commentedLines = remember(comments) {
                            comments.map { it.line }.toSet()
                        }
                        val contentScrollState = rememberScrollState()
                        val commentsScrollState = rememberScrollState()

                        Column(modifier = Modifier.fillMaxSize()) {
                            TabRow(selectedTabIndex = selectedTab) {
                                Tab(
                                    selected = selectedTab == 0,
                                    onClick = { selectedTab = 0 },
                                    text = { Text("Content") },
                                )
                                Tab(
                                    selected = selectedTab == 1,
                                    onClick = { selectedTab = 1 },
                                    text = { Text("Comments (${comments.size})") },
                                )
                            }

                            Box(modifier = Modifier.fillMaxSize()) {
                                Column(
                                    modifier = Modifier
                                        .fillMaxSize()
                                        .zIndex(if (selectedTab == 0) 1f else 0f)
                                        .alpha(if (selectedTab == 0) 1f else 0f)
                                        .verticalScroll(contentScrollState)
                                        .padding(16.dp),
                                ) {
                                    Markdown(
                                        markdownState = markdownState,
                                        components = commentMarkdownComponents(
                                            content = state.content,
                                            commentedLines = commentedLines,
                                            onCommentLineClick = { selectedLine = it },
                                        ),
                                        loading = { modifier ->
                                            LoadingGifBox(modifier = modifier)
                                        },
                                        modifier = Modifier.fillMaxWidth(),
                                    )
                                }

                                Column(
                                    modifier = Modifier
                                        .fillMaxSize()
                                        .zIndex(if (selectedTab == 1) 1f else 0f)
                                        .alpha(if (selectedTab == 1) 1f else 0f)
                                        .verticalScroll(commentsScrollState)
                                        .padding(16.dp),
                                    verticalArrangement = Arrangement.spacedBy(8.dp),
                                ) {
                                    if (comments.isEmpty()) {
                                        Text(
                                            text = "No comments yet. Tap a line in Content to add one.",
                                            style = MaterialTheme.typography.bodyMedium,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                                        )
                                    } else {
                                        MdCommentsSummary(
                                            comments = comments,
                                            userEmail = userEmail,
                                            onLineClick = { selectedLine = it },
                                            onDeleteComment = viewModel::deleteComment,
                                        )
                                    }
                                }
                            }
                        }

                        selectedLine?.let { lineNumber ->
                            MdCommentDialog(
                                lineNumber = lineNumber,
                                lineText = lines.getOrElse(lineNumber - 1) { "" },
                                comments = viewModel.commentsForLine(lineNumber),
                                userEmail = userEmail,
                                error = commentError,
                                onDismiss = {
                                    selectedLine = null
                                    viewModel.clearCommentError()
                                },
                                onAddComment = { text, onSuccess ->
                                    viewModel.addComment(lineNumber, text, onSuccess)
                                },
                                onDeleteComment = viewModel::deleteComment,
                                onClearError = viewModel::clearCommentError,
                            )
                        }

                    }
                }
            }
        }
    }
}

@Composable
private fun MdCommentsSummary(
    comments: List<MdComment>,
    userEmail: String,
    onLineClick: (Int) -> Unit,
    onDeleteComment: (commentId: String) -> Unit,
) {
    comments.groupBy { it.line }.toSortedMap().forEach { (line, lineComments) ->
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 4.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp),
        ) {
            TextButton(onClick = { onLineClick(line) }) {
                Text("Line $line (${lineComments.size})")
            }
            lineComments.forEach { comment ->
                MdCommentBody(
                    comment = comment,
                    modifier = Modifier.padding(start = 8.dp),
                    canDelete = comment.email.equals(userEmail, ignoreCase = true),
                    onDelete = { onDeleteComment(comment.id) },
                )
            }
        }
    }
}
