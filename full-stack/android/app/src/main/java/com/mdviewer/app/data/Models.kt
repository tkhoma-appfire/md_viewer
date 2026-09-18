package com.mdviewer.app.data

import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class MdFile(val path: String, val title: String)

@JsonClass(generateAdapter = true)
data class MdTreeNode(
    val type: String,
    val name: String,
    val path: String,
    val title: String? = null,
    val children: List<MdTreeNode>? = null,
)

@JsonClass(generateAdapter = true)
data class MdsListResponse(val tree: List<MdTreeNode>)

@JsonClass(generateAdapter = true)
data class MdFileContentResponse(val path: String, val content: String)

@JsonClass(generateAdapter = true)
data class MdComment(
    val id: String,
    val line: Int,
    val text: String,
    val email: String,
    val createdAt: String,
)

@JsonClass(generateAdapter = true)
data class MdCommentsResponse(val path: String, val comments: List<MdComment>)

@JsonClass(generateAdapter = true)
data class AddCommentRequest(val path: String, val line: Int, val text: String)

@JsonClass(generateAdapter = true)
data class DeleteCommentRequest(val path: String, val id: String)
