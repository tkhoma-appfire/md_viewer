package com.mdviewer.app.data

import okhttp3.Interceptor
import okhttp3.Response
import java.util.concurrent.atomic.AtomicReference

class UserEmailInterceptor : Interceptor {
    private val userEmail = AtomicReference<String?>(null)

    fun setUserEmail(email: String?) {
        userEmail.set(email)
    }

    override fun intercept(chain: Interceptor.Chain): Response {
        val requestBuilder = chain.request().newBuilder()
        userEmail.get()?.let { email ->
            requestBuilder.header(USER_EMAIL_HEADER, email)
        }
        return chain.proceed(requestBuilder.build())
    }

    companion object {
        const val USER_EMAIL_HEADER = "X-User-Email"
    }
}
