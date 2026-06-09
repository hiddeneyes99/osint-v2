---
name: Credit System Removal
description: Credits/redeem/buy system completely removed from the app
---

## Rule
The credits, redeem codes, and buy plan system has been fully removed from this app.

**Why:** User explicitly requested complete removal of the credits/buy/redeem system.

**How to apply:**
- Do NOT re-add credits display to Navbar or Dashboard
- Do NOT add redeem code routes or UI
- Do NOT add buy plan dialogs or Telegram payment links
- The `credits` column still exists in the DB (in shared/models/auth.ts users table) to avoid destructive migration, but is never displayed or used in logic
- The `redeemCodes` DB table still exists in Supabase but is not in the Drizzle schema
- New user creation in firebase-auth.ts middleware does NOT set credits (DB default of 10 applies silently)
