package com.mdviewer.app.auth

import android.util.Base64
import org.json.JSONObject

internal fun emailFromIdToken(idToken: String): String? {
    val parts = idToken.split(".")
    if (parts.size < 2) {
        return null
    }
    val payload = String(
        Base64.decode(parts[1], Base64.URL_SAFE or Base64.NO_PADDING or Base64.NO_WRAP),
    )
    return JSONObject(payload).optString("email").ifBlank { null }
}

internal fun generateNonce(): String {
    val bytes = ByteArray(32)
    java.security.SecureRandom().nextBytes(bytes)
    return Base64.encodeToString(bytes, Base64.NO_WRAP)
}
