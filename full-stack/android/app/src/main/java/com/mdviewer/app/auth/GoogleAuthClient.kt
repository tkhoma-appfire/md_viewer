package com.mdviewer.app.auth

import android.content.Context
import androidx.activity.ComponentActivity
import androidx.credentials.ClearCredentialStateRequest
import androidx.credentials.CredentialManager
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import androidx.credentials.exceptions.GetCredentialException
import com.google.android.libraries.identity.googleid.GetSignInWithGoogleOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.mdviewer.app.BuildConfig

class GoogleAuthClient(
    private val context: Context,
) {
    private val credentialManager = CredentialManager.create(context)

    suspend fun signIn(activity: ComponentActivity): GoogleIdTokenCredential {
        try {
            return requestSignInWithGoogle(activity)
        } catch (e: Exception) {
            throw credentialError(e)
        }
    }

    suspend fun signOut() {
        credentialManager.clearCredentialState(ClearCredentialStateRequest())
    }

    private suspend fun requestSignInWithGoogle(
        activity: ComponentActivity,
    ): GoogleIdTokenCredential {
        val option = GetSignInWithGoogleOption.Builder(
            serverClientId = BuildConfig.GOOGLE_WEB_CLIENT_ID,
        )
            .setNonce(generateNonce())
            .build()

        val request = GetCredentialRequest.Builder()
            .addCredentialOption(option)
            .build()

        val result = credentialManager.getCredential(
            request = request,
            context = activity,
        )

        val credential = result.credential
        if (credential is CustomCredential &&
            credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL
        ) {
            return GoogleIdTokenCredential.createFrom(credential.data)
        }

        throw IllegalStateException("Unexpected credential type: ${credential.type}")
    }

    private fun credentialError(e: Exception): Exception {
        val message = when (e) {
            is GetCredentialException -> e.errorMessage?.toString() ?: e.message
            else -> e.message
        }.orEmpty()

        if (message.contains("reauth", ignoreCase = true) ||
            message.contains("[16]", ignoreCase = false)
        ) {
            return IllegalStateException(
                "Google OAuth is misconfigured (DEVELOPER_ERROR). Check in Google Cloud Console:\n" +
                    "• Android OAuth client: package com.mdviewer.app\n" +
                    "• SHA-1: run ./gradlew signingReport and copy the debug SHA-1\n" +
                    "• Web OAuth client ID in GOOGLE_WEB_CLIENT_ID (not the Android client ID)\n" +
                    "• OAuth consent screen: External + your account as test user\n" +
                    "• Phone: internet on, Google account signed in",
            )
        }

        if (e is GetCredentialException && message.isNotBlank()) {
            return IllegalStateException(message)
        }

        return e
    }
}
