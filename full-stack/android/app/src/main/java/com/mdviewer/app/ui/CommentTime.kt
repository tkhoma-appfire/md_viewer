package com.mdviewer.app.ui

import java.text.SimpleDateFormat
import java.util.Locale
import java.util.TimeZone

fun formatCommentTime(iso: String): String {
    val parsers = listOf(
        "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
        "yyyy-MM-dd'T'HH:mm:ss'Z'",
    )
    for (pattern in parsers) {
        try {
            val parser = SimpleDateFormat(pattern, Locale.US).apply {
                timeZone = TimeZone.getTimeZone("UTC")
            }
            val date = parser.parse(iso) ?: continue
            return SimpleDateFormat("MMM d, yyyy HH:mm", Locale.getDefault()).format(date)
        } catch (_: Exception) {
            continue
        }
    }
    return iso
}
