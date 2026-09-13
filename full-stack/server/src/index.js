import express from "express";
import fs from "fs/promises";
import { createMdsRouter, listMdFilePaths } from "./mds.js";
import { accessDir, commentsDir, mdsDir } from "./paths.js";
import { requestLoggingMiddleware } from "./requestLog.js";

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "2mb" }));
app.use(requestLoggingMiddleware);

app.get("/api/health", async (_req, res) => {
  let mdsExists = false;
  let mdFilesOnDisk = 0;
  try {
    await fs.access(mdsDir);
    mdsExists = true;
    mdFilesOnDisk = (await listMdFilePaths(mdsDir)).length;
  } catch {
    // mds directory missing (e.g. Docker image built without COPY mds)
  }

  res.json({
    status: "ok",
    service: "md-viewer-fullstack-server",
    mdsDir,
    mdsExists,
    mdFilesOnDisk,
    commentsDir,
    accessDir,
    vercel: Boolean(process.env.VERCEL),
  });
});

app.use("/api/mds", createMdsRouter(mdsDir, commentsDir, accessDir));

export default app;

if (!process.env.VERCEL) {
  app.listen(port, "0.0.0.0", () => {
    console.log(`Server listening on ${port}`);
  });
}
