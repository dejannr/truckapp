# Trucking Analytics App - Implementation Guide

This document describes how the app currently works, where each part lives, and how to use it locally.

## 1. What This App Does

The app is a local trucking analytics MVP with two roles:

- Admin: manages clients, creates reporting weeks, uploads files, processes metrics, generates AI narratives, and publishes weeks.
- Client: logs in and views published weekly dashboard sections for their own company.

The core concept implemented is:

1. Upload raw files (messy CSV/XLSX/JSON/text).
2. Parse and classify files.
3. Normalize rows into common trucking data types.
4. Calculate static dashboard metrics for five sections.
5. Save metrics and chart data in PostgreSQL.
6. Generate Groq narratives from clean section metrics.
7. Publish week for client dashboard access.

The dashboard reads only processed section JSON from DB, not raw files.

## 2. Tech Stack in This Repo

- Next.js App Router
- React + TypeScript
- Prisma + PostgreSQL
- Tailwind CSS
- ECharts (`echarts-for-react`)
- Groq API for narrative generation
- `xlsx` for file parsing
- `zod` for narrative output validation
- `bcryptjs` for password hashing

## 3. Folder Map

### Root

- `package.json`: scripts and dependencies
- `.env`: local environment values
- `.env.example`: template env values
- `README.md`: quick start
- `APP_WORKFLOW_GUIDE.md`: this deep guide
- `scripts/run-local.sh`: one-command local setup and run
- `uploads/`: stored uploaded source files by client/week

### Prisma

- `prisma/schema.prisma`: DB schema
- `prisma/seed.ts`: seed users, demo client, sample weeks/sections

### App Routes

- `src/app/login`: login screen
- `src/app/admin/*`: admin pages
- `src/app/client/*`: client pages
- `src/app/api/*`: API route handlers

### Core Libraries

- `src/lib/db/prisma.ts`: Prisma client singleton
- `src/lib/auth/*`: session and role guards
- `src/lib/groq/*`: Groq API client + narrative generation logic
- `src/lib/processing/*`: parsers, classifiers, normalizers, calculators, importers, narratives

### UI Components

- `src/components/layout/*`: header, logout, login form
- `src/components/charts/*`: bar/line/radar/heat/KPI chart components
- `src/components/dashboard/*`: narrative card, section renderer, dashboard view, admin actions/forms

## 4. Database Models

Defined in `prisma/schema.prisma`.

Main models:

- `User` (role: `ADMIN` or `CLIENT`, optional `clientId`)
- `Client`
- `ClientAssumption` (default MPG/fuel/maintenance/fixed costs)
- `ReportingWeek` (status lifecycle)
- `UploadedFile` (stored file path + classifier result/confidence)
- `DashboardSection` (metrics/chart/narrative JSON by section key)

Section keys:

- `EXECUTIVE_OVERVIEW`
- `TRUCK_PROFITABILITY`
- `LANE_PERFORMANCE`
- `DRIVER_PERFORMANCE`
- `COST_TRENDS`

Week statuses:

- `DRAFT`
- `FILES_UPLOADED`
- `PROCESSED`
- `NARRATIVES_GENERATED`
- `PUBLISHED`

## 5. Auth and Access Control

Implemented with signed cookie sessions (`ta_session`) in `src/lib/auth/session.ts`.

- Passwords are hashed with bcrypt.
- API routes enforce role checks using `requireApiRole`.
- Client API routes additionally ensure `week.clientId === user.clientId`.

Demo credentials seeded:

- Admin: `admin@test.com` / `admin123`
- Client: `client@test.com` / `client123`

## 6. Processing Pipeline (Implemented)

Entry point:

- `src/lib/processing/importers/processReportingWeek.ts`

Steps:

1. Load week + uploaded files + client assumptions.
2. Parse files (`parseUploadedFiles.ts`):
   - XLSX/XLS/CSV via `xlsx`
   - JSON arrays/objects
   - text fallback for unknown formats
3. Classify by keywords (`classifyParsedFiles.ts`):
   - `LOADS`, `FUEL`, `MAINTENANCE`, `DRIVERS`, `TRUCKS`, `SETTLEMENTS`, `UNKNOWN`
4. Save file classification/confidence in DB.
5. Normalize rows (`normalizeClassifiedFiles.ts`) into standard types.
6. Calculate five dashboard sections (`calculators/*`).
7. Upsert sections into `DashboardSection` JSON.
8. Set week status `PROCESSED`.
9. Return import result summary + warnings.

Missing-data behavior:

- No fuel file: estimate fuel cost from assumptions.
- No maintenance file: estimate maintenance cost.
- No driver data: driver insights marked limited.
- No previous week: week-over-week baselines default safely.

## 7. Narrative Pipeline (Implemented)

Entry point:

- `src/lib/processing/narratives/generateNarrativesForWeek.ts`

Steps:

1. Load current week sections and previous week sections.
2. For each section, call `generateSectionNarrative`.
3. Prompt Groq with clean metrics JSON only.
4. Validate returned JSON with Zod.
5. Retry once if invalid JSON.
6. If still invalid/error, save fallback narrative.
7. Update week status to `NARRATIVES_GENERATED`.

Driver narrative includes softer tone instruction.

## 8. Dashboard Sections and UI

UI reads section JSON from DB and renders by `sectionKey` in:

- `src/components/dashboard/SectionRenderer.tsx`

Implemented visuals include:

- KPI cards
- Revenue/profit trend line
- Truck profitability bar + table
- Lane heat table
- Driver score bar + radar
- Cost trend lines + maintenance bars
- Narrative card with risk badge (`LOW/MEDIUM/HIGH`)

## 9. API Endpoints

### Auth

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Admin

- `GET /api/admin/clients`
- `POST /api/admin/clients`
- `GET /api/admin/clients/:clientId`
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

## 10. Upload File Storage

Uploads are saved locally under:

- `uploads/client-{clientId}/week-{YYYY-MM-DD}/...`

Each uploaded file is also recorded in `UploadedFile` model.

## 11. How to Run the App

From project root:

```bash
./scripts/run-local.sh
```

The script:

1. Moves to repo root
2. Checks `.env`
3. Installs dependencies if needed
4. Runs Prisma migrate
5. Runs seed
6. Starts `next dev`

App URL:

- `http://localhost:3000`

## 12. Typical Usage Flow

### Admin Flow

1. Log in as admin
2. Open `/admin/clients`
3. Create/select a client
4. Create a reporting week
5. Upload files for the week
6. Click `Process Data`
7. Click `Generate Narratives`
8. Click `Publish`
9. Preview section output on week page

### Client Flow

1. Log in as client
2. Open `/client/dashboard`
3. Select a published week
4. Review five sections and narratives
5. Optionally compare to another week via compare controls

## 13. Current Limits (Known)

- No OCR/PDF extraction beyond plain text fallback
- No NextAuth/enterprise auth (simple local cookie auth only)
- No background queue jobs; processing is request-triggered
- No production deployment settings in this repo
- Client compare UI currently signals comparison context; deeper section-level merged compare visuals can be expanded later

## 14. Important Files to Modify for Future Iterations

- Add parser intelligence: `src/lib/processing/parsers/parseUploadedFiles.ts`
- Improve classifier: `src/lib/processing/classifiers/classifyParsedFiles.ts`
- Refine business formulas: `src/lib/processing/calculators/*`
- Adjust AI prompt behavior: `src/lib/groq/generateNarrative.ts`
- Add persisted normalized tables (future): `prisma/schema.prisma`
- Expand dashboard visuals: `src/components/dashboard/SectionRenderer.tsx`

## 15. Environment Variables Used

Required in `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/trucking_analytics"
GROQ_API_KEY="replace_with_your_real_groq_api_key"
SESSION_SECRET="truckapp-local-session-secret-2026"
```

If `GROQ_API_KEY` is missing/invalid, narrative generation falls back to default narrative text.

