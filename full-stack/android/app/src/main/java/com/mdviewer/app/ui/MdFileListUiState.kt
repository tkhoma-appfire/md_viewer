package com.mdviewer.app.ui

import com.mdviewer.app.data.MdFile

sealed interface MdFileListUiState {
    data object Loading : MdFileListUiState

    data class Success(val files: List<MdFile>) : MdFileListUiState

    data class Error(val message: String) : MdFileListUiState
}
