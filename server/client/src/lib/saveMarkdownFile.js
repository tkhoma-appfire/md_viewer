import { API_BASE } from "./api.js";

export async function saveMarkdownFile(path, content) {
  const r = await fetch(`${API_BASE}/mds/file`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, content }),
  });
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(body.error || `save failed: ${r.status}`);
  return body;
}
