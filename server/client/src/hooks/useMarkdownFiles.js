import { useCallback, useEffect, useState } from "react";
import { API_BASE } from "../lib/api.js";
import { saveMarkdownFile } from "../lib/saveMarkdownFile.js";
import { collectMarkdownFromDrop } from "../utils/dropMarkdownFiles.js";

export function useMarkdownFiles({ onFileLoaded }) {
  const [tree, setTree] = useState([]);
  const [selectedPath, setSelectedPath] = useState(null);
  const [draft, setDraft] = useState("");
  const [loadError, setLoadError] = useState(null);
  const [saveState, setSaveState] = useState(null);
  const [uploadState, setUploadState] = useState(null);

  const refreshList = useCallback(() => {
    return fetch(`${API_BASE}/mds`)
      .then((r) => {
        if (!r.ok) throw new Error(`list failed: ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setTree(data.tree ?? []);
        setLoadError(null);
        return data;
      })
      .catch((e) => {
        setLoadError(String(e));
        throw e;
      });
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
    saveMarkdownFile(selectedPath, draft)
      .then(() => {
        setSaveState("saved");
        refreshList();
      })
      .catch((e) => setSaveState(String(e)));
  }, [selectedPath, draft, refreshList]);

  const uploadDroppedFiles = useCallback(
    async (dataTransfer, targetDir = "") => {
      setUploadState("uploading");
      try {
        const files = await collectMarkdownFromDrop(dataTransfer, targetDir);
        if (files.length === 0) {
          throw new Error("Drop only .md files or folders containing them");
        }
        for (const { path, content } of files) {
          await saveMarkdownFile(path, content);
        }
        await refreshList();
        setSelectedPath(files[files.length - 1].path);
        setUploadState(`uploaded:${files.length}`);
      } catch (e) {
        setUploadState(String(e));
      }
    },
    [refreshList]
  );

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
    uploadDroppedFiles,
    uploadState,
  };
}
