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

    init {
        loadFiles()
    }

    fun loadFiles() {
        viewModelScope.launch {
            _uiState.value = MdFileListUiState.Loading
            try {
                val response = ApiClient.mdsApi.listFiles()
                _uiState.value = MdFileListUiState.Success(response.files)
            } catch (e: Exception) {
                _uiState.value = MdFileListUiState.Error(
                    e.message ?: "Failed to load markdown files",
                )
            }
        }
    }
}
