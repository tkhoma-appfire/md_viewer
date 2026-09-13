package com.mdviewer.app.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.mdviewer.app.data.AddCommentRequest
import com.mdviewer.app.data.ApiClient
import com.mdviewer.app.data.MdComment
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class MdFileDetailViewModel(
    private val path: String,
) : ViewModel() {
    private val _uiState = MutableStateFlow<MdFileDetailUiState>(MdFileDetailUiState.Loading)
    val uiState: StateFlow<MdFileDetailUiState> = _uiState.asStateFlow()

    private val _isRefreshing = MutableStateFlow(false)
    val isRefreshing: StateFlow<Boolean> = _isRefreshing.asStateFlow()

    private val _comments = MutableStateFlow<List<MdComment>>(emptyList())
    val comments: StateFlow<List<MdComment>> = _comments.asStateFlow()

    private val _commentError = MutableStateFlow<String?>(null)
    val commentError: StateFlow<String?> = _commentError.asStateFlow()

    init {
        loadContent()
    }

    fun loadContent() {
        viewModelScope.launch {
            _uiState.value = MdFileDetailUiState.Loading
            fetchContent(keepContentOnError = false)
        }
    }

    fun refresh() {
        viewModelScope.launch {
            val keepContent = _uiState.value is MdFileDetailUiState.Success
            if (keepContent) {
                _isRefreshing.value = true
            } else {
                _uiState.value = MdFileDetailUiState.Loading
            }
            fetchContent(keepContentOnError = keepContent)
        }
    }

    fun addComment(line: Int, text: String, onSuccess: () -> Unit = {}) {
        viewModelScope.launch {
            _commentError.value = null
            try {
                ApiClient.mdsApi.addComment(
                    AddCommentRequest(path = path, line = line, text = text),
                )
                loadComments()
                onSuccess()
            } catch (e: Exception) {
                _commentError.value = e.message ?: "Failed to add comment"
            }
        }
    }

    fun clearCommentError() {
        _commentError.value = null
    }

    fun commentsForLine(line: Int): List<MdComment> {
        return _comments.value.filter { it.line == line }
    }

    fun lineCommentCount(line: Int): Int = commentsForLine(line).size

    private suspend fun fetchContent(keepContentOnError: Boolean) {
        try {
            val response = ApiClient.mdsApi.getFile(path)
            _uiState.value = MdFileDetailUiState.Success(response.content)
            loadComments()
        } catch (e: Exception) {
            if (!keepContentOnError) {
                _uiState.value = MdFileDetailUiState.Error(
                    e.message ?: "Failed to load markdown file",
                )
            }
        } finally {
            _isRefreshing.value = false
        }
    }

    private suspend fun loadComments() {
        try {
            val response = ApiClient.mdsApi.getComments(path)
            _comments.value = response.comments
        } catch (_: Exception) {
            _comments.value = emptyList()
        }
    }

    companion object {
        fun factory(path: String): ViewModelProvider.Factory {
            return object : ViewModelProvider.Factory {
                @Suppress("UNCHECKED_CAST")
                override fun <T : ViewModel> create(modelClass: Class<T>): T {
                    return MdFileDetailViewModel(path) as T
                }
            }
        }
    }
}
