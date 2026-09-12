package com.mdviewer.app.data

import retrofit2.http.GET

interface MdsApi {
    @GET("api/mds/")
    suspend fun listFiles(): MdsListResponse
}
