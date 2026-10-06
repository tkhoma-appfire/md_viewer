import { useCallback } from "react";
import { useFileDrop } from "../hooks/useFileDrop.js";
import { FileTree } from "./FileTree.jsx";

function uploadStatusText(uploadState) {
  if (uploadState === "uploading") return "Uploading…";
  if (typeof uploadState === "string" && uploadState.startsWith("uploaded:")) {
    const n = uploadState.slice("uploaded:".length);
    return `Saved ${n} file${n === "1" ? "" : "s"} to mds/`;
  }
  if (uploadState && uploadState !== "uploading") {
    return uploadState;
  }
  return null;
}

export function FilesSidebar({
  tree,
  selectedPath,
  onSelect,
  loadError,
  onUploadToFolder,
  uploadState,
}) {
  const handleRootDrop = useCallback(
    (dataTransfer) => onUploadToFolder(dataTransfer, ""),
    [onUploadToFolder]
  );
  const {
    isOver: rootOver,
    onDragEnter: onRootDragEnter,
    onDragOver: onRootDragOver,
    onDragLeave: onRootDragLeave,
    onDrop: onRootDropEvent,
  } = useFileDrop(handleRootDrop);
  const statusText = uploadStatusText(uploadState);
  const statusIsError =
    statusText &&
    uploadState !== "uploading" &&
    !String(uploadState).startsWith("uploaded:");

  return (
    <aside className="flex min-h-0 flex-col rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
      <h2 className="mb-2 shrink-0 text-base font-semibold text-slate-800">
        Files
      </h2>
      <p className="mb-2 shrink-0 text-xs text-slate-500">
        Drop .md files or folders here to add them under{" "}
        <code className="rounded bg-slate-100 px-1 py-0.5 text-slate-600">
          mds/
        </code>
        . Drop onto a folder to upload inside it.
      </p>
      {statusText && (
        <p
          className={
            statusIsError
              ? "mb-2 shrink-0 text-xs text-red-700"
              : "mb-2 shrink-0 text-xs text-emerald-700"
          }
        >
          {statusText}
        </p>
      )}
      <div
        className={`min-h-0 flex-1 overflow-auto rounded-lg border border-dashed p-2 transition ${
          rootOver
            ? "border-sky-400 bg-sky-50"
            : "border-slate-200 bg-slate-50/50"
        }`}
        onDragEnter={onRootDragEnter}
        onDragOver={onRootDragOver}
        onDragLeave={onRootDragLeave}
        onDrop={onRootDropEvent}
      >
        <FileTree
          tree={tree}
          selectedPath={selectedPath}
          onSelect={onSelect}
          onUploadToFolder={onUploadToFolder}
        />
        {tree.length === 0 && !loadError && (
          <p className="text-sm text-slate-500">
            No files yet. Drop markdown here or add files under{" "}
            <code className="rounded bg-slate-100 px-1 py-0.5 text-slate-700">
              mds/
            </code>
            .
          </p>
        )}
      </div>
    </aside>
  );
}
