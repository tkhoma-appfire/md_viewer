package com.mdviewer.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.mdviewer.app.ui.MdFileListScreen
import com.mdviewer.app.ui.theme.MdViewerTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MdViewerTheme {
                MdFileListScreen()
            }
        }
    }
}
