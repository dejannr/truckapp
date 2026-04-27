# Codex Instructions: Improve Trucking Analytics Dashboard Metrics + Comparison UX

## Context

This app is a local-first trucking analytics MVP for small trucking companies with roughly 3–20 trucks, usually around 10–12 trucks.

Existing stack:

- Next.js App Router + React + TypeScript
- PostgreSQL + Prisma
- Tailwind
- Apache ECharts
- Groq narratives
- Admin/client roles
- Weekly reporting workflow
- 5 dashboard sections stored as static JSON in `DashboardSection`
- Existing compare API: `GET /api/client/dashboard/compare?weekId=...&compareWeekId=...`

Current product issue:

The dashboard feels too focused on **current week vs previous week**. Desired behavior:

1. By default, show **only selected week data**.
2. Do **not** show comparison deltas, previous-week labels, or previous-week overlays by default.
3. Only after the user explicitly selects a comparison week should the dashboard show comparison data.
4. Add more useful trucking metrics that are valuable to fleet owners.

---

# Primary Product Change

## New Dashboard Rule

The dashboard has two modes.

### 1. Single Week Mode — default

Used when the client/admin opens a dashboard week normally.

Example URLs:

```txt
/client/dashboard/[weekId]
/admin/clients/[clientId]/weeks/[weekId]
```

Behavior:

- Show only data for the selected week.
- No previous-week comparison by default.
- No automatic "vs last week" cards.
- No percent change badges unless a comparison week is selected.
- AI narratives should describe the selected week only.
- Chart titles should say things like:
  - "This Week Revenue"
  - "Truck Profitability"
  - "Lane Performance"
- Avoid wording like:
  - "up/down vs previous week"
  - "compared to last week"
  - "week-over-week"
  - unless comparison mode is active.

### 2. Comparison Mode — optional

Used only when the user selects a comparison week.

Behavior:

- User selects `Compare with: [another week]`.
- Dashboard fetches comparison data.
- Show comparison-specific:
  - deltas
  - percentage changes
  - previous-week overlays
  - side-by-side values
  - comparison AI narrative
- The comparison week does not have to be the immediately previous week. It can be any published week for that client.
- Label the compared week clearly:
  - `Selected Week: Mar 16–22, 2026`
  - `Compared With: Mar 9–15, 2026`

---

# UX Requirements

## Add a Compare Control

In the dashboard header, add:

```txt
Viewing: [Selected Week Dropdown]
Compare with: [No comparison] [Week Dropdown]
```

Default value:

```txt
Compare with: No comparison
```

Only when the user selects a week from the comparison dropdown should the app call the comparison API.

## Clear Comparison State

Add a button/link:

```txt
Clear comparison
```

When clicked:

- Reset compare week to `null`.
- Return UI to single week mode.
- Remove comparison badges/overlays.

## Prevent Bad Comparison Choices

Do not allow comparing the selected week with itself.

If user selects same week:

- Disable that option, or
- Show a small validation message.

---

# API Behavior Changes

## Current single-week endpoint

Keep using:

```txt
GET /api/client/dashboard?weekId=...
GET /api/admin/weeks/:weekId/dashboard
```

This should return selected week data only.

Do not include previous-week data automatically.

## Comparison endpoint

Keep or improve:

```txt
GET /api/client/dashboard/compare?weekId=...&compareWeekId=...
```

This should only be called when comparison is requested.

Recommended return shape:

```ts
type CompareDashboardResponse = {
  selectedWeek: ReportingWeekSummary;
  compareWeek: ReportingWeekSummary;
  selectedSections: DashboardSectionPayload[];
  compareSections: DashboardSectionPayload[];
  comparison: {
    sectionKey: string;
    metrics: Record<string, unknown>;
    chartOverlays?: Record<string, unknown>;
    narrative?: {
      title: string;
      summary: string;
      bullets: string[];
      actionItems: string[];
      riskLevel: "LOW" | "MEDIUM" | "HIGH";
    };
  }[];
};
```

Important:

- Comparison calculations should be created in a reusable comparison module.
- Do not mix comparison into the normal section calculator payload unless comparison mode is active.

Suggested new files:

```txt
src/lib/processing/comparison/compareDashboardSections.ts
src/lib/processing/comparison/compareExecutiveOverview.ts
src/lib/processing/comparison/compareTruckProfitability.ts
src/lib/processing/comparison/compareLanePerformance.ts
src/lib/processing/comparison/compareDriverPerformance.ts
src/lib/processing/comparison/compareCostTrends.ts
```

---

# Data Model Recommendation

No database schema change is required for this phase.

Keep storing static selected-week dashboard sections in:

```txt
DashboardSection.metrics
DashboardSection.chart
DashboardSection.narrative
```

Comparison can be computed dynamically from two already-processed weeks.

Optional later improvement:

Add saved comparison snapshots only if clients frequently reuse the same comparison views.

---

# New Useful Metrics to Add

The goal is to make the dashboard more useful to trucking companies, not just visually nicer.

Each section should answer a business question.

---

## Section 1: Executive Overview

### Purpose

Answer:

```txt
Did this fleet make good money this week, and what is the biggest issue?
```

### Keep existing metrics

- Total revenue
- Total profit
- Profit per truck
- Average rate per mile
- Deadhead %
- Fuel cost per mile

### Add these metrics

#### 1. Gross margin %

```txt
grossMarginPct = profit / revenue * 100
```

Shows if revenue is actually profitable.

#### 2. Revenue per truck

```txt
revenuePerTruck = totalRevenue / activeTruckCount
```

Small fleet owners think per-truck.

#### 3. Profit per mile

```txt
profitPerMile = totalProfit / totalMiles
```

Better than total profit because it normalizes performance.

#### 4. Loaded miles %

```txt
loadedMilesPct = loadedMiles / totalMiles * 100
```

Positive version of deadhead percentage.

#### 5. Average load value

```txt
averageLoadValue = totalRevenue / loadCount
```

Shows whether they are taking strong or weak loads.

#### 6. Loads per truck

```txt
loadsPerTruck = loadCount / activeTruckCount
```

Shows utilization.

#### 7. Estimated break-even rate per mile

```txt
breakEvenRatePerMile = totalCost / loadedMiles
```

Tells owner minimum rate they need to accept loads.

#### 8. Revenue above break-even

```txt
revenueAboveBreakEven = totalRevenue - totalCost
```

Same idea as profit, but useful when paired with break-even language.

### Suggested KPI cards

Use 8–10 cards max:

- Revenue
- Profit
- Gross Margin %
- Revenue / Truck
- Profit / Mile
- Avg Rate / Mile
- Break-even Rate / Mile
- Deadhead %
- Loads
- Fuel Cost / Mile

### AI narrative in single-week mode

Title:

```txt
Weekly Business Summary
```

Prompt should answer:

- Is this a profitable week?
- What is the strongest metric?
- What is the biggest risk?
- What should the owner focus on next week?

No comparison language unless comparison mode is active.

Example:

```txt
This was a profitable week with $42,800 revenue and a 17.5% gross margin. The strongest area was rate per mile, which stayed above the estimated break-even rate. The main risk is deadhead mileage at 18%, which is reducing profit per mile. Next week, focus on reducing empty miles and prioritizing loads above the break-even rate.
```

---

## Section 2: Truck Profitability

### Purpose

Answer:

```txt
Which trucks are making money, and which trucks are leaking money?
```

### Keep existing metrics

- Profit per truck
- Revenue per truck
- Costs per truck
- Cost per mile
- Deadhead %
- Ranking best to worst

### Add these metrics

#### 1. Profit per mile by truck

```txt
truckProfitPerMile = truckProfit / truckTotalMiles
```

Prevents long-mile trucks from looking better only because they drove more.

#### 2. Revenue per loaded mile by truck

```txt
truckRevenuePerLoadedMile = truckRevenue / truckLoadedMiles
```

Shows rate quality for each truck.

#### 3. Empty miles by truck

```txt
truckDeadheadMiles = truckTotalMiles - truckLoadedMiles
```

More concrete than only percentage.

#### 4. Utilization score

V1 formula:

```txt
utilizationScore = weighted score from:
- loadedMilesPct
- loadsCompleted
- revenuePerTruck
- onTimePct if available
```

Gives owner a simple truck ranking beyond profit only.

#### 5. Maintenance risk flag

V1 formula:

```txt
if truckMaintenanceCost > fleetAverageMaintenanceCost * 1.5 then HIGH
else if > fleetAverageMaintenanceCost * 1.2 then MEDIUM
else LOW
```

Surfaces trucks that may be expensive to keep running.

### Visuals

Add/keep:

- Ranked bar chart: profit per truck
- Table with conditional colors:
  - revenue
  - profit
  - profit/mile
  - cost/mile
  - deadhead %
  - utilization score
  - maintenance risk

Optional:

- Scatter chart:
  - X axis: total miles
  - Y axis: profit per mile
  - Bubble size: revenue
  - One point per truck

This is very useful because it shows if a truck is busy but not profitable.

### AI narrative in single-week mode

Title:

```txt
Truck Insights
```

Prompt should answer:

- Best truck this week and why
- Worst truck this week and why
- Any truck with high cost or high deadhead
- One recommended action

Example:

```txt
Truck 104 was the strongest performer with the highest profit per mile and low deadhead. Truck 109 generated revenue but had weak profit because its cost per mile was above the fleet average. Truck 106 should be reviewed because maintenance costs are materially higher than the rest of the fleet. Next week, prioritize higher-rate loads for the lowest-profit trucks and investigate high-cost units.
```

---

## Section 3: Lane / Route Performance

### Purpose

Answer:

```txt
Which lanes should the company run more, reduce, or avoid?
```

### Keep existing metrics

- Lane
- Number of loads
- Revenue
- Profit
- Rate per mile
- Average duration
- Best/worst lanes

### Add these metrics

#### 1. Profit per mile by lane

```txt
laneProfitPerMile = laneProfit / laneTotalMiles
```

Best metric for lane quality.

#### 2. Revenue per loaded mile by lane

```txt
laneRevenuePerLoadedMile = laneRevenue / laneLoadedMiles
```

Shows actual rate quality.

#### 3. Deadhead into lane / after lane

If data supports it, add:

```txt
deadheadBeforeLane
deadheadAfterLane
```

V1 fallback:

- Use available origin/destination sequence if possible.
- If not possible, omit and mark as unavailable.

A lane may look good but create bad repositioning.

#### 4. Average load value by lane

```txt
laneAverageLoadValue = laneRevenue / laneLoadCount
```

Easy for owners to understand.

#### 5. Lane consistency score

V1 formula:

```txt
laneConsistencyScore = based on:
- number of loads
- variance in rate per mile
- variance in profit per mile
```

A lane with one great load should not be treated as reliable.

#### 6. Lane recommendation label

Create a simple label:

```txt
RUN_MORE
MONITOR
REDUCE
AVOID
```

V1 rules:

```txt
RUN_MORE:
  laneProfitPerMile >= fleetAvgProfitPerMile * 1.15
  AND laneLoadCount >= 2

REDUCE:
  laneProfitPerMile < fleetAvgProfitPerMile * 0.85
  AND laneLoadCount >= 2

AVOID:
  laneProfitPerMile <= 0
  OR ratePerMile < breakEvenRatePerMile

MONITOR:
  default
```

### Visuals

Add/keep:

- Lane heat table with labels:
  - Run More
  - Monitor
  - Reduce
  - Avoid
- Bar chart: profit per mile by lane
- Optional map later; not required for V1.

### AI narrative in single-week mode

Title:

```txt
Lane Recommendations
```

Prompt should answer:

- Best lanes to run more
- Lanes that look risky
- Whether poor lane performance is due to low rate, high miles, deadhead, or cost
- One clear recommendation

Example:

```txt
The best lane this week was Dallas, TX → Atlanta, GA because it produced strong profit per mile and multiple loads, making it more reliable than one-off lanes. Chicago, IL → St. Louis, MO should be monitored because the rate per mile is close to break-even. The weakest lane was Phoenix, AZ → Las Vegas, NV due to low margin and high empty-mile impact. Next week, prioritize lanes with profit per mile above fleet average and avoid loads priced below break-even.
```

---

## Section 4: Driver Performance

### Purpose

Answer:

```txt
Which drivers are performing efficiently and where is coaching needed?
```

### Tone requirement

Driver insights should be written carefully. Avoid aggressive wording.

Use:

- review
- coach
- support
- improve consistency

Avoid:

- bad driver
- problem driver
- fire
- blame

### Keep existing metrics

- Revenue per driver
- Miles per driver
- Revenue per mile
- Fuel efficiency
- Idle time %
- On-time %
- Driver score / ranking

### Add these metrics

#### 1. Profit contribution by driver

```txt
driverProfit = revenueAssignedToDriver - costsAssignedToDriver
```

If cost assignment is not exact, estimate using truck cost allocation.

Revenue alone can be misleading.

#### 2. Profit per mile by driver

```txt
driverProfitPerMile = driverProfit / driverTotalMiles
```

Fair comparison between drivers.

#### 3. Loaded miles %

```txt
driverLoadedMilesPct = driverLoadedMiles / driverTotalMiles * 100
```

Shows productive driving.

#### 4. Revenue per loaded mile

```txt
driverRevenuePerLoadedMile = driverRevenue / driverLoadedMiles
```

Shows load quality assigned or accepted.

#### 5. Idle cost estimate

```txt
idleCostEstimate = idleHours * estimatedIdleFuelGallonsPerHour * fuelPrice
```

Suggested default:

```txt
estimatedIdleFuelGallonsPerHour = 0.8
```

Turns idle time into money.

#### 6. Driver efficiency score

Use a 0–100 score.

V1 weighted formula:

```txt
driverEfficiencyScore =
  30% profitPerMile score
  25% loadedMilesPct score
  20% fuelEfficiency score
  15% onTimePct score
  10% lowIdle score
```

If some data is missing, redistribute weight across available metrics.

### Visuals

Add/keep:

- Driver ranking table
- Radar chart only if it is readable and not too busy
- Bar chart: driver efficiency score
- Optional scatter:
  - X axis: miles
  - Y axis: profit per mile
  - Bubble size: revenue

### AI narrative in single-week mode

Title:

```txt
Driver Summary
```

Prompt should answer:

- Top driver and strength
- Driver needing review and why
- Whether issue appears assignment-related or behavior-related
- One soft recommendation

Example:

```txt
Mark had the strongest week based on profit per mile, loaded miles percentage, and fuel efficiency. Alex should be reviewed because idle time was higher than the fleet average, which increased estimated fuel cost. This may be partly assignment-related if Alex received more low-rate or deadhead-heavy loads. Next week, review load assignment balance and coach drivers with high idle cost.
```

---

## Section 5: Costs & Trends

### Purpose

Answer:

```txt
Where is the company losing money through costs?
```

### Keep existing metrics

- Fuel cost trend
- Maintenance cost
- Cost per mile trend
- Expense breakdown
- Cost spikes/anomalies

### Add these metrics

#### 1. Total operating cost

```txt
totalOperatingCost = fuelCost + maintenanceCost + driverPay + tolls + insuranceAllocation + otherCosts
```

Use only available costs. Estimated costs should be flagged.

#### 2. Cost per total mile

```txt
costPerTotalMile = totalOperatingCost / totalMiles
```

True operating efficiency.

#### 3. Cost per loaded mile

```txt
costPerLoadedMile = totalOperatingCost / loadedMiles
```

Useful for pricing loads.

#### 4. Fuel as % of revenue

```txt
fuelPctOfRevenue = fuelCost / revenue * 100
```

Simple fuel pressure metric.

#### 5. Maintenance cost per truck

Make prominent.

#### 6. Maintenance cost per mile

```txt
maintenanceCostPerMile = maintenanceCost / totalMiles
```

Normalizes maintenance across trucks.

#### 7. Fixed vs variable cost split

V1:

```txt
fixedCosts = insuranceAllocation + permits + truckPayments + subscriptions
variableCosts = fuel + maintenance + tolls + driverPay
```

If exact data unavailable, use assumptions and flag estimated values.

#### 8. Anomaly flags

Create flags like:

```txt
FUEL_SPIKE
MAINTENANCE_SPIKE
LOW_MARGIN
HIGH_DEADHEAD_COST
```

V1 rules:

```txt
FUEL_SPIKE:
  fuelCostPerMile > fleetFuelCostPerMileAvg * 1.2

MAINTENANCE_SPIKE:
  maintenanceCostForTruck > truckMaintenanceAvg * 1.5

LOW_MARGIN:
  grossMarginPct < targetGrossMarginPct

HIGH_DEADHEAD_COST:
  deadheadPct > targetDeadheadPct
```

Set default targets in assumptions:

```txt
targetGrossMarginPct = 15
targetDeadheadPct = 15
```

### Visuals

Add/keep:

- Cost breakdown bar/pie
- Fuel cost by truck
- Maintenance by truck
- Cost per mile by truck
- Anomaly cards

For single week mode, trend charts should only show historical context if explicitly designed as "last 4 weeks trend". But do not frame them as comparison unless compare mode is active.

Acceptable in single week mode:

```txt
Last 4 Published Weeks Cost Trend
```

Not acceptable by default:

```txt
This week vs previous week
```

### AI narrative in single-week mode

Title:

```txt
Cost Insights
```

Prompt should answer:

- Biggest cost category
- Any abnormal truck/cost
- Whether costs are estimated or actual
- One action

Example:

```txt
Fuel is the largest cost category this week and represents 31% of revenue. Truck 107 has the highest cost per mile, mainly due to fuel and maintenance allocation. Some maintenance values are estimated because no detailed maintenance file was uploaded. Next week, review Truck 107 and request actual maintenance records to improve accuracy.
```

---

# Comparison Mode Metrics

When comparison mode is active, add these comparison-specific metrics.

## Executive Overview Comparison

Show:

- Revenue delta
- Profit delta
- Gross margin delta
- Profit per mile delta
- Deadhead % delta
- Fuel cost per mile delta
- Load count delta

AI should explain:

- What improved
- What worsened
- Main reason
- Action

## Truck Profitability Comparison

Show:

- Which truck improved most
- Which truck declined most
- Profit per mile changes by truck
- Cost per mile changes by truck
- Deadhead % changes by truck

AI should explain:

- Truck-level movers
- Whether changes are due to revenue, cost, or empty miles

## Lane Performance Comparison

Show:

- Newly strong lanes
- Lanes that declined
- Lanes repeated across both weeks
- Profit per mile movement
- Rate per mile movement

AI should explain:

- Which lanes became more/less attractive
- Which lanes are consistently good or bad

## Driver Performance Comparison

Show:

- Driver score change
- Profit per mile change
- Idle time change
- On-time change

AI should explain softly:

- Who improved
- Who needs review
- Whether the issue is consistent or one-week-only

## Costs & Trends Comparison

Show:

- Fuel cost change
- Maintenance change
- Cost per mile change
- Cost category causing biggest movement
- Anomaly change

AI should explain:

- Which cost moved most
- Whether it looks operational, fuel-price-related, or maintenance-related

---

# Narrative Prompt Changes

## Current issue

Narratives currently load current sections + previous week sections.

Change this.

## Required behavior

### Single week narrative generation

Default narrative generation should use only the selected week section metrics.

Do not include previous week metrics.

Modify:

```txt
src/lib/processing/narratives/generateNarrativesForWeek.ts
src/lib/groq/generateNarrative.ts
```

Expected behavior:

```ts
generateNarrativesForWeek(weekId, options?: {
  mode?: "single" | "comparison";
  compareWeekId?: string;
})
```

Default:

```ts
mode = "single"
compareWeekId = undefined
```

### Comparison narrative generation

Create separate logic:

```txt
src/lib/groq/generateComparisonNarrative.ts
src/lib/processing/narratives/generateComparisonNarratives.ts
```

Comparison narratives should not overwrite the saved single-week narratives in `DashboardSection`.

For V1, comparison narratives can be generated dynamically on request and returned by the comparison endpoint.

Do not save comparison narratives unless needed later.

---

# UI Implementation Instructions

## Files to inspect first

```txt
src/components/dashboard/SectionRenderer.tsx
src/app/client/dashboard/[weekId]/page.tsx
src/app/admin/clients/[clientId]/weeks/[weekId]/page.tsx
src/app/api/client/dashboard/route.ts
src/app/api/client/dashboard/compare/route.ts
src/app/api/admin/weeks/[weekId]/dashboard/route.ts
```

## Add UI state

In client dashboard page:

```ts
const [compareWeekId, setCompareWeekId] = useState<string | null>(null);
const isComparisonMode = Boolean(compareWeekId);
```

Fetch logic:

```ts
if (!compareWeekId) {
  fetch(`/api/client/dashboard?weekId=${weekId}`)
} else {
  fetch(`/api/client/dashboard/compare?weekId=${weekId}&compareWeekId=${compareWeekId}`)
}
```

## SectionRenderer behavior

Update renderer props:

```ts
type SectionRendererProps = {
  section: DashboardSectionPayload;
  comparisonSection?: DashboardSectionPayload;
  comparisonMetrics?: Record<string, unknown>;
  isComparisonMode?: boolean;
};
```

Behavior:

- If `isComparisonMode === false`, render only selected week.
- If `isComparisonMode === true`, render deltas/overlays where available.
- Do not show empty comparison placeholders.

---

# Data Processing Improvements

## Add metric utility helpers

Create:

```txt
src/lib/processing/calculators/utils/safeMath.ts
```

Functions:

```ts
safeDivide(numerator, denominator, fallback = 0)
percent(numerator, denominator)
roundCurrency(value)
roundNumber(value, decimals = 2)
calculateDelta(current, previous)
calculatePctChange(current, previous)
```

## Add metric confidence flags

Each section should include a `dataQuality` object.

Example:

```ts
dataQuality: {
  actualFuelData: boolean;
  actualMaintenanceData: boolean;
  actualDriverData: boolean;
  estimatedFields: string[];
  missingFiles: string[];
  confidenceScore: number; // 0-100
}
```

Why:

AI narrative should mention when data is estimated.

Example:

```txt
Fuel costs are estimated because no fuel transaction file was uploaded.
```

This builds trust.

---

# Suggested Static Section JSON Shape

Each dashboard section should have a stable shape.

Example:

```ts
type DashboardSectionPayload = {
  sectionKey: DashboardSectionKey;
  metrics: {
    summary: Record<string, number | string | boolean | null>;
    rows?: Record<string, unknown>[];
    highlights?: {
      best?: Record<string, unknown>;
      worst?: Record<string, unknown>;
      risks?: Record<string, unknown>[];
      opportunities?: Record<string, unknown>[];
    };
    dataQuality?: {
      actualFuelData: boolean;
      actualMaintenanceData: boolean;
      actualDriverData: boolean;
      estimatedFields: string[];
      missingFiles: string[];
      confidenceScore: number;
    };
  };
  chart: {
    type: string;
    series: unknown[];
    options?: Record<string, unknown>;
  };
  narrative: {
    title: string;
    summary: string;
    bullets: string[];
    actionItems: string[];
    riskLevel: "LOW" | "MEDIUM" | "HIGH";
  };
};
```

Do not break current data immediately if existing renderer expects another shape.

Implement backwards-compatible mapping if needed.

---

# Admin Workflow Changes

On the admin week page:

## Process Data button

Should calculate and store single-week metrics only.

## Generate Narratives button

Should generate single-week narratives only.

## Preview Dashboard

Should open in single-week mode by default.

Add optional compare dropdown in preview later, but not required for V1.

---

# Acceptance Criteria

## Single Week Mode

- Opening a dashboard week shows selected week only.
- No previous-week comparison appears automatically.
- No WoW delta badges appear.
- AI narrative uses only selected week metrics.
- Dashboard still works if there is no previous week.

## Comparison Mode

- Compare dropdown defaults to `No comparison`.
- Selecting a comparison week fetches comparison endpoint.
- Deltas only appear after comparison week is selected.
- User can compare with any other published week.
- User can clear comparison.
- Selected week cannot be compared with itself.

## Metrics

Executive Overview includes:

- Revenue
- Profit
- Gross margin %
- Revenue/truck
- Profit/mile
- Avg rate/mile
- Break-even rate/mile
- Deadhead %
- Loads
- Fuel cost/mile

Truck Profitability includes:

- Revenue
- Profit
- Profit/mile
- Cost/mile
- Revenue/loaded mile
- Deadhead %
- Utilization score
- Maintenance risk

Lane Performance includes:

- Loads
- Revenue
- Profit
- Profit/mile
- Revenue/loaded mile
- Avg load value
- Consistency score
- Recommendation label

Driver Performance includes:

- Revenue
- Profit contribution
- Profit/mile
- Loaded miles %
- Revenue/loaded mile
- Fuel efficiency
- Idle cost estimate
- Driver efficiency score

Costs & Trends includes:

- Total operating cost
- Cost/total mile
- Cost/loaded mile
- Fuel % of revenue
- Maintenance/truck
- Maintenance/mile
- Fixed vs variable split
- Anomaly flags

## AI Narratives

- Every section has a single-week AI narrative.
- Narratives are short and actionable.
- Narratives mention missing/estimated data when relevant.
- Comparison narratives are separate and only generated/displayed in comparison mode.

---

# Priority Order for Codex

## Phase 1: Fix comparison behavior

1. Remove automatic previous-week comparison from default dashboard loading.
2. Add `No comparison` default in UI.
3. Only call compare endpoint when comparison week is selected.
4. Hide comparison badges/overlays unless comparison mode is active.
5. Update narrative generation to single-week by default.

## Phase 2: Add stronger metrics

1. Add safe math utilities.
2. Add new metrics to calculators.
3. Update section JSON payloads.
4. Update UI cards/tables/charts.
5. Add data quality/confidence object.

## Phase 3: Improve AI narratives

1. Update Groq prompts for single-week narratives.
2. Add separate comparison narrative function.
3. Make AI mention estimated/missing data.
4. Keep narratives short:
   - 1 summary paragraph
   - 3 bullets max
   - 2 action items max

## Phase 4: Polish dashboard UX

1. Improve dashboard header.
2. Add selected week + compare week labels.
3. Add clear comparison button.
4. Add better tables with conditional formatting.
5. Add tooltips explaining metrics like break-even rate/mile and profit/mile.

---

# Important Product Principle

The dashboard should not feel like a generic BI tool.

It should feel like:

```txt
A weekly decision system for a small trucking fleet owner.
```

Every section should help answer one of these:

- Did we make money?
- Which trucks made/lost money?
- Which lanes should we run more or avoid?
- Which drivers need support?
- Where are costs leaking?
- What should we do next week?
