import { useCallback, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const apiBase = "/md_viewer/api";

/** Cursor/VS Code–style table chrome (GFM tables need `remark-gfm`). */
const markdownComponents = {
  table({ children, ...props }) {
    return (
      <div className="not-prose my-4 w-full overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table
          className="m-0 w-max min-w-full border-collapse border-0 text-left text-sm leading-snug text-slate-800"
          {...props}
        >
          {children}
        </table>
      </div>
    );
  },
  thead({ children, ...props }) {
    return <thead {...props}>{children}</thead>;
  },
  tbody({ children, ...props }) {
    return <tbody {...props}>{children}</tbody>;
  },
  tr({ children, ...props }) {
    return (
      <tr className="even:bg-slate-50/90" {...props}>
        {children}
      </tr>
    );
  },
  th({ children, ...props }) {
    return (
      <th
        className="border border-slate-200 bg-slate-100 px-3 py-2 align-top font-semibold text-slate-900"
        {...props}
      >
        {children}
      </th>
    );
  },
  td({ children, ...props }) {
    return (
      <td
        className="border border-slate-200 px-3 py-2 align-top text-slate-700"
        {...props}
      >
        {children}
      </td>
    );
  },
};

function FolderIcon({ open }) {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-amber-600"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      {open ? (
        <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z" />
      ) : (
        <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z" opacity="0.85" />
      )}
    </svg>
  );
}

function FileIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-slate-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function FileTreeNode({ node, depth, selectedPath, onSelect, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  const pad = `${0.5 + depth * 0.75}rem`;

  if (node.type === "file") {
    const active = node.path === selectedPath;
    return (
      <li>
        <button
          type="button"
          style={{ paddingLeft: pad }}
          className={
            active
              ? "flex w-full items-center gap-1.5 rounded-lg border border-sky-300 bg-sky-100 py-1.5 pr-2 text-left text-sm text-slate-800 transition hover:bg-sky-50"
              : "flex w-full items-center gap-1.5 rounded-lg border border-transparent py-1.5 pr-2 text-left text-sm text-slate-700 transition hover:bg-slate-100"
          }
          onClick={() => onSelect(node.path)}
          title={node.path}
        >
          <FileIcon />
          <span className="min-w-0 truncate">{node.name}</span>
        </button>
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        style={{ paddingLeft: pad }}
        className="flex w-full items-center gap-1.5 rounded-lg border border-transparent py-1.5 pr-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        title={node.path}
      >
        <span
          className="inline-flex h-4 w-4 shrink-0 items-center justify-center text-slate-400"
          aria-hidden
        >
          {open ? "▾" : "▸"}
        </span>
        <FolderIcon open={open} />
        <span className="min-w-0 truncate">{node.name}</span>
      </button>
      {open && node.children?.length > 0 && (
        <ul className="mt-0.5 list-none space-y-0.5 p-0">
          {node.children.map((child) => (
            <FileTreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function FileTree({ tree, selectedPath, onSelect }) {
  if (!tree?.length) return null;
  return (
    <ul className="list-none space-y-0.5 p-0">
      {tree.map((node) => (
        <FileTreeNode
          key={node.path}
          node={node}
          depth={0}
          selectedPath={selectedPath}
          onSelect={onSelect}
        />
      ))}
    </ul>
  );
}

function CollapseIcon({ direction }) {
  const isLeft = direction === "left";
  return (
    <svg
      className="h-4 w-4 shrink-0 text-slate-500"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {isLeft ? (
        <path d="M15 18l-6-6 6-6" />
      ) : (
        <path d="M9 18l6-6-6-6" />
      )}
    </svg>
  );
}

export default function App() {
  const [tree, setTree] = useState([]);
  const [selectedPath, setSelectedPath] = useState(null);
  const [draft, setDraft] = useState("");
  const [loadError, setLoadError] = useState(null);
  const [saveState, setSaveState] = useState(null);
  const [editorCollapsed, setEditorCollapsed] = useState(false);
  const [previewCollapsed, setPreviewCollapsed] = useState(false);

  const refreshList = useCallback(() => {
    fetch(`${apiBase}/mds`)
      .then((r) => {
        if (!r.ok) throw new Error(`list failed: ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setTree(data.tree ?? []);
        setLoadError(null);
      })
      .catch((e) => setLoadError(String(e)));
  }, []);

  useEffect(() => {
    refreshList();
  }, [refreshList]);

  useEffect(() => {
    if (!selectedPath) {
      setDraft("");
      return;
    }
    setSaveState(null);
    const q = new URLSearchParams({ path: selectedPath });
    fetch(`${apiBase}/mds/file?${q}`)
      .then((r) => {
        if (!r.ok) throw new Error(`load failed: ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setDraft(data.content ?? "");
        setLoadError(null);
      })
      .catch((e) => {
        setLoadError(String(e));
        setDraft("");
      });
  }, [selectedPath]);

  function save() {
    if (!selectedPath) return;
    setSaveState("saving");
    fetch(`${apiBase}/mds/file`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: selectedPath, content: draft }),
    })
      .then(async (r) => {
        const body = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(body.error || `save failed: ${r.status}`);
        return body;
      })
      .then(() => {
        setSaveState("saved");
        refreshList();
      })
      .catch((e) => setSaveState(String(e)));
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 pb-8 pt-4 text-slate-900 antialiased sm:px-6">
      <div className="mx-auto w-full max-w-[140rem]">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
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
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {loadError}
          </p>
        )}

        <div className="grid min-h-[calc(100vh-6rem)] grid-cols-1 gap-4 lg:grid-cols-[minmax(12rem,13rem)_minmax(0,1fr)]">
          <aside className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
            <h2 className="mb-2 text-base font-semibold text-slate-800">Files</h2>
            <div className="max-h-[70vh] overflow-auto">
              <FileTree
                tree={tree}
                selectedPath={selectedPath}
                onSelect={setSelectedPath}
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

          <div className="flex h-full min-h-0 min-w-0 w-full flex-col gap-4 lg:flex-row lg:gap-4">
            <section
              className={
                editorCollapsed
                  ? "flex h-11 shrink-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm lg:h-auto lg:min-h-0 lg:w-12 lg:min-w-12 lg:max-w-12 lg:flex-shrink-0"
                  : "flex min-h-0 min-w-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 lg:basis-0"
              }
            >
              {editorCollapsed ? (
                <button
                  type="button"
                  className="flex h-full w-full flex-row items-center justify-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-200/80 lg:flex-col lg:py-3"
                  onClick={() => setEditorCollapsed(false)}
                  title="Expand editor"
                >
                  <CollapseIcon direction="right" />
                  <span className="max-w-[8rem] truncate sm:max-w-none lg:max-w-none lg:[writing-mode:vertical-rl] lg:rotate-180">
                    Editor
                  </span>
                </button>
              ) : (
                <>
                  <div className="mb-2 flex flex-wrap items-center gap-2 gap-y-2">
                    <span className="min-w-0 flex-1 truncate text-sm text-slate-500">
                      {selectedPath ? selectedPath : "Select a file"}
                    </span>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
                      onClick={() => setEditorCollapsed(true)}
                      title="Collapse editor"
                    >
                      <CollapseIcon direction="left" />
                      <span className="hidden sm:inline">Collapse</span>
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-sky-600 bg-sky-500 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={!selectedPath}
                      onClick={save}
                    >
                      Save
                    </button>
                    {saveState === "saving" && (
                      <span className="text-sm text-slate-500">Saving…</span>
                    )}
                    {saveState === "saved" && (
                      <span className="text-sm font-medium text-emerald-700">
                        Saved
                      </span>
                    )}
                    {saveState &&
                      saveState !== "saving" &&
                      saveState !== "saved" && (
                        <span className="text-sm text-red-700">{saveState}</span>
                      )}
                  </div>
                  <textarea
                    className="min-h-[18rem] w-full flex-1 resize-y rounded-lg border border-slate-300 bg-white p-3 font-mono text-sm leading-relaxed text-slate-900 shadow-inner outline-none ring-sky-500/30 placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={
                      selectedPath
                        ? "Edit markdown…"
                        : "Pick a file from the list"
                    }
                    spellCheck={false}
                    disabled={!selectedPath}
                  />
                </>
              )}
            </section>

            <section
              className={
                previewCollapsed
                  ? "flex h-11 shrink-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm lg:h-auto lg:min-h-0 lg:w-12 lg:min-w-12 lg:max-w-12 lg:flex-shrink-0"
                  : "flex min-h-0 min-w-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 lg:basis-0"
              }
            >
              {previewCollapsed ? (
                <button
                  type="button"
                  className="flex h-full w-full flex-row items-center justify-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-200/80 lg:flex-col lg:py-3"
                  onClick={() => setPreviewCollapsed(false)}
                  title="Expand preview"
                >
                  <CollapseIcon direction="left" />
                  <span className="max-w-[8rem] truncate sm:max-w-none lg:max-w-none lg:[writing-mode:vertical-rl] lg:rotate-180">
                    Preview
                  </span>
                </button>
              ) : (
                <>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-base font-semibold text-slate-800">
                      Preview
                    </h2>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
                      onClick={() => setPreviewCollapsed(true)}
                      title="Collapse preview"
                    >
                      <span className="hidden sm:inline">Collapse</span>
                      <CollapseIcon direction="right" />
                    </button>
                  </div>
                  <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-4">
                    {selectedPath ? (
                      <div className="prose prose-slate max-w-none min-w-0 prose-headings:scroll-mt-4 prose-pre:bg-slate-900 prose-pre:text-slate-100">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={markdownComponents}
                        >
                          {draft}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">
                        Select a file to preview.
                      </p>
                    )}
                  </div>
                </>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
