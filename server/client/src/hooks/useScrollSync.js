import { useCallback, useRef } from "react";
import { syncScrollPosition } from "../utils/syncScroll.js";

export function useScrollSync() {
  const editorScrollRef = useRef(null);
  const previewScrollRef = useRef(null);
  const scrollSyncLock = useRef(false);

  const handleEditorScroll = useCallback(() => {
    if (scrollSyncLock.current) return;
    const editor = editorScrollRef.current;
    const preview = previewScrollRef.current;
    if (!editor || !preview) return;
    scrollSyncLock.current = true;
    syncScrollPosition(editor, preview);
    requestAnimationFrame(() => {
      scrollSyncLock.current = false;
    });
  }, []);

  const handlePreviewScroll = useCallback(() => {
    if (scrollSyncLock.current) return;
    const editor = editorScrollRef.current;
    const preview = previewScrollRef.current;
    if (!editor || !preview) return;
    scrollSyncLock.current = true;
    syncScrollPosition(preview, editor);
    requestAnimationFrame(() => {
      scrollSyncLock.current = false;
    });
  }, []);

  const resetScroll = useCallback(() => {
    requestAnimationFrame(() => {
      if (editorScrollRef.current) editorScrollRef.current.scrollTop = 0;
      if (previewScrollRef.current) previewScrollRef.current.scrollTop = 0;
    });
  }, []);

  return {
    editorScrollRef,
    previewScrollRef,
    handleEditorScroll,
    handlePreviewScroll,
    resetScroll,
  };
}
