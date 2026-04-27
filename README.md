# Trucking Analytics App (Local MVP)

A local Next.js + Prisma + PostgreSQL trucking analytics platform built from `trucking_analytics_app_codex_spec.md`.

## What This App Does

- Admin uploads messy weekly files (CSV/XLSX/JSON/etc.) for a trucking client.
- App parses and classifies file types (`LOADS`, `FUEL`, `MAINTENANCE`, `DRIVERS`, `TRUCKS`, etc.).
- Rows are normalized into internal trucking data structures.
- Static dashboard metrics are calculated for 5 sections:
  - Executive Overview
  - Truck Profitability
  - Lane / Route Performance
  - Driver Performance
  - Costs & Trends
- AI narratives are generated per section using Groq based on clean section metrics.
- Admin publishes week.
- Client logs in and views dashboard by week.

## Tech Stack

- Next.js App Router + React + TypeScript
- Tailwind CSS
- PostgreSQL + Prisma ORM
- Apache ECharts via `echarts-for-react`
- Groq API for narratives

## Auth (V1 local)

Session cookie auth with role checks:

- `ADMIN` can access all admin routes and clients
- `CLIENT` can only access their own client data

Seed credentials:

- Admin: `admin@test.com` / `admin123`
- Client: `client@test.com` / `client123`

## Required Environment

Copy `.env.example` to `.env` and update values:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/trucking_analytics"
GROQ_API_KEY="your_groq_api_key_here"
SESSION_SECRET="local-dev-session-secret"
```

## Local Run

Option A (single script):

```bash
./scripts/run-local.sh
```

Option B (manual):

```bash
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

App URL:

- `http://localhost:3000`

## API Routes Implemented

### Auth
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Admin
- `GET /api/admin/clients`
- `POST /api/admin/clients`
- `GET /api/admin/clients/:id`
- `GET /api/admin/clients/:clientId/weeks`
- `POST /api/admin/clients/:clientId/weeks`
- `POST /api/admin/weeks/:weekId/upload`
- `GET /api/admin/weeks/:weekId/files`
- `POST /api/admin/weeks/:weekId/process`
- `POST /api/admin/weeks/:weekId/generate-narratives`
- `POST /api/admin/weeks/:weekId/publish`
- `GET /api/admin/weeks/:weekId/dashboard`

### Client
- `GET /api/client/weeks`
- `GET /api/client/dashboard?weekId=...`
- `GET /api/client/dashboard/compare?weekId=...&compareWeekId=...`

## Processing Pipeline

Main orchestrator:

- `src/lib/processing/importers/processReportingWeek.ts`

Flow:

1. Load week + uploaded files
2. Parse files (`parseUploadedFiles`)
3. Classify file types (`classifyParsedFiles`)
4. Normalize rows (`normalizeClassifiedFiles`)
5. Calculate section metrics (`calculateDashboardSections`)
6. Save sections (`DashboardSection` JSON)
7. Set week status to `PROCESSED`

Narrative orchestrator:

- `src/lib/processing/narratives/generateNarrativesForWeek.ts`

Flow:

1. Load current and previous week section metrics
2. Call Groq with reusable prompt template
3. Validate JSON with Zod
4. Retry once on invalid JSON
5. Fallback narrative if still invalid/fails
6. Save `narrativeJson` and set status `NARRATIVES_GENERATED`

## Notes

- Uploads are stored locally in `/uploads/client-{clientId}/week-{YYYY-MM-DD}`.
- Unknown/missing data does not crash processing; assumptions are used where needed.
- V1 is local-first and intentionally simple.
