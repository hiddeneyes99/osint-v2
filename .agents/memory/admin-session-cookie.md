---
name: Admin Session Cookie Fix
description: Why adminAuth cookie needs SameSite=None; Secure and why isLoggedIn must not use localStorage as initial state
---

## Rule
- `adminAuth` cookie must always use `SameSite=None; Secure` — do NOT use `SameSite=Lax` even in dev.
- `isLoggedIn` must start as `false` and be set only after a server-side `/api/admin/verify` call on mount.
- Show a "Verifying session..." spinner (`isVerifying` state) while the verify call is in flight.

**Why:**
Replit's canvas preview is an iframe from a different origin (`pike.replit.dev`). `SameSite=Lax` cookies are NOT sent in cross-origin iframe requests in modern browsers. This caused the `adminAuth` cookie to be silently dropped on every request after page refresh, resulting in 401s. `SameSite=None; Secure` allows cross-origin iframe cookie sending. Replit dev IS always HTTPS so `Secure` is safe.

Separately, `localStorage`/`sessionStorage` may also be restricted in strict browser iframe contexts (Safari ITP, Chrome strict mode), so relying on them for the initial `isLoggedIn` truth was unreliable — the server verify call is the only reliable source of truth.

**How to apply:**
- In `server/routes.ts` admin login route: always set `Secure; SameSite=None` regardless of `isProduction`.
- In `AdminLogin.tsx`: `useState(false)` + `useState(true)` for `isVerifying`, fetch `/api/admin/verify` in `useEffect([], [])`, set `isLoggedIn(true)` on 200 else clear localStorage and stay false.
- Keep localStorage as a fallback for the `X-Admin-Token` header in `queryClient.ts` default fetcher.
