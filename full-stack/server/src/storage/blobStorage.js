import { del, get, put } from "@vercel/blob";

/**
 * @param {string} prefix e.g. "comments" or "access"
 * @returns {import("./index.js").JsonStorage}
 */
export function createBlobStorage(prefix) {
  const normalizedPrefix = prefix.replace(/\/+$/, "");

  function pathname(objectKey) {
    return `${normalizedPrefix}/${objectKey}`;
  }

  async function readText(objectKey) {
    try {
      const result = await get(pathname(objectKey), {
        access: "private",
        useCache: false,
      });
      if (result == null || result.statusCode !== 200 || result.stream == null) {
        return null;
      }
      return await new Response(result.stream).text();
    } catch (e) {
      const err = /** @type {Error & { status?: number; name?: string }} */ (e);
      if (err.status === 404 || err.name === "BlobNotFoundError") {
        return null;
      }
      throw e;
    }
  }

  return {
    backend: "blob",
    location: `vercel-blob:${normalizedPrefix}`,

    readText,

    async writeText(objectKey, content) {
      await put(pathname(objectKey), content, {
        access: "private",
        contentType: "application/json",
        addRandomSuffix: false,
        allowOverwrite: true,
      });
    },

    async deleteText(objectKey) {
      try {
        await del(pathname(objectKey));
      } catch (e) {
        const err = /** @type {Error & { status?: number; name?: string }} */ (e);
        if (err.status === 404 || err.name === "BlobNotFoundError") {
          return;
        }
        throw e;
      }
    },
  };
}
