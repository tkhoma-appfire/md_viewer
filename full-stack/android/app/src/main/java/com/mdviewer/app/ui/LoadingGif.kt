package com.mdviewer.app.ui

import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import coil.decode.GifDecoder
import coil.decode.ImageDecoderDecoder
import coil.request.ImageRequest
import com.mdviewer.app.R

@Composable
fun LoadingGif(
    modifier: Modifier = Modifier,
    size: Dp = 120.dp,
) {
    val context = LocalContext.current
    val imageLoader = remember {
        coil.ImageLoader.Builder(context)
            .components {
                add(ImageDecoderDecoder.Factory())
                add(GifDecoder.Factory())
            }
            .build()
    }
    AsyncImage(
        model = ImageRequest.Builder(context)
            .data(R.raw.loading)
            .build(),
        imageLoader = imageLoader,
        contentDescription = "Loading",
        contentScale = ContentScale.Fit,
        modifier = modifier.size(size),
    )
}

@Composable
fun LoadingGifBox(modifier: Modifier = Modifier) {
    androidx.compose.foundation.layout.Box(
        modifier = modifier,
        contentAlignment = Alignment.Center,
    ) {
        LoadingGif()
    }
}
