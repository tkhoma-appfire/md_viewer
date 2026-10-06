import { CollapseIcon } from "./icons.jsx";

export function EditorPane({
  collapsed,
  onExpand,
  selectedPath,
  draft,
  onDraftChange,
  editorScrollRef,
  onEditorScroll,
}) {
  return (
    <section
      className={
        collapsed
          ? "flex h-11 shrink-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm lg:h-auto lg:min-h-0 lg:w-12 lg:min-w-12 lg:max-w-12 lg:flex-shrink-0"
          : "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 lg:basis-0"
      }
    >
      {collapsed ? (
        <button
          type="button"
          className="flex h-full w-full flex-row items-center justify-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-200/80 lg:flex-col lg:py-3"
          onClick={onExpand}
          title="Expand editor"
        >
          <CollapseIcon direction="right" />
          <span className="max-w-[8rem] truncate sm:max-w-none lg:max-w-none lg:[writing-mode:vertical-rl] lg:rotate-180">
            Editor
          </span>
        </button>
      ) : (
        <>
          <div className="mb-2 shrink-0">
            <span className="block truncate text-sm text-slate-500">
              {selectedPath ? selectedPath : "Select a file"}
            </span>
          </div>
          <textarea
            ref={editorScrollRef}
            className="min-h-0 w-full flex-1 resize-none overflow-auto rounded-lg border border-slate-300 bg-white p-3 font-mono text-sm leading-relaxed text-slate-900 shadow-inner outline-none ring-sky-500/30 placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
            value={draft}
            onScroll={onEditorScroll}
            onChange={(e) => onDraftChange(e.target.value)}
            placeholder={
              selectedPath ? "Edit markdown…" : "Pick a file from the list"
            }
            spellCheck={false}
            disabled={!selectedPath}
          />
        </>
      )}
    </section>
  );
}
