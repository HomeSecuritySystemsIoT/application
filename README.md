# OpenCam

OpenCam is an open-source, self-hosted home security camera platform built for ESP32-CAM devices. It lets you organise cameras across multiple locations, monitor live feeds, and toggle motion detection — all from a clean web interface.


## What it does

- **Group-based access control** — users belong to groups; only group members can see that group's data
- **Hierarchical organisation** — Groups → Houses → Rooms → Cameras
- **Live camera feeds** — view streams from ESP32-CAM devices connected to your account
- **Per-camera controls** — toggle the feed on/off and enable/disable motion detection
- **Session-based authentication** — secure cookie sessions with 30-day expiry and automatic cleanup
- **Responsive UI** — built with shadcn/ui and Tailwind CSS

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | shadcn/ui + Tailwind CSS v4 |
| Database ORM | Drizzle ORM |
| Database | PostgreSQL 16 |
| Auth | Custom session tokens (SHA-256, timing-safe) |
| Runtime | Node.js |

---

## Setup

### Prerequisites

- Node.js 20+
- A PostgreSQL 16 database — either:
  - **Docker** (recommended for local dev): Docker and Docker Compose
  - **External provider**: any hosted PostgreSQL service (Supabase, Neon, Railway, etc.)

### 1. Clone the repository

```bash
git clone <repo-url>
cd <folder>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file at the project root with your `DATABASE_URL`. Only `DATABASE_URL` is required by the app — the other variables are only used by the Docker Compose file.

> Note: dotenv does not expand `${VAR}` syntax, so write the full connection string literally.

**Option A — Docker (local)**

```env
# Docker Compose settings
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password123
POSTGRES_DB=homesecurity
POSTGRES_PORT=5433

DATABASE_URL=postgresql://postgres:password123@localhost:5433/homesecurity
```

**Option B — External provider (Supabase, Neon, Railway, etc.)**

```env
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<database>
```

Just paste the connection string given by your provider.

### 4. Start the database

**Docker only** — skip this step if you are using an external provider.

```bash
docker compose up -d
```

This starts a PostgreSQL 16 container on the port specified in `POSTGRES_PORT`.

### 5. Push the database schema

```bash
npx drizzle-kit push
```

This creates all tables (`User`, `Session`, `Group`, `GroupMember`, `House`, `Room`, `Camera`) in the running database.

### 6. Start the development server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

---

## Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npx drizzle-kit push` | Push schema changes to the database |
| `npx drizzle-kit studio` | Open Drizzle Studio (database GUI) |
