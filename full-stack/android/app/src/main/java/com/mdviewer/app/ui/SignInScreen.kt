package com.mdviewer.app.ui

import androidx.activity.ComponentActivity
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.mdviewer.app.auth.AuthUiState
import com.mdviewer.app.auth.AuthViewModel

@Composable
fun SignInScreen(
    activity: ComponentActivity,
    viewModel: AuthViewModel = viewModel(),
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(16.dp, Alignment.CenterVertically),
    ) {
        Text(
            text = "MD Viewer",
            style = MaterialTheme.typography.headlineMedium,
        )
        Text(
            text = "Sign in to view your markdown files",
            style = MaterialTheme.typography.bodyMedium,
            textAlign = TextAlign.Center,
        )

        when (val state = uiState) {
            AuthUiState.Loading -> {
                CircularProgressIndicator()
            }

            is AuthUiState.Error -> {
                Text(
                    text = state.message,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.error,
                    textAlign = TextAlign.Center,
                )
                Button(onClick = { viewModel.signIn(activity) }) {
                    Text("Sign in with Google")
                }
            }

            else -> {
                Button(onClick = { viewModel.signIn(activity) }) {
                    Text("Sign in with Google")
                }
            }
        }
    }
}
