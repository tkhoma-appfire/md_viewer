import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { normalizeViewerEmail } from "./access.js";

function pathToStorageKey(relPath) {
  return relPath.replace(/\\/g, "/").replace(/\//g, "__");
}

function commentsFile(commentsDir, relPath) {
  return path.join(commentsDir, `${pathToStorageKey(relPath)}.json`);
}

export async function readComments(commentsDir, relPath) {
  try {
    const raw = await fs.readFile(commentsFile(commentsDir, relPath), "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.comments) ? parsed.comments : [];
  } catch (e) {
    if (/** @type {NodeJS.ErrnoException} */ (e).code === "ENOENT") {
      return [];
    }
    throw e;
  }
}

async function writeComments(commentsDir, relPath, comments) {
  await fs.mkdir(commentsDir, { recursive: true });
  await fs.writeFile(
    commentsFile(commentsDir, relPath),
    `${JSON.stringify({ comments }, null, 2)}\n`,
    "utf8",
  );
}

/**
 * @param {import("express").Router} router
 * @param {string} commentsDir
 * @param {(rel: string, viewerEmail?: string | null) => Promise<string>} readMdContent
 */
export function attachCommentRoutes(router, commentsDir, readMdContent) {
  router.get("/comments", async (req, res) => {
    const rel = req.query.path;
    if (typeof rel !== "string") {
      res.status(400).json({ error: "query path is required" });
      return;
    }
    try {
      const normalizedPath = rel.replace(/\\/g, "/");
      const viewerEmail = req.get("x-user-email");
      await readMdContent(normalizedPath, viewerEmail);
      const comments = await readComments(commentsDir, normalizedPath);
      res.json({ path: normalizedPath, comments });
    } catch (e) {
      const err = /** @type {Error & { status?: number }} */ (e);
      if (err.status === 403 || err.message === "access denied") {
        res.status(403).json({ error: "access denied" });
        return;
      }
      res.status(500).json({ error: String(err.message) });
    }
  });

  router.post("/comments", async (req, res) => {
    const rel = req.body?.path;
    const line = req.body?.line;
    const text = req.body?.text;
    const email = req.get("x-user-email") || "(anonymous)";

    if (typeof rel !== "string" || !rel.trim()) {
      res.status(400).json({ error: "path is required" });
      return;
    }
    if (!Number.isInteger(line) || line < 1) {
      res.status(400).json({ error: "line must be a positive integer" });
      return;
    }
    if (typeof text !== "string" || !text.trim()) {
      res.status(400).json({ error: "text is required" });
      return;
    }

    try {
      const normalizedPath = rel.replace(/\\/g, "/");
      const content = await readMdContent(normalizedPath, email);
      const lineCount = content.split(/\r?\n/).length;
      if (line > lineCount) {
        res.status(400).json({ error: `line must be between 1 and ${lineCount}` });
        return;
      }

      const comments = await readComments(commentsDir, normalizedPath);
      const comment = {
        id: crypto.randomUUID(),
        line,
        text: text.trim(),
        email,
        createdAt: new Date().toISOString(),
      };
      comments.push(comment);
      comments.sort((a, b) => a.line - b.line || a.createdAt.localeCompare(b.createdAt));
      try {
        await writeComments(commentsDir, normalizedPath, comments);
      } catch (e) {
        const writeErr = /** @type {NodeJS.ErrnoException} */ (e);
        res.status(500).json({
          error: "failed to save comment",
          detail: writeErr.message,
        });
        return;
      }
      res.status(201).json(comment);
    } catch (e) {
      const err = /** @type {Error & { status?: number }} */ (e);
      if (err.status === 403 || err.message === "access denied") {
        res.status(403).json({ error: "access denied" });
        return;
      }
      if (/** @type {NodeJS.ErrnoException} */ (e).code === "ENOENT") {
        res.status(404).json({ error: "markdown file not found" });
        return;
      }
      res.status(400).json({ error: err.message });
    }
  });

  router.delete("/comments", async (req, res) => {
    const rel = req.body?.path;
    const id = req.body?.id;
    const requester = normalizeViewerEmail(req.get("x-user-email"));

    if (typeof rel !== "string" || !rel.trim()) {
      res.status(400).json({ error: "path is required" });
      return;
    }
    if (typeof id !== "string" || !id.trim()) {
      res.status(400).json({ error: "id is required" });
      return;
    }
    if (!requester) {
      res.status(401).json({ error: "X-User-Email is required" });
      return;
    }

    try {
      const normalizedPath = rel.replace(/\\/g, "/");
      await readMdContent(normalizedPath, requester);
      const comments = await readComments(commentsDir, normalizedPath);
      const index = comments.findIndex((comment) => comment.id === id);
      if (index === -1) {
        res.status(404).json({ error: "comment not found" });
        return;
      }

      const comment = comments[index];
      if (normalizeViewerEmail(comment.email) !== requester) {
        res.status(403).json({ error: "only the comment owner can delete it" });
        return;
      }

      comments.splice(index, 1);
      try {
        await writeComments(commentsDir, normalizedPath, comments);
      } catch (e) {
        const writeErr = /** @type {NodeJS.ErrnoException} */ (e);
        res.status(500).json({
          error: "failed to save comment",
          detail: writeErr.message,
        });
        return;
      }
      res.json({ path: normalizedPath, id });
    } catch (e) {
      const err = /** @type {Error & { status?: number }} */ (e);
      if (err.status === 403 || err.message === "access denied") {
        res.status(403).json({ error: "access denied" });
        return;
      }
      if (/** @type {NodeJS.ErrnoException} */ (e).code === "ENOENT") {
        res.status(404).json({ error: "markdown file not found" });
        return;
      }
      res.status(400).json({ error: err.message });
    }
  });
}
