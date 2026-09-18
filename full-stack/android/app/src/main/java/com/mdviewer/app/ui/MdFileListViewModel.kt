package com.mdviewer.app.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mdviewer.app.data.ApiClient
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class MdFileListViewModel : ViewModel() {
    private val _uiState = MutableStateFlow<MdFileListUiState>(MdFileListUiState.Loading)
    val uiState: StateFlow<MdFileListUiState> = _uiState.asStateFlow()

    private val _isRefreshing = MutableStateFlow(false)
    val isRefreshing: StateFlow<Boolean> = _isRefreshing.asStateFlow()

    init {
        loadFiles()
    }

    fun loadFiles() {
        viewModelScope.launch {
            _uiState.value = MdFileListUiState.Loading
            fetchFiles(keepContentOnError = false)
        }
    }

    fun refresh() {
        viewModelScope.launch {
            val keepContent = _uiState.value is MdFileListUiState.Success
            if (keepContent) {
                _isRefreshing.value = true
            } else {
                _uiState.value = MdFileListUiState.Loading
            }
            fetchFiles(keepContentOnError = keepContent)
        }
    }

    private suspend fun fetchFiles(keepContentOnError: Boolean) {
        try {
            val response = ApiClient.mdsApi.listFiles()
            _uiState.value = MdFileListUiState.Success(response.tree)
        } catch (e: Exception) {
            if (!keepContentOnError) {
                _uiState.value = MdFileListUiState.Error(
                    e.message ?: "Failed to load markdown files",
                )
            }
        } finally {
            _isRefreshing.value = false
        }
    }
}
