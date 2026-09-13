package com.mdviewer.app.data

import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class MdFile(val path: String, val title: String)

@JsonClass(generateAdapter = true)
data class MdsListResponse(val files: List<MdFile>)

@JsonClass(generateAdapter = true)
data class MdFileContentResponse(val path: String, val content: String)
