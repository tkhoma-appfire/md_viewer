import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createMdsRouter } from "./mds.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = Number(process.env.PORT) || 3000;

const mdsDir =
  process.env.MDS_DIR || path.join(__dirname, "..", "..", "mds");

app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "md-viewer-server", mdsDir });
});

app.use("/api/mds", createMdsRouter(mdsDir));

app.listen(port, "0.0.0.0", () => {
  console.log(`Server listening on ${port}`);
});
