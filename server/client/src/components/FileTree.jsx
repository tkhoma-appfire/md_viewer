import { useState } from "react";
import { FileIcon, FolderIcon } from "./icons.jsx";

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

export function FileTree({ tree, selectedPath, onSelect }) {
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
