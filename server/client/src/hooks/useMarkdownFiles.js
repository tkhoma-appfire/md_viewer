import { useCallback, useEffect, useState } from "react";
import { API_BASE } from "../lib/api.js";

export function useMarkdownFiles({ onFileLoaded }) {
  const [tree, setTree] = useState([]);
  const [selectedPath, setSelectedPath] = useState(null);
  const [draft, setDraft] = useState("");
  const [loadError, setLoadError] = useState(null);
  const [saveState, setSaveState] = useState(null);

  const refreshList = useCallback(() => {
    fetch(`${API_BASE}/mds`)
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
    fetch(`${API_BASE}/mds/file?${q}`)
      .then((r) => {
        if (!r.ok) throw new Error(`load failed: ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setDraft(data.content ?? "");
        setLoadError(null);
        onFileLoaded?.();
      })
      .catch((e) => {
        setLoadError(String(e));
        setDraft("");
      });
  }, [selectedPath, onFileLoaded]);

  const save = useCallback(() => {
    if (!selectedPath) return;
    setSaveState("saving");
    fetch(`${API_BASE}/mds/file`, {
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
  }, [selectedPath, draft, refreshList]);

  return {
    tree,
    selectedPath,
    setSelectedPath,
    draft,
    setDraft,
    loadError,
    saveState,
    refreshList,
    save,
  };
}
