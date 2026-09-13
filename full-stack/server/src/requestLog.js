/**
 * Logs every HTTP request with the caller email from X-User-Email (if present).
 */
export function requestLoggingMiddleware(req, res, next) {
  const email = req.get("x-user-email") || "(anonymous)";
  const started = Date.now();

  res.on("finish", () => {
    const ms = Date.now() - started;
    console.log(
      `[${new Date().toISOString()}] ${email} ${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`,
    );
  });

  next();
}
