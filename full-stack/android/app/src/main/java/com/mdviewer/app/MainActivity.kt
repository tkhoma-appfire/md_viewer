package com.mdviewer.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.mdviewer.app.auth.AuthUiState
import com.mdviewer.app.auth.AuthViewModel
import com.mdviewer.app.data.MdFile
import com.mdviewer.app.ui.MdFileDetailScreen
import com.mdviewer.app.ui.MdFileListScreen
import com.mdviewer.app.ui.SignInScreen
import com.mdviewer.app.ui.theme.MdViewerTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MdViewerTheme {
                AppRoot(activity = this)
            }
        }
    }
}

@Composable
private fun AppRoot(
    activity: ComponentActivity,
    authViewModel: AuthViewModel = viewModel(),
) {
    val authState by authViewModel.uiState.collectAsStateWithLifecycle()

    when (val state = authState) {
        AuthUiState.Loading -> {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        }

        is AuthUiState.SignedIn -> {
            SignedInContent(
                userEmail = state.user.email,
                onSignOut = authViewModel::signOut,
            )
        }

        AuthUiState.SignedOut,
        is AuthUiState.Error,
        -> {
            SignInScreen(activity = activity, viewModel = authViewModel)
        }
    }
}

@Composable
private fun SignedInContent(
    userEmail: String,
    onSignOut: () -> Unit,
) {
    var selectedFile by remember { mutableStateOf<MdFile?>(null) }

    BackHandler(enabled = selectedFile != null) {
        selectedFile = null
    }

    if (selectedFile == null) {
        MdFileListScreen(
            userEmail = userEmail,
            onSignOut = onSignOut,
            onFileClick = { selectedFile = it },
        )
    } else {
        MdFileDetailScreen(
            file = selectedFile!!,
            onBack = { selectedFile = null },
        )
    }
}
