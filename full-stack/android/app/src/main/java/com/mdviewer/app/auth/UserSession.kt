package com.mdviewer.app.auth

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.userSessionDataStore: DataStore<Preferences> by preferencesDataStore(
    name = "user_session",
)

class UserSession(context: Context) {
    private val dataStore = context.applicationContext.userSessionDataStore

    val userFlow: Flow<UserInfo?> = dataStore.data.map { prefs ->
        val email = prefs[KEY_EMAIL]
        if (email.isNullOrBlank()) {
            null
        } else {
            UserInfo(
                displayName = prefs[KEY_DISPLAY_NAME].orEmpty(),
                email = email,
                photoUrl = prefs[KEY_PHOTO_URL],
            )
        }
    }

    suspend fun save(user: UserInfo) {
        dataStore.edit { prefs ->
            prefs[KEY_DISPLAY_NAME] = user.displayName
            prefs[KEY_EMAIL] = user.email
            if (user.photoUrl != null) {
                prefs[KEY_PHOTO_URL] = user.photoUrl
            } else {
                prefs.remove(KEY_PHOTO_URL)
            }
        }
    }

    suspend fun clear() {
        dataStore.edit { it.clear() }
    }

    private companion object {
        val KEY_DISPLAY_NAME = stringPreferencesKey("display_name")
        val KEY_EMAIL = stringPreferencesKey("email")
        val KEY_PHOTO_URL = stringPreferencesKey("photo_url")
    }
}
