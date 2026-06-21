import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { storage } from "./storage";
import { sendCleanupReport } from "./telegram";

const app = express();
const httpServer = createServer(app);
const PgSession = connectPgSimple(session);

// CORS — allow frontend domain (Cloudflare/Vercel) and local dev
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowed = process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL, "http://localhost:5000"]
    : true;
  if (allowed === true || (origin && (allowed as string[]).includes(origin))) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

const isProduction = process.env.NODE_ENV === "production";
app.use(
  session({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    },
    store: new PgSession({
      conString: process.env.SUPABASE_DB_URL || process.env.DATABASE_URL,
      tableName: "session",
      pruneSessionInterval: 60 * 60,
    }),
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET || "osint-secret-key",
  })
);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // In BACKEND_ONLY mode (e.g. Render), skip static/vite serving
  // Frontend is hosted separately (Cloudflare Pages / Vercel)
  if (process.env.BACKEND_ONLY === "true") {
    // API-only mode — no static files served
  } else if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );

  // ── SCHEDULED CLEANUP ──────────────────────────────────────────────────────
  // Runs on fixed dates every month: 7, 14, 21, 28, and last day of month
  // (e.g. 30th/31st for long months). On each cleanup day ALL request_logs are
  // exported to Telegram as CSV + summary, then deleted from the DB.
  // A lastCleanupDate guard ensures it runs only once per day even if the
  // server restarts multiple times.
  // IMPORTANT: Skip cleanup in development — Vercel Cron handles it in production.
  // Running cleanup in dev would wipe the shared Supabase (production) DB!
  if (process.env.NODE_ENV === "development") {
    log("[cleanup] Dev mode — scheduled cleanup disabled (Vercel Cron handles this)", "cleanup");
  } else {

  let lastCleanupDate: string | null = null;

  const todayIST = () => {
    return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }); // "YYYY-MM-DD"
  };

  const isCleanupDay = () => {
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const day = now.getDate();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const cleanupDays = new Set([7, 14, 21, 28]);
    if (lastDay > 28) cleanupDays.add(lastDay); // e.g. 29 for leap-Feb, 30/31 for other months
    return cleanupDays.has(day);
  };

  const runScheduledCleanup = async () => {
    const today = todayIST();
    if (!isCleanupDay() || lastCleanupDate === today) return;

    lastCleanupDate = today; // lock immediately to prevent double-run
    log(`[cleanup] Scheduled cleanup day! Starting export & purge for ${today}...`, "cleanup");

    try {
      // 1. Fetch ALL current request_logs before deletion
      const logsToDelete = await storage.fetchLogsBeforeCleanup(0);

      // 2. Send CSV + summary to Telegram admins BEFORE deleting
      if (logsToDelete.length > 0) {
        log(`[cleanup] Sending ${logsToDelete.length} records to Telegram admins...`, "cleanup");
        await sendCleanupReport(logsToDelete);
      }

      // 3. Delete ALL request_logs
      const result = await storage.cleanupAllRequestLogs();
      log(`[cleanup] Purged ${result.deletedLogs} request_logs on ${today}`, "cleanup");
    } catch (err) {
      lastCleanupDate = null; // reset so it can retry this hour
      log(`[cleanup] Error during scheduled cleanup: ${err}`, "cleanup");
    }
  };

  // Check every hour whether today is a cleanup day
  setInterval(runScheduledCleanup, 60 * 60 * 1000);
  // Also check shortly after startup (in case server was down on a cleanup day)
  setTimeout(runScheduledCleanup, 15_000);

  } // end: NODE_ENV !== "development"
})();
