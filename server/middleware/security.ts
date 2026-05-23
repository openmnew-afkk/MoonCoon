import type { Express, Request, Response, NextFunction } from "express";

const rateMap = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 120;

function rateLimit(req: Request, res: Response, next: NextFunction) {
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown";
  const now = Date.now();
  let bucket = rateMap.get(ip);
  if (!bucket || bucket.resetAt < now) {
    bucket = { count: 0, resetAt: now + WINDOW_MS };
    rateMap.set(ip, bucket);
  }
  bucket.count += 1;
  if (bucket.count > MAX_REQUESTS) {
    return res.status(429).json({ error: "Слишком много запросов" });
  }
  next();
}

export function applySecurityMiddleware(app: Express) {
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()",
    );
    next();
  });
  app.use("/api/", rateLimit);
}
