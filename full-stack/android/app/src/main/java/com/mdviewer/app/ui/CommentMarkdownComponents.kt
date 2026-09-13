package com.mdviewer.app.ui

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.mikepenz.markdown.compose.components.MarkdownComponentModel
import com.mikepenz.markdown.compose.components.markdownComponents
import com.mikepenz.markdown.compose.elements.MarkdownBlockQuote
import com.mikepenz.markdown.compose.elements.MarkdownBulletList
import com.mikepenz.markdown.compose.elements.MarkdownCodeBlock
import com.mikepenz.markdown.compose.elements.MarkdownCodeFence
import com.mikepenz.markdown.compose.elements.MarkdownDivider
import com.mikepenz.markdown.compose.elements.MarkdownHeader
import com.mikepenz.markdown.compose.elements.MarkdownImage
import com.mikepenz.markdown.compose.elements.MarkdownOrderedList
import com.mikepenz.markdown.compose.elements.MarkdownParagraph
import com.mikepenz.markdown.compose.elements.MarkdownTable
import com.mikepenz.markdown.compose.elements.listDepth
import com.mikepenz.markdown.m3.elements.MarkdownCheckBox
import org.intellij.markdown.MarkdownTokenTypes

fun commentMarkdownComponents(
    content: String,
    commentedLines: Set<Int>,
    onCommentLineClick: (Int) -> Unit,
) = markdownComponents(
    paragraph = commentedBlock(content, commentedLines, onCommentLineClick) { model ->
        MarkdownParagraph(model.content, model.node, style = model.typography.paragraph)
    },
    heading1 = commentedBlock(content, commentedLines, onCommentLineClick) { model ->
        MarkdownHeader(model.content, model.node, style = model.typography.h1)
    },
    heading2 = commentedBlock(content, commentedLines, onCommentLineClick) { model ->
        MarkdownHeader(model.content, model.node, style = model.typography.h2)
    },
    heading3 = commentedBlock(content, commentedLines, onCommentLineClick) { model ->
        MarkdownHeader(model.content, model.node, style = model.typography.h3)
    },
    heading4 = commentedBlock(content, commentedLines, onCommentLineClick) { model ->
        MarkdownHeader(model.content, model.node, style = model.typography.h4)
    },
    heading5 = commentedBlock(content, commentedLines, onCommentLineClick) { model ->
        MarkdownHeader(model.content, model.node, style = model.typography.h5)
    },
    heading6 = commentedBlock(content, commentedLines, onCommentLineClick) { model ->
        MarkdownHeader(model.content, model.node, style = model.typography.h6)
    },
    setextHeading1 = commentedBlock(content, commentedLines, onCommentLineClick) { model ->
        MarkdownHeader(
            model.content,
            model.node,
            style = model.typography.h1,
            contentChildType = MarkdownTokenTypes.SETEXT_CONTENT,
        )
    },
    setextHeading2 = commentedBlock(content, commentedLines, onCommentLineClick) { model ->
        MarkdownHeader(
            model.content,
            model.node,
            style = model.typography.h2,
            contentChildType = MarkdownTokenTypes.SETEXT_CONTENT,
        )
    },
    blockQuote = commentedBlock(content, commentedLines, onCommentLineClick) { model ->
        MarkdownBlockQuote(model.content, model.node, style = model.typography.quote)
    },
    codeFence = commentedBlock(content, commentedLines, onCommentLineClick) { model ->
        MarkdownCodeFence(model.content, model.node, style = model.typography.code)
    },
    codeBlock = commentedBlock(content, commentedLines, onCommentLineClick) { model ->
        MarkdownCodeBlock(model.content, model.node, style = model.typography.code)
    },
    orderedList = commentedBlock(content, commentedLines, onCommentLineClick) { model ->
        MarkdownOrderedList(model.content, model.node, style = model.typography.ordered, model.listDepth)
    },
    unorderedList = commentedBlock(content, commentedLines, onCommentLineClick) { model ->
        MarkdownBulletList(model.content, model.node, style = model.typography.bullet, model.listDepth)
    },
    horizontalRule = commentedBlock(content, commentedLines, onCommentLineClick) { _ ->
        MarkdownDivider(Modifier.fillMaxWidth())
    },
    table = commentedBlock(content, commentedLines, onCommentLineClick) { model ->
        MarkdownTable(model.content, model.node, style = model.typography.table)
    },
    checkbox = commentedBlock(content, commentedLines, onCommentLineClick) { model ->
        MarkdownCheckBox(model.content, model.node, style = model.typography.text)
    },
    image = { model ->
        MarkdownImage(model.content, model.node)
    },
)

private fun commentedBlock(
    content: String,
    commentedLines: Set<Int>,
    onCommentLineClick: (Int) -> Unit,
    block: @Composable (MarkdownComponentModel) -> Unit,
): @Composable (MarkdownComponentModel) -> Unit = { model ->
    val lineNumber = lineNumberForOffset(content, model.node.startOffset)
    CommentLineWrapper(
        lineNumber = lineNumber,
        hasComments = blockHasComments(content, model.node, commentedLines),
        onCommentClick = onCommentLineClick,
    ) {
        block(model)
    }
}
