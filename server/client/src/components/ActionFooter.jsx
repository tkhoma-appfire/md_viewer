import { CollapseIcon } from "./icons.jsx";

export function ActionFooter({
  editorCollapsed,
  previewCollapsed,
  onCollapseEditor,
  onCollapsePreview,
  selectedPath,
  onSave,
  saveState,
}) {
  return (
    <footer
      className="flex shrink-0 flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm sm:px-4"
      aria-label="Editor and preview actions"
    >
      <div className="flex flex-wrap items-center gap-2">
        {!editorCollapsed && (
          <>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
              onClick={onCollapseEditor}
              title="Collapse editor"
            >
              <CollapseIcon direction="left" />
              <span className="hidden sm:inline">Collapse editor</span>
            </button>
            <button
              type="button"
              className="rounded-lg border border-sky-600 bg-sky-500 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!selectedPath}
              onClick={onSave}
            >
              Save
            </button>
            {saveState === "saving" && (
              <span className="text-sm text-slate-500">Saving…</span>
            )}
            {saveState === "saved" && (
              <span className="text-sm font-medium text-emerald-700">Saved</span>
            )}
            {saveState &&
              saveState !== "saving" &&
              saveState !== "saved" && (
                <span className="text-sm text-red-700">{saveState}</span>
              )}
          </>
        )}
      </div>
      {!previewCollapsed && (
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
          onClick={onCollapsePreview}
          title="Collapse preview"
        >
          <span className="hidden sm:inline">Collapse preview</span>
          <CollapseIcon direction="right" />
        </button>
      )}
    </footer>
  );
}
