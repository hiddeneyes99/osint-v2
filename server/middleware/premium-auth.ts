/**
 * Premium auth middleware
 * Uses an HMAC-signed cookie (premiumAuth) containing the premium user ID.
 * Token format: {userId}.{timestamp}.{hmac(userId:timestamp, SESSION_SECRET)}
 */
import { createHmac } from "crypto";
import { db } from "../db";
import { premiumUsers } from "@shared/schema";
import { eq } from "drizzle-orm";

function getSecret() {
  return process.env.SESSION_SECRET || "fallback-secret";
}

export function signPremiumToken(userId: number): string {
  const ts = Date.now().toString();
  const payload = `${userId}:${ts}`;
  const sig = createHmac("sha256", getSecret()).update(payload).digest("hex");
  return `${userId}.${ts}.${sig}`;
}

export function verifyPremiumToken(token: string): number | null {
  try {
    const [userId, ts, sig] = token.split(".");
    if (!userId || !ts || !sig) return null;
    const payload = `${userId}:${ts}`;
    const expected = createHmac("sha256", getSecret()).update(payload).digest("hex");
    const age = Date.now() - parseInt(ts);
    // Token valid for 7 days
    if (sig !== expected || age < 0 || age > 7 * 24 * 60 * 60 * 1000) return null;
    return parseInt(userId);
  } catch {
    return null;
  }
}

export function parseCookiesPremium(req: any): Record<string, string> {
  const header = req.headers.cookie || "";
  return Object.fromEntries(
    header.split(";").map((c: string) => {
      const [k, ...v] = c.trim().split("=");
      return [k.trim(), decodeURIComponent(v.join("="))];
    }).filter(([k]: string[]) => k)
  );
}

/**
 * Middleware: requires a valid, active, non-expired premium session.
 * Attaches req.premiumUser on success.
 */
export const requirePremium = async (req: any, res: any, next: any) => {
  const cookies = parseCookiesPremium(req);
  const raw = cookies["premiumAuth"] || req.headers["x-premium-token"];
  if (!raw) return res.status(401).json({ message: "Premium access required" });

  const userId = verifyPremiumToken(raw as string);
  if (!userId) return res.status(401).json({ message: "Invalid or expired premium session" });

  try {
    const [user] = await db.select().from(premiumUsers).where(eq(premiumUsers.id, userId));
    if (!user) return res.status(401).json({ message: "Premium account not found" });
    if (user.status !== "active") return res.status(403).json({ message: "Premium account is disabled" });
    if (user.expiresAt && new Date() > user.expiresAt) {
      return res.status(403).json({ message: "Premium account has expired" });
    }
    req.premiumUser = user;
    next();
  } catch (err) {
    console.error("[premium-auth] DB error:", err);
    return res.status(500).json({ message: "Authentication error" });
  }
};

/**
 * Middleware: requires the existing requireAdminSession to be satisfied.
 * Re-exported here so route files can import both middlewares from one place.
 */
export { requirePremium as default };
