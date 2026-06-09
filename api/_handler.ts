import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { registerRoutes } from "../server/routes";
import { pool } from "../server/db";

const app = express();
const PgSession = connectPgSimple(session);

// ── CORS — allow all origins/methods (required for Vercel serverless) ──────
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use(
  session({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: true,
      sameSite: "none",
    },
    store: new PgSession({
      pool,
      tableName: "sessions",
      pruneSessionInterval: false,
      createTableIfMissing: true,
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
  })
);
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;
  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args] as any);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      console.log(logLine);
    }
  });
  next();
});

const initPromise = registerRoutes(null, app)
  .then(() => {
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      if (!res.headersSent) {
        res.status(status).json({ message: err.message || "Internal Server Error" });
      }
    });
  })
  .catch((err) => {
    console.error("[handler] Route registration failed:", err);
  });

async function handler(req: Request, res: Response) {
  try {
    await initPromise;
    return app(req, res);
  } catch (err: any) {
    console.error("[handler] Unhandled error:", err);
    if (!res.headersSent) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

// Explicit CommonJS export so Vercel's Node runtime picks it up as the handler
export = handler;
