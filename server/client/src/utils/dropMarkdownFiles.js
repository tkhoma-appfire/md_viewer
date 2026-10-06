function entryToFile(entry) {
  return new Promise((resolve, reject) => entry.file(resolve, reject));
}

function readAllDirectoryEntries(dirEntry) {
  return new Promise((resolve, reject) => {
    const reader = dirEntry.createReader();
    const all = [];
    const readBatch = () => {
      reader.readEntries(
        (batch) => {
          if (!batch.length) {
            resolve(all);
            return;
          }
          all.push(...batch);
          readBatch();
        },
        reject
      );
    };
    readBatch();
  });
}

async function walkEntry(entry, dirPath) {
  if (entry.isFile) {
    if (!entry.name.endsWith(".md")) return [];
    const file = await entryToFile(entry);
    const content = await file.text();
    const rel = dirPath ? `${dirPath}/${entry.name}` : entry.name;
    return [{ path: rel.replace(/\\/g, "/"), content }];
  }
  if (entry.isDirectory) {
    const nextDir = dirPath ? `${dirPath}/${entry.name}` : entry.name;
    const children = await readAllDirectoryEntries(entry);
    const results = [];
    for (const child of children) {
      results.push(...(await walkEntry(child, nextDir)));
    }
    return results;
  }
  return [];
}

async function fromFileList(fileList, targetDir) {
  const prefix = targetDir
    ? `${targetDir.replace(/\\/g, "/").replace(/\/$/, "")}/`
    : "";
  const results = [];
  for (const file of fileList) {
    if (!file.name.endsWith(".md")) continue;
    const relative = (file.webkitRelativePath || file.name).replace(/\\/g, "/");
    const path = relative.includes("/") ? `${prefix}${relative}` : `${prefix}${file.name}`;
    const content = await file.text();
    results.push({ path, content });
  }
  return results;
}

/**
 * @param {DataTransfer} dataTransfer
 * @param {string} [targetDir] Folder path under mds/ (e.g. "guides")
 * @returns {Promise<Array<{ path: string, content: string }>>}
 */
export async function collectMarkdownFromDrop(dataTransfer, targetDir = "") {
  const prefix = targetDir
    ? `${targetDir.replace(/\\/g, "/").replace(/\/$/, "")}/`
    : "";

  const entries = [];
  if (dataTransfer.items) {
    for (const item of dataTransfer.items) {
      if (item.kind !== "file") continue;
      const entry = item.webkitGetAsEntry?.();
      if (entry) entries.push(entry);
    }
  }

  if (entries.length === 0) {
    return fromFileList(dataTransfer.files, targetDir);
  }

  const results = [];
  for (const entry of entries) {
    const partial = await walkEntry(entry, "");
    for (const { path, content } of partial) {
      results.push({ path: `${prefix}${path}`, content });
    }
  }
  return results;
}

export function dataTransferHasFiles(dataTransfer) {
  if (!dataTransfer?.types) return false;
  return Array.from(dataTransfer.types).includes("Files");
}
