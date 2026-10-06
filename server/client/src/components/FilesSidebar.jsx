import { FileTree } from "./FileTree.jsx";

export function FilesSidebar({ tree, selectedPath, onSelect, loadError }) {
  return (
    <aside className="flex min-h-0 flex-col rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
      <h2 className="mb-2 shrink-0 text-base font-semibold text-slate-800">
        Files
      </h2>
      <div className="min-h-0 flex-1 overflow-auto">
        <FileTree
          tree={tree}
          selectedPath={selectedPath}
          onSelect={onSelect}
        />
      </div>
      {tree.length === 0 && !loadError && (
        <p className="mt-2 text-sm text-slate-500">
          No .md files found. Add some under{" "}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-slate-700">
            mds/
          </code>
          .
        </p>
      )}
    </aside>
  );
}
