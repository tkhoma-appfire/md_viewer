import { useCallback, useRef, useState } from "react";
import { dataTransferHasFiles } from "../utils/dropMarkdownFiles.js";

export function useFileDrop(onDropFiles) {
  const [isOver, setIsOver] = useState(false);
  const depthRef = useRef(0);

  const onDragEnter = useCallback((e) => {
    if (!dataTransferHasFiles(e.dataTransfer)) return;
    e.preventDefault();
    depthRef.current += 1;
    setIsOver(true);
  }, []);

  const onDragOver = useCallback((e) => {
    if (!dataTransferHasFiles(e.dataTransfer)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const onDragLeave = useCallback((e) => {
    if (!dataTransferHasFiles(e.dataTransfer)) return;
    e.preventDefault();
    depthRef.current -= 1;
    if (depthRef.current <= 0) {
      depthRef.current = 0;
      setIsOver(false);
    }
  }, []);

  const onDrop = useCallback(
    (e) => {
      if (!dataTransferHasFiles(e.dataTransfer)) return;
      e.preventDefault();
      depthRef.current = 0;
      setIsOver(false);
      onDropFiles(e.dataTransfer);
    },
    [onDropFiles]
  );

  return { isOver, onDragEnter, onDragOver, onDragLeave, onDrop };
}
