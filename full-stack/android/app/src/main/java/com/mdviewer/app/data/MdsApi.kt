package com.mdviewer.app.data

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Query

interface MdsApi {
    @GET("api/mds/")
    suspend fun listFiles(): MdsListResponse

    @GET("api/mds/file")
    suspend fun getFile(@Query("path") path: String): MdFileContentResponse

    @GET("api/mds/comments")
    suspend fun getComments(@Query("path") path: String): MdCommentsResponse

    @POST("api/mds/comments")
    suspend fun addComment(@Body body: AddCommentRequest): MdComment
}
