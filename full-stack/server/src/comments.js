import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

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
 * @param {(rel: string) => Promise<string>} readMdContent
 */
export function attachCommentRoutes(router, commentsDir, readMdContent) {
  router.get("/comments", async (req, res) => {
    const rel = req.query.path;
    if (typeof rel !== "string") {
      res.status(400).json({ error: "query path is required" });
      return;
    }
    try {
      const comments = await readComments(commentsDir, rel.replace(/\\/g, "/"));
      res.json({ path: rel.replace(/\\/g, "/"), comments });
    } catch (e) {
      res.status(500).json({ error: String(/** @type {Error} */ (e).message) });
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
      const content = await readMdContent(normalizedPath);
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
      await writeComments(commentsDir, normalizedPath, comments);
      res.status(201).json(comment);
    } catch (e) {
      const err = /** @type {Error} */ (e);
      if (err.message.includes("not found") || err.message.includes("ENOENT")) {
        res.status(404).json({ error: "markdown file not found" });
        return;
      }
      res.status(400).json({ error: err.message });
    }
  });
}
