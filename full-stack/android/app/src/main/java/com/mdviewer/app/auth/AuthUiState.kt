package com.mdviewer.app.auth

sealed interface AuthUiState {
    data object Loading : AuthUiState

    data object SignedOut : AuthUiState

    data class SignedIn(val user: UserInfo) : AuthUiState

    data class Error(val message: String) : AuthUiState
}
