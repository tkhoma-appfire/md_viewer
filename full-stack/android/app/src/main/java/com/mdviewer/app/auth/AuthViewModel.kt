package com.mdviewer.app.auth

import android.app.Application
import androidx.activity.ComponentActivity
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.mdviewer.app.BuildConfig
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class AuthViewModel(application: Application) : AndroidViewModel(application) {
    private val userSession = UserSession(application)
    private val googleAuthClient = GoogleAuthClient(application)

    private val _uiState = MutableStateFlow<AuthUiState>(AuthUiState.Loading)
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            userSession.userFlow.collect { user ->
                _uiState.value = if (user != null) {
                    AuthUiState.SignedIn(user)
                } else {
                    val current = _uiState.value
                    if (current is AuthUiState.Error) current else AuthUiState.SignedOut
                }
            }
        }
    }

    fun signIn(activity: ComponentActivity) {
        viewModelScope.launch {
            _uiState.value = AuthUiState.Loading
            try {
                if (BuildConfig.GOOGLE_WEB_CLIENT_ID.isBlank()) {
                    throw IllegalStateException(
                        "Set GOOGLE_WEB_CLIENT_ID in local.properties and rebuild the app.",
                    )
                }
                if (BuildConfig.GOOGLE_WEB_CLIENT_ID.startsWith("GOCSPX-")) {
                    throw IllegalStateException(
                        "GOOGLE_WEB_CLIENT_ID must be the Web client ID " +
                            "(…apps.googleusercontent.com), not the client secret (GOCSPX-…).",
                    )
                }
                if (!BuildConfig.GOOGLE_WEB_CLIENT_ID.endsWith(".apps.googleusercontent.com")) {
                    throw IllegalStateException(
                        "GOOGLE_WEB_CLIENT_ID must end with .apps.googleusercontent.com",
                    )
                }

                val credential = googleAuthClient.signIn(activity)
                val email = emailFromIdToken(credential.idToken) ?: credential.id
                userSession.save(
                    UserInfo(
                        displayName = credential.displayName.orEmpty(),
                        email = email,
                        photoUrl = credential.profilePictureUri?.toString(),
                    ),
                )
            } catch (e: Exception) {
                _uiState.value = AuthUiState.Error(e.message ?: "Sign-in failed")
            }
        }
    }

    fun signOut() {
        viewModelScope.launch {
            try {
                googleAuthClient.signOut()
            } catch (_: Exception) {
                // Continue clearing local session even if credential state clear fails.
            }
            userSession.clear()
        }
    }
}
