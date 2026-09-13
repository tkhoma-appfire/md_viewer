import fs from "fs/promises";
import path from "path";

/**
 * @param {string} baseDir
 * @returns {import("./index.js").JsonStorage}
 */
export function createFilesystemStorage(baseDir) {
  const root = path.resolve(baseDir);

  return {
    backend: "filesystem",
    location: root,

    async readText(objectKey) {
      try {
        return await fs.readFile(path.join(root, objectKey), "utf8");
      } catch (e) {
        if (/** @type {NodeJS.ErrnoException} */ (e).code === "ENOENT") {
          return null;
        }
        throw e;
      }
    },

    async writeText(objectKey, content) {
      await fs.mkdir(root, { recursive: true });
      await fs.writeFile(path.join(root, objectKey), content, "utf8");
    },

    async deleteText(objectKey) {
      try {
        await fs.unlink(path.join(root, objectKey));
      } catch (e) {
        if (/** @type {NodeJS.ErrnoException} */ (e).code !== "ENOENT") {
          throw e;
        }
      }
    },
  };
}
