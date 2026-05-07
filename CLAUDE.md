# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server with Turbopack (http://localhost:3000)
npm run build        # Production build
npm run typecheck    # TypeScript type checking (no emit)
npm run lint         # ESLint
npm run format       # Prettier (rewrites ts/tsx files)

npx drizzle-kit push    # Push schema changes to the database (no migrations)
npx drizzle-kit studio  # Open Drizzle Studio database GUI

npm run seed:demo   # Insert a demo group (4 rooms, 6 cameras) linked to ADMIN_EMAIL
npm run clear:demo  # Remove all demo data created by seed:demo
```

There are no tests in this project.

## Environment Setup

Copy `env.example` to `.env`. Required variables:

- `DATABASE_URL` — PostgreSQL connection string (literal, no `${VAR}` expansion)
- `ADMIN_EMAIL` — email that gets the admin view in the dashboard
- `BACKEND_API_SECRET` — shared secret the external backend uses to call `/api/iot/devices/[deviceId]`
- `NEXT_PUBLIC_BACKEND_WS_URL` — WebSocket URL of the external camera-streaming backend (defaults to `ws://<hostname>:7890`)

Start the local PostgreSQL container with `docker compose up -d`, then run `npx drizzle-kit push` before `npm run dev`.

## Architecture

### Stack
Next.js 16 App Router · shadcn/ui + Tailwind CSS v4 · Drizzle ORM · PostgreSQL 16 · Node.js runtime

### Data model hierarchy
```
Group → House → Room → Camera
GroupMember (user ↔ group with role)
Session (custom auth)
ClaimToken (device provisioning)
```
All defined in `drizzle/schema.ts`. DB queries live in `drizzle/actions/` per entity. Schema changes are pushed directly with `drizzle-kit push` (no migration files).

### Authentication
Custom session tokens — no NextAuth at runtime (the `next-auth` package in deps is unused).

Token format: `<sessionId>.<secret>` where `secret` is a random 12-byte hex string and `secretHash` (SHA-256) is stored in the DB. Verification uses `timingSafeEqual` to prevent timing attacks.

- `lib/session.ts` — `getCurrentSession()` (React-cached) validates the session cookie server-side and returns `{ session, user }` or `{ null, null }`.
- `app/auth/actions.ts` — server actions for `login`, `signup`, `logout`.
- `proxy.ts` — **the Next.js middleware** (re-exported as `middleware` in the project root). Guards `/dashboard` routes and redirects authenticated users away from `/auth/*`.

> `secure: false` is hardcoded on the session cookie. Change to `true` before deploying over HTTPS.

### Dashboard routing
All dashboard pages are server components that call `getCurrentSession()` and redirect to `/auth/login` if unauthenticated. Group membership is checked via `isGroupMember()` before rendering any group-scoped data, returning `<AccessDenied />` instead of `notFound()` to avoid leaking existence.

Route structure:
```
/dashboard                           → group list
/dashboard/[groupId]                 → house list
/dashboard/[groupId]/[houseId]       → room list
/dashboard/[groupId]/[houseId]/[roomId] → camera list
```

### IoT device flow
ESP32-CAM devices register themselves via a claim-token pairing flow:

1. A logged-in user generates a claim token (10-minute expiry, 32-byte hex) scanned as a QR code — `drizzle/actions/claimTokens.ts`.
2. The device POSTs `{ device_id, claim_token }` to `/api/iot/register` (CORS-open, no auth). On success the device is inserted into the `Camera` table for the token's room.
3. The external camera-streaming backend queries `/api/iot/devices/[deviceId]` (authenticated with `x-backend-secret` header) to check if a device is active.

### Camera streaming
Live video is delivered via WebSocket from an **external backend** (not this Next.js app). `CameraCard` (`components/camera-card.tsx`) connects to `NEXT_PUBLIC_BACKEND_WS_URL?device=<deviceId>`, receives binary JPEG frames, and renders them via `URL.createObjectURL`.

### Admin mode
Users whose email matches `ADMIN_EMAIL` env var see an extra panel on the dashboard (`/dashboard`) that shows all connected devices via `AdminDebugButton`.
