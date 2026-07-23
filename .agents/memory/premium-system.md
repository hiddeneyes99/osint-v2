---
    name: Premium Access System
    description: How the premium user auth system is built and where its pieces live
    ---

    # Premium Access System

    ## What it is
    A separate auth layer for "premium" accounts that's fully additive — zero changes to Firebase auth, existing routes, or the normal user flow.

    ## Token approach
    Same HMAC-signed stateless cookie pattern as adminAuth.  
    Format: `{userId}.{timestamp}.hmac(userId:timestamp, SESSION_SECRET)`. Cookie name: `premiumAuth`. Max-age 7 days. SameSite=None; Secure.

    ## Key files
    - `shared/schema.ts` — `premiumUsers` table added at the bottom
    - `server/middleware/premium-auth.ts` — signPremiumToken, verifyPremiumToken, requirePremium middleware
    - `server/routes.ts` — premium routes block just before return httpServer (POST /api/premium/login, POST /api/premium/logout, GET /api/premium/me, plus /api/admin/premium-users/* CRUD)
    - `client/src/hooks/use-premium-auth.ts` — React hook
    - `client/src/pages/PremiumLogin.tsx` — login page at /premium-login and /premium
    - `client/src/pages/AdminLogin.tsx` — Crown sidebar item + Premium Users section added

    ## DB table
    Created at server startup via CREATE TABLE IF NOT EXISTS in the premium routes block.

    ## Passwords
    bcryptjs (pure JS, cost 12). Plain password returned only on creation/reset. Never stored.

    **Why:** bcryptjs avoids native binding issues; stateless HMAC token avoids session store dependency (matches adminAuth pattern).
    **How to apply:** Use requirePremium middleware from server/middleware/premium-auth.ts to guard any premium-only API routes.
    