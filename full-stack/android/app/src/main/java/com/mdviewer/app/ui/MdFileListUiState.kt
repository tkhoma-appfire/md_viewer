package com.mdviewer.app.ui

import com.mdviewer.app.data.MdTreeNode

sealed interface MdFileListUiState {
    data object Loading : MdFileListUiState

    data class Success(val tree: List<MdTreeNode>) : MdFileListUiState

    data class Error(val message: String) : MdFileListUiState
}
