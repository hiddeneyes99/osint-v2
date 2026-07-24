import admin from "firebase-admin";
import { Response, NextFunction } from "express";
import { storage } from "../storage";

if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID || "osint-platform-d6b9b";

  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (serviceAccountJson) {
      console.log("Initializing Firebase Admin with Service Account");

      let serviceAccount: any;

      // Vercel sometimes corrupts JSON by turning \n into actual newlines inside strings.
      // Try plain parse first; if that fails, escape newlines and retry.
      try {
        serviceAccount = JSON.parse(serviceAccountJson);
      } catch (_parseErr) {
        try {
          serviceAccount = JSON.parse(serviceAccountJson.replace(/\n/g, "\\n"));
        } catch (e2) {
          console.error("Firebase: failed to parse FIREBASE_SERVICE_ACCOUNT JSON:", e2);
        }
      }

      if (serviceAccount) {
        // After parsing, Vercel may still leave literal \\n instead of real newlines in the key.
        if (serviceAccount.private_key) {
          serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
        }
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId,
        });
      } else {
        // JSON parse failed — fall back to project-ID only
        console.warn("Firebase: falling back to project-ID only init (token verification will fail)");
        admin.initializeApp({ projectId });
      }
    } else {
      console.log("Initializing Firebase Admin with Project ID only (default credentials)");
      admin.initializeApp({ projectId });
    }
  } catch (err) {
    console.error("Firebase initialization error:", err);
    admin.initializeApp({ projectId });
  }
}

/**
 * Combined middleware: accepts Firebase Bearer token OR a valid premiumAuth cookie.
 * Premium-only users (logged in via /api/premium/login, no Firebase session) are
 * auto-provisioned in the users table so handleServiceRequest can find them.
 */
export const requireFirebaseOrPremium = async (req: any, res: Response, next: NextFunction) => {
  // ── 1. Try Firebase Bearer token first ───────────────────────────────────
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return firebaseAuthMiddleware(req, res, next);
  }

  // ── 2. Fall back to premiumAuth cookie ───────────────────────────────────
  const { parseCookiesPremium, verifyPremiumToken } = await import("./premium-auth");
  const { db } = await import("../db");
  const { premiumUsers } = await import("@shared/schema");
  const { storage } = await import("../storage");
  const { eq } = await import("drizzle-orm");

  const cookies = parseCookiesPremium(req);
  const raw = cookies["premiumAuth"] || req.headers["x-premium-token"];
  if (!raw) return res.status(401).json({ message: "Unauthorized" });

  const premiumId = verifyPremiumToken(raw as string);
  if (!premiumId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const [pu] = await db.select().from(premiumUsers).where(eq(premiumUsers.id, premiumId));
    if (!pu) return res.status(401).json({ message: "Unauthorized" });
    if (pu.status !== "active") return res.status(403).json({ message: "Premium account disabled" });
    if (pu.expiresAt && new Date() > pu.expiresAt) return res.status(403).json({ message: "Premium account expired" });

    // Find or create the user record in the main users table
    const email = pu.email.toLowerCase().trim();
    let user = await storage.getUserByEmail(email);
    if (!user) {
      // Auto-provision a users-table record for premium-only users
      const syntheticId = `premium_${pu.id}`;
      user = await storage.createUser({
        id: syntheticId,
        email,
        username: email.split("@")[0] + "_premium",
        role: "user",
      });
    }

    req.user = { id: user.id, email: user.email, claims: { sub: user.id } };
    req.premiumUser = pu;
    next();
  } catch (err) {
    console.error("[requireFirebaseOrPremium] error:", err);
    return res.status(500).json({ message: "Authentication error" });
  }
};

export const firebaseAuthMiddleware = async (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const idToken = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log("Successfully verified token for:", decodedToken.email);

    // Sync with local DB to ensure user exists
    try {
      let user = await storage.getUser(decodedToken.uid);
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const ipStr = Array.isArray(ip) ? ip[0] : ip;

      if (!user) {
        console.log("Creating new user in storage:", decodedToken.uid);
        user = await storage.createUser({
          id: decodedToken.uid,
          email: decodedToken.email,
          username: decodedToken.email?.split('@')[0] || 'user',
          lastIp: ipStr,
          termsAccepted: req.headers['x-terms-accepted'] === 'true',
          privacyAccepted: req.headers['x-privacy-accepted'] === 'true',
        });
      } else {
        if (user.isIpBlocked) {
          return res.status(403).json({ message: "Your IP is blocked. Contact Admin." });
        }

        const updates: any = { lastIp: ipStr };
        if (req.headers['x-terms-accepted'] === 'true') updates.termsAccepted = true;
        if (req.headers['x-privacy-accepted'] === 'true') updates.privacyAccepted = true;

        await storage.updateUser(user.id, updates);
      }
    } catch (dbError) {
      console.error("Database sync error in auth middleware:", dbError);
    }

    req.user = {
      id: decodedToken.uid,
      email: decodedToken.email,
      claims: { sub: decodedToken.uid },
    };
    next();
  } catch (error) {
    console.error("Error verifying Firebase token:", error);
    res.status(401).json({
      message: "Unauthorized",
      detail: error instanceof Error ? error.message : "Token verification failed",
    });
  }
};