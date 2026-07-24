# OSINT Platform

## Overview

This is a full-stack OSINT (Open Source Intelligence) platform with a cyberpunk-themed UI. The application provides information lookup services for mobile numbers, Aadhar cards, vehicle registrations, and IP addresses. Users authenticate via Firebase, receive credits for queries, and can view their search history.

## Running on Replit

- Install dependencies with `npm install`
- Start the development server with `npm run dev`
- The app is served on port `5000`
- A PostgreSQL connection is used when `SUPABASE_DB_URL` or `DATABASE_URL` is configured

### Telegram group search bot setup

The Telegram search bot uses the existing website service endpoints. It does not
run searches from a separate database or duplicate the lookup logic.

1. Publish the app at a stable public URL. Telegram cannot reliably call a
   temporary Replit preview URL.
2. Set `TELEGRAM_WEBHOOK_URL` in the environment used by the published app to
   that stable URL, for example `https://your-public-domain.example`.
   The app automatically uses `/api/telegram/webhook`.
3. Open Admin Panel → Telegram Bot, generate the dedicated API key, and enable
   the bot.
4. Add the bot to the target Telegram group. Send `/groupid` in that group.
5. Copy the returned numeric ID into Admin Panel → Telegram Bot → Approved group
   IDs, then save the settings.
6. In the same Admin Panel section, check the Webhook connection and press
   Register webhook if Telegram is still pointing at an old URL.
7. Test with `/help`, then a supported command such as
   `/mobile 9876543210` or `/ip 8.8.8.8`.

The bot ignores private chats and groups that are not approved. Results are
masked according to the selected masking level, and searches appear in the
Telegram Bot search logs.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, bundled using Vite
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state and caching
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Animations**: Framer Motion for cyberpunk visual effects
- **Theme**: Custom cyberpunk design with neon green accents, matrix background, and terminal-style components

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints under `/api/` prefix
- **Build System**: Custom build script using esbuild for server and Vite for client

### Authentication
- **Provider**: Firebase Authentication (Google sign-in and email/password)
- **Token Verification**: Firebase Admin SDK on the server
- **User Sync**: Firebase users are synced to the local PostgreSQL database on first authentication
- **Middleware**: Custom `firebaseAuthMiddleware` protects API routes

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` and `shared/models/auth.ts`
- **Key Tables**:
  - `users`: Stores user profiles with credits balance
  - `sessions`: Session management for authentication
  - `request_logs`: Audit trail of all API queries with results

### API Structure
- **Route Definitions**: Typed API contracts in `shared/routes.ts` using Zod schemas
- **Service Endpoints**:
  - `POST /api/services/mobile` - Mobile number lookup
  - `POST /api/services/aadhar` - Aadhar card lookup
  - `POST /api/services/vehicle` - Vehicle registration lookup
  - `POST /api/services/ip` - IP address lookup
- **User Endpoints**:
  - `GET /api/user` - Get current user profile
  - `GET /api/user/history` - Get query history

### Credit System
- Users start with 10 credits
- Each successful API query deducts 1 credit
- Queries are blocked if credits reach 0

## External Dependencies

### Firebase Services
- **Firebase Authentication**: User sign-in/sign-up with Google OAuth and email/password
- **Firebase Project ID**: `osint-platform-d6b9b`
- **Client Config**: Located in `client/src/lib/firebase.ts`
- **Server Admin**: Uses `firebase-admin` with project ID only (no service account key in code)

### Database
- **PostgreSQL**: Required for user data, sessions, and request logs
- **Connection**: Via `DATABASE_URL` environment variable
- **ORM**: Drizzle with `drizzle-kit` for migrations

### Third-Party UI Libraries
- **Radix UI**: Headless component primitives
- **shadcn/ui**: Pre-built accessible components
- **Lucide React**: Icon library

### Development Tools
- **Replit Plugins**: Vite plugins for development banner, error overlay, and cartographer
- **TypeScript**: Strict mode enabled with path aliases (`@/` for client, `@shared/` for shared code)