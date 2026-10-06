import { CollapseIcon } from "./icons.jsx";
import { MarkdownPreview } from "./MarkdownPreview.jsx";

export function PreviewPane({
  collapsed,
  onExpand,
  selectedPath,
  draft,
  previewScrollRef,
  onPreviewScroll,
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
          title="Expand preview"
        >
          <CollapseIcon direction="left" />
          <span className="max-w-[8rem] truncate sm:max-w-none lg:max-w-none lg:[writing-mode:vertical-rl] lg:rotate-180">
            Preview
          </span>
        </button>
      ) : (
        <>
          <h2 className="mb-2 shrink-0 text-base font-semibold text-slate-800">
            Preview
          </h2>
          <div
            ref={previewScrollRef}
            className="min-h-0 flex-1 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-4"
            onScroll={onPreviewScroll}
          >
            {selectedPath ? (
              <MarkdownPreview content={draft} />
            ) : (
              <p className="text-sm text-slate-500">Select a file to preview.</p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
