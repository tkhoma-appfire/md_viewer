import { useState } from "react";
import { ActionFooter } from "./components/ActionFooter.jsx";
import { EditorPane } from "./components/EditorPane.jsx";
import { FilesSidebar } from "./components/FilesSidebar.jsx";
import { PreviewPane } from "./components/PreviewPane.jsx";
import { useMarkdownFiles } from "./hooks/useMarkdownFiles.js";
import { useScrollSync } from "./hooks/useScrollSync.js";

export default function App() {
  const [editorCollapsed, setEditorCollapsed] = useState(false);
  const [previewCollapsed, setPreviewCollapsed] = useState(false);

  const {
    editorScrollRef,
    previewScrollRef,
    handleEditorScroll,
    handlePreviewScroll,
    resetScroll,
  } = useScrollSync();

  const {
    tree,
    selectedPath,
    setSelectedPath,
    draft,
    setDraft,
    loadError,
    saveState,
    refreshList,
    save,
    uploadDroppedFiles,
    uploadState,
  } = useMarkdownFiles({ onFileLoaded: resetScroll });

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-slate-50 px-4 pb-4 pt-4 text-slate-900 antialiased sm:px-6">
      <div className="mx-auto flex min-h-0 w-full max-w-[140rem] flex-1 flex-col">
        <header className="mb-4 flex shrink-0 flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-semibold tracking-tight text-slate-800">
            MD Viewer
          </h1>
          <button
            type="button"
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            onClick={refreshList}
          >
            Refresh list
          </button>
        </header>

        {loadError && (
          <p className="mb-4 shrink-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {loadError}
          </p>
        )}

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[minmax(12rem,13rem)_minmax(0,1fr)] lg:grid-rows-1">
          <FilesSidebar
            tree={tree}
            selectedPath={selectedPath}
            onSelect={setSelectedPath}
            loadError={loadError}
            onUploadToFolder={uploadDroppedFiles}
            uploadState={uploadState}
          />

          <div className="flex min-h-0 min-w-0 w-full flex-col gap-3 lg:min-h-0">
            <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row lg:gap-4">
              <EditorPane
                collapsed={editorCollapsed}
                onExpand={() => setEditorCollapsed(false)}
                selectedPath={selectedPath}
                draft={draft}
                onDraftChange={setDraft}
                editorScrollRef={editorScrollRef}
                onEditorScroll={handleEditorScroll}
              />
              <PreviewPane
                collapsed={previewCollapsed}
                onExpand={() => setPreviewCollapsed(false)}
                selectedPath={selectedPath}
                draft={draft}
                previewScrollRef={previewScrollRef}
                onPreviewScroll={handlePreviewScroll}
              />
            </div>

            <ActionFooter
              editorCollapsed={editorCollapsed}
              previewCollapsed={previewCollapsed}
              onCollapseEditor={() => setEditorCollapsed(true)}
              onCollapsePreview={() => setPreviewCollapsed(true)}
              selectedPath={selectedPath}
              onSave={save}
              saveState={saveState}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
