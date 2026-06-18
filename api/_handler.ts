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

// Auto-create required tables that may not exist in the production DB
async function ensureTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ads (
        id serial PRIMARY KEY,
        title text NOT NULL DEFAULT '',
        type text NOT NULL DEFAULT 'IMAGE',
        media_url text,
        html_content text,
        link_url text,
        logo_url text,
        description text,
        button_text text DEFAULT 'Learn More',
        force_redirect boolean NOT NULL DEFAULT false,
        duration integer NOT NULL DEFAULT 15,
        is_active boolean NOT NULL DEFAULT true,
        views integer NOT NULL DEFAULT 0,
        clicks integer NOT NULL DEFAULT 0,
        created_at timestamp DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS broadcast_messages (
        id serial PRIMARY KEY,
        title text NOT NULL,
        message text NOT NULL,
        type text NOT NULL DEFAULT 'INFO',
        media_url text,
        media_type text,
        action_link text,
        button_text text DEFAULT 'Learn More',
        is_active boolean NOT NULL DEFAULT true,
        starts_at timestamp,
        expires_at timestamp,
        created_at timestamp DEFAULT now()
      );
    `);
    console.log("[handler] Tables verified/created");
  } catch (err) {
    console.error("[handler] Table creation warning:", err);
  }
}

const initPromise = ensureTables().then(() => registerRoutes(null, app))
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
