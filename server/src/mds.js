import { Router } from "express";
import fs from "fs/promises";
import path from "path";

/**
 * @param {string} mdsDir Absolute path to markdown root (bind-mounted in Docker).
 */
export function createMdsRouter(mdsDir) {
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

  /**
   * @returns {Promise<Array<{ type: 'dir', name: string, path: string, children: unknown[] } | { type: 'file', name: string, path: string }>>}
   */
  async function buildTree(dir = root, base = "") {
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch (e) {
      if (/** @type {NodeJS.ErrnoException} */ (e).code === "ENOENT") {
        return [];
      }
      throw e;
    }

    const dirs = [];
    const files = [];
    for (const ent of entries) {
      if (ent.isDirectory()) {
        dirs.push(ent);
      } else if (ent.isFile() && ent.name.endsWith(".md")) {
        files.push(ent);
      }
    }
    dirs.sort((a, b) => a.name.localeCompare(b.name));
    files.sort((a, b) => a.name.localeCompare(b.name));

    const nodes = [];
    for (const ent of dirs) {
      const rel = base ? `${base}/${ent.name}` : ent.name;
      const children = await buildTree(path.join(dir, ent.name), rel);
      if (children.length > 0) {
        nodes.push({
          type: "dir",
          name: ent.name,
          path: rel.replace(/\\/g, "/"),
          children,
        });
      }
    }
    for (const ent of files) {
      const rel = base ? `${base}/${ent.name}` : ent.name;
      nodes.push({
        type: "file",
        name: ent.name,
        path: rel.replace(/\\/g, "/"),
      });
    }
    return nodes;
  }

  const router = Router();

  router.get("/", async (_req, res) => {
    try {
      const tree = await buildTree();
      res.json({ tree });
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
      const full = resolveSafeMd(rel);
      const content = await fs.readFile(full, "utf8");
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

  router.put("/file", async (req, res) => {
    const rel = req.body?.path;
    const content = req.body?.content;
    if (typeof rel !== "string" || typeof content !== "string") {
      res.status(400).json({ error: "body must include path and content strings" });
      return;
    }
    try {
      const full = resolveSafeMd(rel);
      await fs.mkdir(path.dirname(full), { recursive: true });
      await fs.writeFile(full, content, "utf8");
      res.json({ ok: true, path: rel.replace(/\\/g, "/") });
    } catch (e) {
      const err = /** @type {Error} */ (e);
      res.status(400).json({ error: err.message });
    }
  });

  return router;
}
