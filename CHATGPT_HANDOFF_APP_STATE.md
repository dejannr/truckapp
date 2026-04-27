# Trucking Analytics App - Current State Handoff

Use this document to analyze what is already implemented and what can be added next.

## 1) Project Purpose

Local MVP web app for trucking-company weekly analytics.

Primary workflow:

1. Admin creates client + reporting week.
2. Admin uploads weekly files.
3. App parses/classifies/normalizes data.
4. App calculates 5 dashboard sections and saves static metrics.
5. App generates AI narratives (Groq) from section metrics.
6. Admin publishes week.
7. Client views only their own published dashboard.

## 2) Tech Stack (Implemented)

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma ORM
- Apache ECharts (`echarts-for-react`)
- Groq API for narratives
- `xlsx` parser for CSV/XLSX
- `zod` for narrative validation
- `bcryptjs` for password hashing

## 3) Roles and Access

### Admin

Can:

- log in
- create/list clients
- create reporting weeks
- upload files
- process week data
- generate narratives
- publish week
- preview dashboard on admin week page

### Client

Can:

- log in
- view own published weeks
- open dashboard by week
- use compare-week selection in UI

Security:

- Session cookie auth (custom signed cookie)
- Password hash stored, no plaintext
- API route role checks
- Client data access restricted by `clientId`

## 4) Database Schema (Implemented)

Models:

- `User` (`ADMIN` / `CLIENT`, optional `clientId`)
- `Client`
- `ClientAssumption` (default MPG/fuel/maintenance/fixed cost)
- `ReportingWeek` (`DRAFT`, `FILES_UPLOADED`, `PROCESSED`, `NARRATIVES_GENERATED`, `PUBLISHED`)
- `UploadedFile` (path, mime, classified `fileType`, confidence)
- `DashboardSection` (metrics JSON, chart JSON, narrative JSON)

Section keys:

- `EXECUTIVE_OVERVIEW`
- `TRUCK_PROFITABILITY`
- `LANE_PERFORMANCE`
- `DRIVER_PERFORMANCE`
- `COST_TRENDS`

## 5) API Surface (Implemented)

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

## 6) Data Pipeline (Implemented)

Entrypoint: `processReportingWeek(weekId)`

Flow:

1. Load week + files + assumptions.
2. Parse uploaded files (`parseUploadedFiles`).
3. Classify files by keyword heuristics (`classifyParsedFiles`).
4. Save file type + confidence in DB.
5. Normalize rows into internal types (`normalizeClassifiedFiles`).
6. Calculate 5 section metric payloads (`calculateDashboardSections`).
7. Upsert sections in `DashboardSection`.
8. Mark week as `PROCESSED`.

Missing data handling:

- no fuel file -> estimate fuel cost from assumptions
- no maintenance file -> estimate maintenance
- no driver file -> driver section marked limited
- no previous week -> safe defaults

## 7) Narrative Pipeline (Implemented)

Entrypoint: `generateNarrativesForWeek(weekId)`

Flow:

1. Load current sections + previous week sections.
2. For each section call Groq with section metrics only.
3. Validate AI response JSON with Zod.
4. Retry once if invalid JSON.
5. Save fallback narrative if still invalid/error.
6. Mark week as `NARRATIVES_GENERATED`.

## 8) Dashboard UI (Implemented)

Sections rendered from DB section JSON using reusable renderer.

Visuals in current app:

- KPI cards
- line charts (revenue/profit, cost trends)
- bar charts (truck profit, driver score, maintenance by truck)
- lane heat-style table
- optional radar in driver section
- narrative cards with risk level badge

Pages:

- `/login`
- `/admin/clients`
- `/admin/clients/new`
- `/admin/clients/[clientId]`
- `/admin/clients/[clientId]/weeks/[weekId]`
- `/client/dashboard`
- `/client/dashboard/[weekId]`

## 9) Demo Seed Data (Implemented)

Seed creates:

- admin user (`admin@test.com` / `admin123`)
- client user (`client@test.com` / `client123`)
- one demo client
- two reporting weeks
- detailed section metrics/chart/narrative data for both weeks
- demo uploaded files for both weeks under `uploads/`

## 10) What Is Not Yet Implemented

- OCR/PDF structured extraction (only basic text fallback)
- robust schema mapping per carrier template
- persisted normalized-row tables (currently sections stored as JSON)
- async background jobs/queues for processing and narratives
- advanced comparison overlay logic across all section visuals
- audit logs/import run history entities
- production auth/session hardening
- deployment/infra config
- automated tests (unit/integration/e2e)

## 11) Known Constraints

- Local-first development setup
- Processing triggered synchronously via API button clicks
- Classifier is heuristic and can misclassify edge-case files
- Calculators are V1 assumptions-based and intentionally simple

## 12) Key Files for Future Extension

- Parser: `src/lib/processing/parsers/parseUploadedFiles.ts`
- Classifier: `src/lib/processing/classifiers/classifyParsedFiles.ts`
- Normalizers: `src/lib/processing/normalizers/normalizeClassifiedFiles.ts`
- Calculators: `src/lib/processing/calculators/*`
- Process orchestrator: `src/lib/processing/importers/processReportingWeek.ts`
- Narrative prompt/validation: `src/lib/groq/generateNarrative.ts`
- Narrative orchestrator: `src/lib/processing/narratives/generateNarrativesForWeek.ts`
- UI section rendering: `src/components/dashboard/SectionRenderer.tsx`
- DB schema: `prisma/schema.prisma`
- Seed demo data: `prisma/seed.ts`

## 13) Suggested Prompt to ChatGPT

"Analyze this implemented trucking analytics MVP state. Propose prioritized improvements in 3 phases (quick wins, medium, advanced), including:

1. product features,
2. data quality and parsing robustness,
3. analytics/calculation correctness,
4. UI/UX improvements,
5. security/auth hardening,
6. testing strategy,
7. production architecture.

For each recommendation include expected impact, implementation complexity, and exact files/modules to change first."
