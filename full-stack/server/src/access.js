import { accessObjectKey } from "./storage/index.js";

export function normalizeViewerEmail(email) {
  if (typeof email !== "string") {
    return null;
  }
  const normalized = email.trim().toLowerCase();
  return normalized || null;
}

export function normalizeEmailList(emails) {
  if (!Array.isArray(emails)) {
    return [];
  }
  const out = [];
  const seen = new Set();
  for (const email of emails) {
    const normalized = normalizeViewerEmail(email);
    if (!normalized || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    out.push(normalized);
  }
  return out.sort();
}

/**
 * @param {import("./storage/index.js").JsonStorage} storage
 * @param {string} relPath
 * @returns {Promise<{ emails: string[], updatedAt?: string, updatedBy?: string } | null>}
 * null means no access file (file is visible to everyone).
 */
export async function readAccessList(storage, relPath) {
  const raw = await storage.readText(accessObjectKey(relPath));
  if (raw == null) {
    return null;
  }
  const parsed = JSON.parse(raw);
  return {
    emails: normalizeEmailList(parsed.emails),
    updatedAt: parsed.updatedAt,
    updatedBy: parsed.updatedBy,
  };
}

export function canViewFile(viewerEmail, accessList) {
  if (!accessList) {
    return true;
  }
  const normalizedViewer = normalizeViewerEmail(viewerEmail);
  if (!normalizedViewer) {
    return false;
  }
  return accessList.emails.includes(normalizedViewer);
}

/**
 * @param {import("./storage/index.js").JsonStorage} storage
 */
async function writeAccessList(storage, relPath, emails, updatedBy) {
  const payload = {
    emails: normalizeEmailList(emails),
    updatedAt: new Date().toISOString(),
    updatedBy: normalizeViewerEmail(updatedBy),
  };
  await storage.writeText(
    accessObjectKey(relPath),
    `${JSON.stringify(payload, null, 2)}\n`,
  );
  return payload;
}

/**
 * @param {import("./storage/index.js").JsonStorage} storage
 */
async function deleteAccessList(storage, relPath) {
  await storage.deleteText(accessObjectKey(relPath));
}

/**
 * @param {import("express").Router} router
 * @param {import("./storage/index.js").JsonStorage} accessStorage
 * @param {(rel: string) => string} resolveSafeMd
 */
export function attachAccessRoutes(router, accessStorage, resolveSafeMd) {
  router.get("/access", async (req, res) => {
    const rel = req.query.path;
    if (typeof rel !== "string") {
      res.status(400).json({ error: "query path is required" });
      return;
    }

    try {
      const normalizedPath = rel.replace(/\\/g, "/");
      resolveSafeMd(normalizedPath);
      const viewerEmail = normalizeViewerEmail(req.get("x-user-email"));
      const accessList = await readAccessList(accessStorage, normalizedPath);
      if (!canViewFile(viewerEmail, accessList)) {
        res.status(403).json({ error: "access denied" });
        return;
      }
      res.json({
        path: normalizedPath,
        emails: accessList?.emails ?? [],
        restricted: accessList !== null,
      });
    } catch (e) {
      const err = /** @type {Error} */ (e);
      res.status(400).json({ error: err.message });
    }
  });

  router.put("/access", async (req, res) => {
    const rel = req.body?.path;
    const emails = req.body?.emails;
    const requester = normalizeViewerEmail(req.get("x-user-email"));

    if (typeof rel !== "string" || !rel.trim()) {
      res.status(400).json({ error: "path is required" });
      return;
    }
    if (!Array.isArray(emails)) {
      res.status(400).json({ error: "emails must be an array" });
      return;
    }
    if (!requester) {
      res.status(401).json({ error: "X-User-Email is required" });
      return;
    }

    try {
      const normalizedPath = rel.replace(/\\/g, "/");
      resolveSafeMd(normalizedPath);
      const normalizedEmails = normalizeEmailList(emails);
      if (normalizedEmails.length === 0) {
        res.status(400).json({ error: "emails must not be empty" });
        return;
      }

      const existing = await readAccessList(accessStorage, normalizedPath);
      if (existing && !canViewFile(requester, existing)) {
        res.status(403).json({ error: "access denied" });
        return;
      }

      let finalEmails = normalizedEmails;
      if (!existing && !finalEmails.includes(requester)) {
        finalEmails = normalizeEmailList([...finalEmails, requester]);
      }

      const saved = await writeAccessList(
        accessStorage,
        normalizedPath,
        finalEmails,
        requester,
      );
      res.json({
        path: normalizedPath,
        emails: saved.emails,
        restricted: true,
        updatedAt: saved.updatedAt,
        updatedBy: saved.updatedBy,
      });
    } catch (e) {
      const err = /** @type {Error} */ (e);
      res.status(400).json({ error: err.message });
    }
  });

  router.delete("/access", async (req, res) => {
    const rel = req.body?.path;
    const email = req.body?.email;
    const requester = normalizeViewerEmail(req.get("x-user-email"));

    if (typeof rel !== "string" || !rel.trim()) {
      res.status(400).json({ error: "path is required" });
      return;
    }
    if (typeof email !== "string" || !email.trim()) {
      res.status(400).json({ error: "email is required" });
      return;
    }
    if (!requester) {
      res.status(401).json({ error: "X-User-Email is required" });
      return;
    }

    try {
      const normalizedPath = rel.replace(/\\/g, "/");
      resolveSafeMd(normalizedPath);
      const existing = await readAccessList(accessStorage, normalizedPath);
      if (!existing) {
        res.status(404).json({ error: "no access restrictions for this file" });
        return;
      }
      if (!canViewFile(requester, existing)) {
        res.status(403).json({ error: "access denied" });
        return;
      }

      const normalizedEmail = normalizeViewerEmail(email);
      if (!normalizedEmail) {
        res.status(400).json({ error: "email is required" });
        return;
      }
      if (!existing.emails.includes(normalizedEmail)) {
        res.status(404).json({ error: "email not in access list" });
        return;
      }

      const remaining = existing.emails.filter((entry) => entry !== normalizedEmail);
      if (remaining.length === 0) {
        await deleteAccessList(accessStorage, normalizedPath);
        res.json({
          path: normalizedPath,
          email: normalizedEmail,
          emails: [],
          restricted: false,
        });
        return;
      }

      const saved = await writeAccessList(
        accessStorage,
        normalizedPath,
        remaining,
        requester,
      );
      res.json({
        path: normalizedPath,
        email: normalizedEmail,
        emails: saved.emails,
        restricted: true,
        updatedAt: saved.updatedAt,
        updatedBy: saved.updatedBy,
      });
    } catch (e) {
      const err = /** @type {Error} */ (e);
      res.status(400).json({ error: err.message });
    }
  });
}

/**
 * @param {import("./storage/index.js").JsonStorage} accessStorage
 */
export async function assertCanViewFile(accessStorage, relPath, viewerEmail) {
  const accessList = await readAccessList(accessStorage, relPath);
  if (!canViewFile(viewerEmail, accessList)) {
    const error = new Error("access denied");
    /** @type {Error & { status?: number }} */ (error).status = 403;
    throw error;
  }
}
