package com.mdviewer.app.data

import retrofit2.http.GET
import retrofit2.http.Query

interface MdsApi {
    @GET("api/mds/")
    suspend fun listFiles(): MdsListResponse

    @GET("api/mds/file")
    suspend fun getFile(@Query("path") path: String): MdFileContentResponse
}
