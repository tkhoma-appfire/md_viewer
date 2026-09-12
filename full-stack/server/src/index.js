import express from "express";

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "2mb" }));

app.get("/", (_req, res) => {
  res.send("Hello World");
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "md-viewer-fullstack-server" });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server listening on ${port}`);
});
