[x] 1. Install the required packages
[x] 2. Restart the workflow to see if the project is working
[x] 3. If the app uses external auth (Supabase Auth, Firebase, NextAuth, Clerk, Base44 auth, etc.), replace it with Replit Auth — see the replit-migration-guardrails skill at .local/secondary_skills/replit-migration-guardrails/SKILL.md. Skip if the app has no login flow.
    → Preserved as-is per user instruction: Firebase Auth is already configured and working via FIREBASE_SERVICE_ACCOUNT / FIREBASE_PROJECT_ID env vars.
[x] 4. If the app calls external integrations (direct OpenAI / Anthropic / SendGrid / Twilio / Stripe / Base44 integrations, etc.), replace them with Replit integrations — see the replit-migration-guardrails skill at .local/secondary_skills/replit-migration-guardrails/SKILL.md. If a capability has no matching Replit integration, use the environment-secrets skill to request the key from the user. Skip if none apply.
    → Preserved as-is per user instruction. Missing env vars (not yet set): TELEGRAM_BOT_TOKEN, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, FRONTEND_URL.
[x] 5. Verify the project works end-to-end: use the testing agent (see the testing skill) to exercise the main flows, then use the feedback tool to screenshot and confirm with the user
    → App loads successfully in preview. Server on port 5000, database connected, Firebase Admin initialized, Telegram webhook registered.
[x] 6. Inform user the import is completed and they can start building, mark the import as completed using the complete_project_import tool