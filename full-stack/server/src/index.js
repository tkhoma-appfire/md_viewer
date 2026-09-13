import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createMdsRouter } from "./mds.js";
import { requestLoggingMiddleware } from "./requestLog.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = Number(process.env.PORT) || 3000;

const mdsDir =
  process.env.MDS_DIR || path.join(__dirname, "..", "mds");
const commentsDir =
  process.env.COMMENTS_DIR || path.join(__dirname, "..", "comments");
const accessDir =
  process.env.ACCESS_DIR || path.join(__dirname, "..", "access");

app.use(express.json({ limit: "2mb" }));
app.use(requestLoggingMiddleware);

app.get("/", (_req, res) => {
  res.send("Hello World");
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "md-viewer-fullstack-server", mdsDir });
});

app.use("/api/mds", createMdsRouter(mdsDir, commentsDir, accessDir));

app.listen(port, "0.0.0.0", () => {
  console.log(`Server listening on ${port}`);
});
