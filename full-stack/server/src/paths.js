import path from "path";
import { fileURLToPath } from "url";
import { createJsonStorage } from "./storage/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(__dirname, "..");

/** Bundled markdown (read-only on Vercel). */
export const mdsDir = path.resolve(serverRoot, "mds");

/** Comment JSON storage (filesystem locally, Vercel Blob when `BLOB_READ_WRITE_TOKEN` is set). */
export const commentStorage = await createJsonStorage("comments");

/** Viewer access lists (filesystem locally, Vercel Blob when `BLOB_READ_WRITE_TOKEN` is set). */
export const accessStorage = await createJsonStorage("access");
