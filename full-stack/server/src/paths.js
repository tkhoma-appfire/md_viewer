import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(__dirname, "..");

/** Bundled markdown (read-only on Vercel). */
export const mdsDir = path.resolve(serverRoot, "mds");

function writableDir(name, envVar) {
  if (process.env[envVar]) {
    return process.env[envVar];
  }
  if (process.env.VERCEL) {
    return path.join("/tmp/md-viewer", name);
  }
  return path.join(serverRoot, name);
}

/** Comment JSON storage. Uses /tmp on Vercel (serverless FS is read-only elsewhere). */
export const commentsDir = writableDir("comments", "COMMENTS_DIR");

/** Viewer access lists. Uses /tmp on Vercel. */
export const accessDir = writableDir("access", "ACCESS_DIR");
