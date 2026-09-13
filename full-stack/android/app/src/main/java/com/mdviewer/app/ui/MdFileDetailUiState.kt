package com.mdviewer.app.ui

sealed interface MdFileDetailUiState {
    data object Loading : MdFileDetailUiState

    data class Success(val content: String) : MdFileDetailUiState

    data class Error(val message: String) : MdFileDetailUiState
}
