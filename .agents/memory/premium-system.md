---
    name: Premium Access System
    description: How the premium user auth system is built and where its pieces live
    ---

    # Premium Access System

    ## What it is
    A fully additive premium tier that integrates into the existing Firebase login — no separate login page, no separate credentials.

    ## How it works (end-to-end)
    1. Admin goes to /secret → Premium Users → enters a Firebase user's email address.
    2. Server stores it in `premium_users` table (email + optional expiry).
    3. When that user logs in normally via Firebase (`AuthModal`), the `/api/auth/user` handler checks their email against `premium_users`.
    4. If matched (active, not expired), server auto-issues a `premiumAuth` HMAC cookie (7-day, SameSite=None; Secure).
    5. `usePremiumAuth()` hook picks up the cookie via `GET /api/premium/me` — user is transparently premium.
    6. If no match (or disabled/expired), cookie is cleared.

    ## Token approach
    HMAC-signed stateless cookie. Format: `{userId}.{timestamp}.hmac(userId:timestamp, SESSION_SECRET)`. Cookie: `premiumAuth`. SameSite=None; Secure.

    ## Key files
    - `shared/schema.ts` — `premiumUsers` table: id, email (unique, links to Firebase), username (legacy nullable), passwordHash (legacy nullable), role, status, expiresAt, lastLogin, createdAt
    - `server/middleware/premium-auth.ts` — signPremiumToken, verifyPremiumToken, requirePremium middleware
    - `server/routes.ts` — premium detection injected inside /api/auth/user handler (after user create/get); premium routes block: POST /api/premium/logout, GET /api/premium/me, admin CRUD (GET/POST /api/admin/premium-users, PATCH toggle/expiry, DELETE)
    - `client/src/hooks/use-premium-auth.ts` — React hook (unchanged)
    - `client/src/pages/AdminLogin.tsx` — Crown sidebar item + Premium Users section: email-based create form, toggle, delete

    ## DB table migration
    CREATE TABLE IF NOT EXISTS + ALTER TABLE ADD COLUMN IF NOT EXISTS email TEXT UNIQUE — runs at startup, idempotent.

    ## What was removed vs previous implementation
    - PremiumLogin.tsx (separate login page) — deleted
    - /premium and /premium-login routes — removed from App.tsx
    - /api/premium/login route — removed (no separate password auth)
    - username/password fields in admin create dialog — replaced with email field
    - Reset-password dialog and mutation — removed
    - Credentials copy banner — removed

    **Why:** Single unified login was the requirement; email-based matching on Firebase auth is the simplest zero-friction approach.
    **How to apply:** Use requirePremium middleware from server/middleware/premium-auth.ts to gate any premium-only API routes.
    