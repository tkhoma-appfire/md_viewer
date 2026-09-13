import { Router } from "express";
import fs from "fs/promises";
import path from "path";
import { attachCommentRoutes } from "./comments.js";

/**
 * @param {string} mdsDir Absolute path to markdown root.
 * @param {string} commentsDir Absolute path to comment storage.
 */
export function createMdsRouter(mdsDir, commentsDir) {
  const root = path.resolve(mdsDir);

  function resolveSafeMd(rel) {
    if (typeof rel !== "string" || !rel.trim()) {
      throw new Error("path is required");
    }
    const normalized = rel.replace(/\\/g, "/").replace(/^\/+/, "");
    if (normalized.includes("..") || path.isAbsolute(normalized)) {
      throw new Error("invalid path");
    }
    if (!normalized.endsWith(".md")) {
      throw new Error("only .md files are allowed");
    }
    const full = path.resolve(root, normalized);
    const rootWithSep = root.endsWith(path.sep) ? root : root + path.sep;
    if (full !== root && !full.startsWith(rootWithSep)) {
      throw new Error("path outside mds root");
    }
    return full;
  }

  async function listMdFiles(dir = root, base = "", seenDirs = new Set()) {
    let realDir;
    try {
      realDir = await fs.realpath(dir);
    } catch (e) {
      if (/** @type {NodeJS.ErrnoException} */ (e).code === "ENOENT") {
        return [];
      }
      throw e;
    }
    if (seenDirs.has(realDir)) {
      return [];
    }
    seenDirs.add(realDir);

    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch (e) {
      if (/** @type {NodeJS.ErrnoException} */ (e).code === "ENOENT") {
        return [];
      }
      throw e;
    }
    const out = [];
    for (const ent of entries) {
      const rel = base ? `${base}/${ent.name}` : ent.name;
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        out.push(...(await listMdFiles(full, rel, seenDirs)));
      } else if (ent.isSymbolicLink()) {
        let targetStat;
        try {
          targetStat = await fs.stat(full);
        } catch {
          continue;
        }
        if (targetStat.isDirectory()) {
          out.push(...(await listMdFiles(full, rel, seenDirs)));
        } else if (targetStat.isFile() && ent.name.endsWith(".md")) {
          out.push({ path: rel.replace(/\\/g, "/") });
        }
      } else if (ent.isFile() && ent.name.endsWith(".md")) {
        out.push({ path: rel.replace(/\\/g, "/") });
      }
    }
    return out.sort((a, b) => a.path.localeCompare(b.path));
  }

  function titleFromFirstLine(content) {
    const firstLine = content.split(/\r?\n/)[0] ?? "";
    return firstLine.replace(/#/g, "").trim();
  }

  async function listMdFilesWithTitles() {
    const paths = await listMdFiles();
    const files = [];
    for (const { path: relPath } of paths) {
      const full = path.resolve(root, relPath);
      let title = "";
      try {
        const content = await fs.readFile(full, "utf8");
        title = titleFromFirstLine(content);
      } catch {
        title = path.basename(relPath, ".md");
      }
      files.push({ path: relPath, title });
    }
    return files;
  }

  const router = Router();

  router.get("/", async (_req, res) => {
    try {
      const files = await listMdFilesWithTitles();
      res.json({ files });
    } catch (e) {
      res.status(500).json({ error: String(/** @type {Error} */ (e).message) });
    }
  });

  router.get("/file", async (req, res) => {
    const rel = req.query.path;
    if (typeof rel !== "string") {
      res.status(400).json({ error: "query path is required" });
      return;
    }
    try {
      const content = await readMdContent(rel);
      res.json({ path: rel.replace(/\\/g, "/"), content });
    } catch (e) {
      if (/** @type {NodeJS.ErrnoException} */ (e).code === "ENOENT") {
        res.status(404).json({ error: "not found" });
        return;
      }
      const err = /** @type {Error} */ (e);
      res.status(400).json({ error: err.message });
    }
  });

  async function readMdContent(rel) {
    const full = resolveSafeMd(rel);
    return fs.readFile(full, "utf8");
  }

  attachCommentRoutes(router, commentsDir, readMdContent);

  return router;
}
