package com.mdviewer.app.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.mdviewer.app.data.ApiClient
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

    private suspend fun fetchContent(keepContentOnError: Boolean) {
        try {
            val response = ApiClient.mdsApi.getFile(path)
            _uiState.value = MdFileDetailUiState.Success(response.content)
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
