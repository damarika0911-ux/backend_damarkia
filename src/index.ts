import dotenv from "dotenv";
dotenv.config(); // Load env vars BEFORE anything else

import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { promisePool } from "./database/connection";
import { runMigrations } from "./database/migration";
import { errorHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/loggerMiddleware";
import uploadRoutes, { validateStorage } from "./routes/upload";
import { clearPublicCache } from "./utils/publicCache";
import { apiLimiter } from "./middleware/rateLimits";
import { verifyMail } from "./services/mailService";
import v1Routes from "./routes/v1/index";
import publicRoutes from "./routes/v2/publicRoutes";
import logger from "./utils/logger";

export const app = express();
const PORT = process.env.PORT || 3000;
// Render (and Cloudflare in front of it) proxy every request. Trusting exactly one hop makes req.ip the
// address that connected to Render; rateLimits.ts then uses Cloudflare's CF-Connecting-IP only when that
// address is a Cloudflare edge. Set TRUST_PROXY=0 only when running without any proxy.
app.set("trust proxy", process.env.TRUST_PROXY === "0" ? false : Number(process.env.TRUST_PROXY || 1));
app.disable("x-powered-by");

// Security & performance middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  })
);
app.use(compression());
app.use(requestLogger);
app.use(
  cors({
    origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(",").map(value => value.trim()) : [
      "https://damarika.in",
      "https://www.damarika.in",
      "https://admin.damarika.in",
      ...(process.env.NODE_ENV === "production" ? [] : ["http://localhost:5173", "http://localhost:5174"]),
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// JSON bodies are small text records; images go through multipart /api/upload with their own limit.
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "100kb" }));
// Per-visitor flood protection for every API route (health checks included).
app.use(["/api", "/health"], apiLimiter);

// Any successful admin write (create/update/delete/upload) clears the public response cache,
// so the website shows changes immediately. Public /api/v2 reads never clear it.
app.use("/api", (req, res, next) => {
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method) && !req.path.startsWith("/v2/")) {
    res.on("finish", () => {
      if (res.statusCode < 400) clearPublicCache();
    });
  }
  next();
});

// Routes
app.use("/api", v1Routes);       // Admin panel: /api/v1/*, /api/auth/*
app.use("/api/v2", publicRoutes); // Public frontend: /api/v2/*
app.use("/api", uploadRoutes);    // Image upload: /api/upload

app.get("/", (_req: any, res: any) => {
  res.json({ success: true, message: "Damarika API is running!" });
});
app.get("/health", async (_req, res) => {
  try {
    await promisePool.query("SELECT 1 FROM users LIMIT 1");
    res.json({ success: true, database: "ready" });
  } catch { res.status(503).json({ success: false, database: "unavailable" }); }
});

// Error handler (must be last)
app.use(errorHandler);

async function start() {
  try {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error("Set a JWT_SECRET of at least 32 characters");
    if (!process.env.PUBLIC_API_URL || !/^https?:\/\//.test(process.env.PUBLIC_API_URL)) throw new Error("Set PUBLIC_API_URL to this API's public origin");
    if (!process.env.DATABASE_URL || /<project-ref>|<password>|PROJECT_REF|PASSWORD|REGION/i.test(process.env.DATABASE_URL)) throw new Error("Set DATABASE_URL to the Supabase Postgres pooler connection string");
    validateStorage();
    if (process.env.RUN_MIGRATIONS === "true") await runMigrations();
    await promisePool.query("SELECT 1 FROM users LIMIT 1");
    const server = app.listen(PORT, () => {
      logger.info(`API listening on port ${PORT}`);
      verifyMail().then((r) => (r.ok ? logger.info(r.message) : logger.warn(`Email NOT ready: ${r.message}`)));
      // Pre-fill the cache with the pages every visitor loads first, so the first visitor after a restart is fast too.
      const base = `http://127.0.0.1:${PORT}/api/v2`;
      for (const path of ["/program?limit=3", "/program?limit=10", "/product?limit=10", "/people?limit=10", "/archeologist", "/district"]) {
        fetch(base + path).catch(() => {});
      }
    });
    const shutdown = () => {
      const deadline = setTimeout(() => process.exit(1), 10000);
      deadline.unref();
      server.close(async () => { await promisePool.end(); clearTimeout(deadline); });
    };
    process.once("SIGTERM", shutdown);
    process.once("SIGINT", shutdown);
  } catch (error: any) {
    logger.error(`Startup failed: ${error.message}`);
    await promisePool.end();
    process.exitCode = 1;
  }
}
if (require.main === module) void start();
