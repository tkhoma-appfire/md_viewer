import path from "path";
import { fileURLToPath } from "url";
import { createFilesystemStorage } from "./filesystemStorage.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(__dirname, "..", "..");

/**
 * @typedef {Object} JsonStorage
 * @property {"filesystem" | "blob"} backend
 * @property {string} location
 * @property {(objectKey: string) => Promise<string|null>} readText
 * @property {(objectKey: string, content: string) => Promise<void>} writeText
 * @property {(objectKey: string) => Promise<void>} deleteText
 */

function localDir(name, envVar) {
  if (process.env[envVar]) {
    return process.env[envVar];
  }
  return path.join(serverRoot, name);
}

/**
 * @param {"comments" | "access"} kind
 * @returns {Promise<import("./index.js").JsonStorage>}
 */
export async function createJsonStorage(kind) {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { createBlobStorage } = await import("./blobStorage.js");
    return createBlobStorage(kind);
  }
  const envVar = kind === "comments" ? "COMMENTS_DIR" : "ACCESS_DIR";
  return createFilesystemStorage(localDir(kind, envVar));
}

export { commentObjectKey, accessObjectKey, mdPathToStorageKey } from "./keys.js";
