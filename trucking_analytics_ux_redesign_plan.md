# Trucking Analytics UX Redesign Plan

## 1) Design Strategy

Use these principles across the whole app:

1. **Lead with decisions, not data**
   - Every section should answer: “What should the owner do this week?”
   - Metrics support the decision, not the other way around.

2. **Single-week mode stays clean**
   - The default dashboard must show only the selected week.
   - No comparison values, deltas, trend arrows, or extra columns unless comparison is active.

3. **Use owner-friendly language**
   - Avoid BI/logistics jargon.
   - Prefer “Money made per mile” over “RPM”.
   - Prefer “Best lanes” over “Lane profitability ranking”.

4. **Show fewer things by default**
   - Each section should show 3–5 important items.
   - Everything else goes behind “See details”.

5. **Separate summary from investigation**
   - Default view: cards, short tables, short explanations.
   - Detail view: expanded tables, secondary metrics, raw-ish data.

6. **Make problems obvious**
   - High costs, weak trucks, weak lanes, and risky drivers should be visually easy to spot.
   - Use plain warning language: “Fuel cost is high”, “Truck underperformed”, “Lane needs review”.

7. **Comparison should be optional and contained**
   - Comparison should not redesign the entire page.
   - Add one compare row/column only where useful.

8. **AI should sound like an operator**
   - AI narrative should explain what happened, why it matters, and what to do next.
   - Avoid generic summaries.

---

# 2) Information Architecture

## Single-Week Mode Layout

Keep the section order exactly:

1. Executive Overview  
2. Truck Profitability  
3. Lane Performance  
4. Driver Performance  
5. Costs & Trends  

Recommended page structure:

```tsx
<DashboardPage>
  <DashboardHeader />
  <WeekSelectorBar />
  <ExecutiveOverview />
  <TruckProfitability />
  <LanePerformance />
  <DriverPerformance />
  <CostsAndTrends />
</DashboardPage>
```

## Top Header Layout

At the top of the client dashboard:

```text
[Company Name] Weekly Fleet Report
Week: Mar 16–22, 2026
[Select week dropdown] [Compare with another week]
```

When comparison is inactive:

```text
Showing one week only
```

When comparison is active:

```text
Comparing Mar 16–22, 2026 vs Mar 9–15, 2026
[Clear comparison]
```

## Recommended Top-Level Page Layout

Use this order:

1. **Sticky dashboard header**
   - Company name
   - Selected week
   - Week selector
   - Compare selector

2. **Executive summary block**
   - AI-generated plain-English summary
   - 4 primary KPI cards
   - 3 “Needs attention” items

3. **Section cards**
   - Each section appears as a large card.
   - Each section has:
     - Title
     - One-line explanation
     - AI insight
     - 3–5 key data items
     - “See details” accordion

## Comparison Mode Without Clutter

Comparison should appear as an **optional secondary layer**, not a second dashboard.

When active:

- KPI cards show:
  - Current value
  - Previous value
  - Delta badge

- Tables add:
  - Previous value column only for the main metric
  - Change column

- Charts show:
  - Current week as main visual
  - Compared week as muted secondary visual

Do **not** duplicate entire sections.

## Hide Behind Progressive Disclosure

Put these behind “See details”:

- Full truck table
- Full lane table
- Full driver table
- Raw normalized records
- Secondary cost breakdowns
- Technical parsing confidence
- Data quality warnings
- Advanced metrics
- Chart configuration controls
- Anything with more than 5 rows by default

Recommended disclosure labels:

```text
See details
Hide details
Show all trucks
Show all lanes
Show all drivers
View cost breakdown
```

---

# 3) Section-by-Section Redesign

---

## 1. Executive Overview

### Purpose

Give the owner the weekly answer:

```text
Did we make money, what changed, and what needs attention?
```

### Show by Default

Max 5 items:

1. Total revenue
2. Estimated profit
3. Profit per mile
4. Total miles
5. Top 3 attention items

Recommended KPI cards:

```text
Revenue
Estimated Profit
Profit / Mile
Miles Run
```

Below KPI cards, show:

```text
Needs attention this week
1. Truck 104 had low profit per mile.
2. Fuel cost increased compared to the fleet average.
3. Dallas → Houston lane underperformed.
```

### Collapse Under “See Details”

- Revenue breakdown
- Loaded vs empty miles
- Average rate per mile
- Total loads
- Data quality notes
- Week processing metadata

### AI Narrative Display

Use a prominent summary card above KPIs.

Format:

```text
This week in plain English

Your fleet had a solid revenue week, but profit was held back by higher fuel and one underperforming truck. The biggest opportunity is to review Truck 104 and avoid the Dallas → Houston lane unless the rate improves.

Recommended actions:
1. Review Truck 104 costs before assigning next week’s loads.
2. Push for a higher rate on Dallas → Houston.
3. Watch fuel spend on long-haul runs.
```

### Recommended Chart/Table Type

- No chart by default unless needed.
- Use a small “Revenue vs Costs” horizontal bar only if costs are available.

Chart type:

```text
ECharts horizontal stacked bar
Revenue | Fuel | Maintenance | Driver Pay | Other Costs | Estimated Profit
```

### Remove as Noise

Remove from default executive view:

- Too many ratios
- Raw load counts unless important
- Technical metric names
- Dense multi-chart grid
- Comparison deltas when comparison inactive
- Long AI paragraphs

---

## 2. Truck Profitability

### Purpose

Help owner answer:

```text
Which trucks are making money and which trucks need attention?
```

### Show by Default

Max 4 items:

1. Best truck by estimated profit
2. Weakest truck by estimated profit
3. Average profit per truck
4. Top 5 truck table

Default table columns:

```text
Truck
Revenue
Estimated Profit
Profit / Mile
Status
```

Status examples:

```text
Good
Watch
Needs Review
```

### Collapse Under “See Details”

- Full truck table
- Fuel cost by truck
- Maintenance cost by truck
- Loaded miles
- Empty miles
- Loads count
- Revenue per mile
- Cost per mile
- Driver assigned
- Notes/anomalies

### AI Narrative Display

Place AI insight above table, inside the section card.

Format:

```text
Truck insight

Truck 108 was your strongest truck this week, mostly because it had strong revenue and controlled costs. Truck 104 needs review because profit per mile was below the fleet average.
```

Use max 2–3 sentences.

### Recommended Chart/Table Type

Default:

```text
Horizontal bar chart: Estimated Profit by Truck
```

Then table underneath.

Chart rules:

- Show max 8 trucks by default.
- Sort highest profit to lowest.
- Highlight negative profit using red semantic style.

### Remove as Noise

Remove from default truck section:

- Large multi-metric truck cards for every truck
- Technical fields like normalized truck ID confidence
- Empty mile percentage unless it is bad
- Any per-truck metric that does not support a decision

---

## 3. Lane Performance

### Purpose

Help owner answer:

```text
Which lanes should we keep, renegotiate, or avoid?
```

### Show by Default

Max 5 items:

1. Best lane
2. Weakest lane
3. Most used lane
4. Average rate per mile
5. Top 5 lanes table

Default table columns:

```text
Lane
Loads
Revenue
Rate / Mile
Status
```

Status examples:

```text
Strong
Okay
Renegotiate
Avoid
```

### Collapse Under “See Details”

- Full lane table
- Profit by lane if available
- Cost per mile by lane
- Average miles
- Empty mile estimate
- Customer/broker if available
- Number of trucks used
- Notes

### AI Narrative Display

Format:

```text
Lane insight

Chicago → Detroit performed well this week because it had strong rate per mile and repeat volume. Dallas → Houston should be reviewed because the rate was low compared with your average.
```

Add action line:

```text
Action: Try to increase Dallas → Houston by at least $0.30/mile or replace it with a stronger lane.
```

### Recommended Chart/Table Type

Default chart:

```text
Bubble chart or horizontal bar chart
```

Prefer horizontal bar for simplicity:

```text
Rate / Mile by Lane
```

For small fleets, avoid complex scatter plots unless hidden in details.

Default table should be primary.

### Remove as Noise

Remove from default lane section:

- Too many lane dimensions
- Map-style visuals unless already implemented well
- Technical route normalization details
- Long tail of one-off lanes
- Lanes with only one load should be grouped separately in details

---

## 4. Driver Performance

### Purpose

Help owner answer:

```text
Which drivers are reliable, efficient, and costing too much?
```

### Show by Default

Max 5 items:

1. Top driver by revenue or profit contribution
2. Driver needing review
3. Average miles per driver
4. Average loads per driver
5. Top 5 driver table

Default table columns:

```text
Driver
Loads
Miles
Revenue
Status
```

If profit by driver exists, use:

```text
Driver
Loads
Miles
Estimated Profit
Status
```

### Collapse Under “See Details”

- Fuel efficiency by driver, if reliable
- On-time percentage, if available
- Incidents/notes
- Truck assigned
- Cost per mile
- Empty miles
- Maintenance associated with driver/truck
- Full driver ranking

### AI Narrative Display

Format:

```text
Driver insight

Mark had the strongest week based on miles and revenue. John needs review because his assigned truck had high fuel cost and lower profit per mile.
```

Avoid sounding accusatory.

Use careful wording:

```text
Needs review
```

instead of:

```text
Bad driver
```

### Recommended Chart/Table Type

Default:

```text
Ranked table
```

Optional chart:

```text
Horizontal bar: Revenue or Profit by Driver
```

Do not show more than one chart by default.

### Remove as Noise

Remove from default driver section:

- Driver score formulas
- Overly precise rankings
- Safety assumptions unless data exists
- Blame-heavy language
- Too many columns

---

## 5. Costs & Trends

### Purpose

Help owner answer:

```text
Where did the money go this week?
```

### Show by Default

Max 5 items:

1. Total fuel cost
2. Maintenance cost
3. Driver pay
4. Cost per mile
5. Biggest cost increase or biggest cost problem

Default cards:

```text
Fuel
Maintenance
Driver Pay
Cost / Mile
```

### Collapse Under “See Details”

- Full cost category breakdown
- Cost by truck
- Cost by driver
- Fuel gallons
- Fuel price per gallon
- Maintenance notes
- Other costs
- Weekly trend chart
- Comparison-only changes

### AI Narrative Display

Format:

```text
Cost insight

Fuel was the largest cost this week. Maintenance was concentrated on Truck 104, which also reduced that truck’s profitability.
```

If comparison active:

```text
Compared with the selected week, fuel cost increased by $820. Check whether this came from more miles, higher fuel price, or lower MPG.
```

### Recommended Chart/Table Type

Default chart:

```text
Donut chart: Cost breakdown by category
```

Alternative if donut feels too BI-heavy:

```text
Horizontal stacked bar: Cost breakdown
```

For small fleet owners, horizontal stacked bar is usually easier.

Default table:

```text
Cost Category
Amount
Share of Costs
Status
```

### Remove as Noise

Remove from default costs section:

- Multi-period trend charts when comparison inactive
- Overly granular cost categories
- Tiny chart labels
- Technical names like “operating expense bucket”
- Any cost metric not tied to action

---

# 4) KPI Card Rules

## KPI Card Structure

Use this exact layout:

```text
[Label]
[Main value]

[Short helper text]

[Comparison row only if active]
```

Example single-week:

```text
Estimated Profit
$12,430

After fuel, maintenance, and driver pay
```

Example comparison active:

```text
Estimated Profit
$12,430

After fuel, maintenance, and driver pay

+$1,120 vs Mar 9–15
```

## KPI Card Component Structure

Recommended props:

```ts
type KpiCardProps = {
  label: string
  value: string
  helper?: string
  compareValue?: string
  deltaValue?: string
  deltaDirection?: "up" | "down" | "flat"
  sentiment?: "positive" | "negative" | "neutral"
  isLowerBetter?: boolean
}
```

## Main Value Rules

Use owner-friendly formatting:

```text
$42,800
$2.31 / mile
1,840 miles
24 loads
```

Avoid:

```text
$42,800.423
2.314998 RPM
```

## Compare Value Rules

Only show compare when active.

Use this format:

```text
+$1,120 vs Mar 9–15
-$0.18 / mile vs Mar 9–15
No change vs Mar 9–15
```

Do not show comparison placeholders in single-week mode.

## Delta Style Rules

Use badge style:

```text
↑ +8%
↓ -5%
→ No change
```

But pair icon with text, never color alone.

## Color Semantics

Use semantic logic, not raw up/down logic.

### For Revenue/Profit Metrics

Higher is better.

| Change | Meaning | Color |
|---|---|---|
| Up | Good | Green |
| Down | Bad | Red |
| Flat | Neutral | Gray |

Examples:

```text
Revenue up = green
Profit down = red
Profit / Mile up = green
```

### For Cost Metrics

Lower is better.

| Change | Meaning | Color |
|---|---|---|
| Up | Bad | Red |
| Down | Good | Green |
| Flat | Neutral | Gray |

Examples:

```text
Fuel cost up = red
Maintenance cost down = green
Cost / Mile down = green
```

### For Volume Metrics

Use neutral unless business impact is obvious.

Examples:

```text
Miles up = neutral
Loads up = neutral
Empty miles up = red
Loaded miles up = green
```

## Recommended Colors

Use Tailwind semantic classes:

```ts
positive: "text-emerald-700 bg-emerald-50 border-emerald-200"
negative: "text-red-700 bg-red-50 border-red-200"
neutral: "text-slate-600 bg-slate-50 border-slate-200"
warning: "text-amber-700 bg-amber-50 border-amber-200"
```

Do not use bright green/red backgrounds for full cards.

---

# 5) Table Simplification Rules

## General Table Rules

All section tables should follow this rule:

```text
Default table = max 5 rows + max 5 columns
Details table = full rows + optional columns
```

Default table should answer the section’s main question.

## Default Visible Columns

### Truck Table

```text
Truck
Revenue
Estimated Profit
Profit / Mile
Status
```

Optional details columns:

```text
Loads
Miles
Fuel Cost
Maintenance
Cost / Mile
Driver
Notes
```

Comparison mode columns:

```text
Truck
Estimated Profit
Previous Profit
Change
Status
```

---

### Lane Table

Default:

```text
Lane
Loads
Revenue
Rate / Mile
Status
```

Optional:

```text
Miles
Estimated Profit
Cost / Mile
Truck Count
Customer/Broker
Empty Mile Estimate
Notes
```

Comparison mode:

```text
Lane
Rate / Mile
Previous Rate / Mile
Change
Status
```

---

### Driver Table

Default:

```text
Driver
Loads
Miles
Revenue
Status
```

Optional:

```text
Estimated Profit
Truck
Fuel Cost
Cost / Mile
On-Time %
Notes
```

Comparison mode:

```text
Driver
Revenue
Previous Revenue
Change
Status
```

---

### Cost Table

Default:

```text
Cost
Amount
Share
Status
```

Optional:

```text
Previous Amount
Change
Truck
Driver
Notes
Source File
```

Comparison mode:

```text
Cost
Amount
Previous Amount
Change
Status
```

## Conditional Formatting Rules

Use subtle formatting:

### Good

```text
Green badge: Strong / Good / Improved
```

### Warning

```text
Amber badge: Watch / Review
```

### Bad

```text
Red badge: Needs Review / High Cost / Underperforming
```

## Do Not Do This

Avoid:

- Coloring entire table rows red/green
- Showing more than 2 numeric colors in one row
- Using only arrows without explanation
- Showing decimals beyond what owners need
- Using abbreviations without labels

## Numeric Formatting Rules

Use:

```text
$12,400
$2.31 / mile
1,240 mi
24 loads
18%
```

Avoid:

```text
$12,399.91
2.3142
1240.443 miles
```

---

# 6) Comparison UX Spec

## Compare Selector

Default state:

```text
[Compare with another week]
```

When clicked, open dropdown:

```text
Compare current week with:
[Select week]
```

Dropdown options:

```text
Mar 9–15, 2026
Mar 2–8, 2026
Feb 23–Mar 1, 2026
```

After selection:

```text
Comparing with Mar 9–15, 2026
[Clear comparison]
```

## Exact Labels

Use these labels:

```text
Selected week
Compare with
Compare with another week
Comparing with
Clear comparison
Showing one week only
Choose a different week to compare
```

## Same-Week Prevention

If user selects same week:

Show inline error:

```text
Choose a different week to compare.
```

Disable current week in dropdown:

```text
Mar 16–22, 2026 — Current week
```

## Clear Comparison

Use visible secondary button:

```text
Clear comparison
```

Click behavior:

- Remove comparison week from state/query params.
- Return all sections to single-week mode.
- Hide all delta badges and previous columns.

## Layout Stability

Do not rearrange cards between modes.

Single-week KPI:

```text
Revenue
$42,800
Total money from loads
```

Comparison KPI:

```text
Revenue
$42,800
Total money from loads
+$4,200 vs Mar 9–15
```

The card height may increase slightly, but the card should not move to a different grid area.

## URL State Recommendation

Use query params:

```text
/week/2026-W12
/week/2026-W12?compare=2026-W11
```

Or:

```text
?week=2026-W12&compareWeek=2026-W11
```

## Comparison Data Display Rules

Comparison active should add:

- KPI delta badges
- Previous value in tooltips or secondary line
- One comparison column in tables
- Muted previous week in charts

Comparison active should not add:

- Duplicate dashboard
- Duplicate section cards
- Two full tables side by side
- Multiple extra chart series unless essential

---

# 7) Copywriting / Microcopy

## Label Rewrite Examples

| Before | After |
|---|---|
| Executive Overview | Weekly Summary |
| Gross Revenue | Revenue |
| Net Profit Estimate | Estimated Profit |
| RPM | Rate / Mile |
| Profitability Ratio | Profit / Mile |
| Total Operational Mileage | Miles Run |
| Loaded Mileage | Loaded Miles |
| Deadhead Mileage | Empty Miles |
| Fuel Expense | Fuel Cost |
| Maintenance Expense | Maintenance Cost |
| Driver Compensation | Driver Pay |
| Cost Per Mile | Cost / Mile |
| Lane Profitability | Lane Performance |
| Asset Utilization | Truck Usage |
| Tractor Unit | Truck |
| Power Unit | Truck |
| Underperforming Asset | Truck Needs Review |
| Negative Variance | Down From Compared Week |
| Positive Variance | Up From Compared Week |
| Comparative Analysis | Week Comparison |
| Normalize Data | Clean Up Data |
| Data Ingestion | File Upload |
| Processing Complete | Report Ready |
| AI Narrative | Weekly Explanation |
| Publish Week | Share Report With Client |
| Anomaly Detected | Something Looks Off |
| No Comparative Period Selected | Showing One Week Only |

## Section Descriptions

Use these under section titles:

### Weekly Summary

```text
The most important numbers and issues from this week.
```

### Truck Profitability

```text
See which trucks made money and which need attention.
```

### Lane Performance

```text
See which lanes are worth keeping, renegotiating, or avoiding.
```

### Driver Performance

```text
See driver activity and performance for the week.
```

### Costs & Trends

```text
See where money was spent this week.
```

## Empty States

No data:

```text
No data found for this section.
Upload or process weekly files to see results.
```

No comparison:

```text
Showing one week only.
Choose another week if you want to compare performance.
```

No AI narrative:

```text
Weekly explanation has not been generated yet.
```

Processing:

```text
Building this week’s report…
```

Published:

```text
This report is visible to the client.
```

Unpublished:

```text
Only admins can see this report.
```

---

# 8) Accessibility + Readability

## Font Sizing Hierarchy

Use this hierarchy:

```ts
Page title: text-2xl md:text-3xl font-semibold
Section title: text-xl font-semibold
Card label: text-sm font-medium text-slate-600
KPI value: text-2xl md:text-3xl font-semibold
Body text: text-sm md:text-base
Helper text: text-xs md:text-sm text-slate-500
Table header: text-xs uppercase tracking-wide
Table cell: text-sm
Badge: text-xs font-medium
```

## Contrast Guidance

Use:

```text
Main text: slate-900
Secondary text: slate-600
Muted text: slate-500
Borders: slate-200
Card background: white
Page background: slate-50
```

Avoid:

- Light gray text under `slate-400` for important labels
- Color-only meaning
- Thin text for numbers
- Red/green without icons or labels

## Spacing Rules

Use consistent spacing:

```ts
Page container: max-w-7xl mx-auto px-4 md:px-6 py-6
Section spacing: mt-6 md:mt-8
Card padding: p-4 md:p-5
Card gap: gap-4
KPI grid gap: gap-4
Table cell padding: px-3 py-2
```

## Card Layout

Use:

```text
rounded-2xl
border border-slate-200
bg-white
shadow-sm
```

Avoid heavy shadows.

## Mobile Behavior Priorities

On mobile:

1. Header becomes stacked.
2. KPI cards become one column or two columns.
3. Tables become horizontally scrollable.
4. Show only top 3 rows by default.
5. Charts should appear after summary text, not before.
6. “See details” should remain collapsed by default.
7. Comparison selector should be full width.

Mobile table rule:

```tsx
<div className="overflow-x-auto">
  <table className="min-w-[640px]">
```

---

# 9) Developer Implementation Plan

## Phase 1: Quick UX Wins

Estimated scope: 1–2 days

### 1. Rename Labels

Component-level changes:

- Update section titles.
- Update KPI labels.
- Update table headers.
- Update empty states.

Files likely affected:

```text
components/dashboard/*
components/kpi/*
components/tables/*
lib/labels.ts
```

Expected impact:

```text
Dashboard immediately feels less technical and easier for owners.
```

Risk:

```text
Low
```

---

### 2. Hide Comparison by Default

Component-level changes:

- Only render comparison values if `compareWeekId` exists.
- Remove placeholder comparison UI from single-week mode.
- Hide delta badges in single-week mode.

Pseudo-condition:

```tsx
{compareWeek ? <DeltaBadge /> : null}
```

Expected impact:

```text
Reduces cognitive load in the default dashboard.
```

Risk:

```text
Low
```

---

### 3. Limit Default Tables

Component-level changes:

- Slice table data to top 5 rows by default.
- Add “See details” accordion for full table.
- Use default visible columns only.

Example:

```tsx
const visibleRows = isExpanded ? rows : rows.slice(0, 5)
```

Expected impact:

```text
Makes each section scannable.
```

Risk:

```text
Low
```

---

### 4. Add Section Descriptions

Component-level changes:

Add one-line helper text under each section title.

Example:

```tsx
<SectionHeader
  title="Truck Profitability"
  description="See which trucks made money and which need attention."
/>
```

Expected impact:

```text
Users understand each section faster.
```

Risk:

```text
Low
```

---

## Phase 2: Structural Improvements

### 1. Create Standard Section Card Component

Build reusable component:

```tsx
type DashboardSectionProps = {
  title: string
  description: string
  insight?: string
  children: React.ReactNode
  details?: React.ReactNode
}
```

Expected impact:

```text
Consistent layout across all dashboard sections.
```

Risk:

```text
Medium
```

---

### 2. Create Standard KPI Card Component

Implement semantic delta logic.

Props:

```tsx
type KpiCardProps = {
  label: string
  value: string
  helper?: string
  delta?: {
    value: string
    label: string
    sentiment: "positive" | "negative" | "neutral"
  }
}
```

Expected impact:

```text
Cleaner KPI display and consistent comparison behavior.
```

Risk:

```text
Medium
```

---

### 3. Add Comparison Selector Behavior

Component-level changes:

- Add compare dropdown.
- Disable current selected week.
- Add clear comparison button.
- Store comparison in URL query params.

Required copy:

```text
Compare with another week
Choose a different week to compare.
Clear comparison
```

Expected impact:

```text
Comparison becomes intentional instead of noisy.
```

Risk:

```text
Medium
```

---

### 4. Simplify Charts

Component-level changes:

- Executive: optional revenue vs cost stacked bar.
- Truck: horizontal profit bar.
- Lane: horizontal rate/mile bar.
- Driver: ranked table first, chart optional.
- Costs: horizontal stacked cost breakdown.

Expected impact:

```text
Charts become easier to understand and more decision-oriented.
```

Risk:

```text
Medium
```

---

## Phase 3: Polish

### 1. Improve AI Narrative Cards

Component-level changes:

- Add specific AI card component.
- Limit visible text to 2–4 sentences.
- Add recommended action list.

Component:

```tsx
type AiInsightCardProps = {
  title: string
  summary: string
  actions?: string[]
}
```

Expected impact:

```text
AI feels useful instead of decorative.
```

Risk:

```text
Low to Medium
```

---

### 2. Add Status Badges

Create reusable badge component:

```tsx
type StatusBadgeProps = {
  status: "Good" | "Watch" | "Needs Review" | "Strong" | "Renegotiate" | "Avoid"
}
```

Expected impact:

```text
Users can quickly spot what matters.
```

Risk:

```text
Low
```

---

### 3. Mobile Optimization

Component-level changes:

- Stack header controls.
- Make tables horizontally scrollable.
- Reduce default rows to 3 on small screens.
- Put charts below insight text.

Expected impact:

```text
Dashboard becomes usable on phones and tablets.
```

Risk:

```text
Medium
```

---

### 4. Empty and Loading States

Component-level changes:

Add standardized states:

```text
No data found for this section.
Weekly explanation has not been generated yet.
Building this week’s report…
```

Expected impact:

```text
App feels more stable and polished.
```

Risk:

```text
Low
```

---

# 10) Acceptance Criteria

## General Dashboard

- [ ] Default dashboard shows only selected week data.
- [ ] Comparison data is hidden unless user explicitly selects a comparison week.
- [ ] Section order remains: Executive, Truck, Lane, Driver, Costs.
- [ ] Each section has a title and one-line plain-English description.
- [ ] No default table has more than 5 rows.
- [ ] No default table has more than 5 columns.
- [ ] Every section has a “See details” option if more data exists.

## Executive Overview

- [ ] Executive section shows no more than 4 primary KPI cards.
- [ ] Executive section includes a plain-English AI summary.
- [ ] Executive section includes top 3 attention items when available.
- [ ] No technical metric labels appear in the default executive view.

## KPI Cards

- [ ] KPI cards show label, main value, and helper text.
- [ ] KPI cards do not show comparison placeholders in single-week mode.
- [ ] KPI cards show delta only when comparison is active.
- [ ] Cost metrics use reversed color semantics where lower is better.
- [ ] Delta badges include text/icon, not color alone.

## Tables

- [ ] Truck default table columns are: Truck, Revenue, Estimated Profit, Profit / Mile, Status.
- [ ] Lane default table columns are: Lane, Loads, Revenue, Rate / Mile, Status.
- [ ] Driver default table columns are: Driver, Loads, Miles, Revenue or Estimated Profit, Status.
- [ ] Cost default table columns are: Cost, Amount, Share, Status.
- [ ] Optional columns are hidden behind details.
- [ ] Tables remain readable on mobile using horizontal scroll.

## Comparison Mode

- [ ] Compare selector label says “Compare with another week”.
- [ ] Current selected week is disabled in compare dropdown.
- [ ] If same week is selected, user sees: “Choose a different week to compare.”
- [ ] Clear comparison button is visible when comparison is active.
- [ ] Clearing comparison removes all previous values, deltas, and compare columns.
- [ ] Layout remains stable when comparison is activated.

## AI Narrative

- [ ] AI narrative is shown as a card, not loose text.
- [ ] AI narrative uses plain business language.
- [ ] AI narrative is limited to 2–4 sentences by default.
- [ ] Recommended actions are shown as short bullets when available.
- [ ] AI copy avoids blame-heavy language about drivers.

## Copywriting

- [ ] “RPM” is replaced with “Rate / Mile”.
- [ ] “Deadhead Mileage” is replaced with “Empty Miles”.
- [ ] “Power Unit” is replaced with “Truck”.
- [ ] “Data Ingestion” is replaced with “File Upload”.
- [ ] “AI Narrative” is replaced with “Weekly Explanation”.
- [ ] “Comparative Analysis” is replaced with “Week Comparison”.

## Accessibility

- [ ] Important text uses at least `text-slate-600` or darker.
- [ ] Main KPI values use at least `text-2xl`.
- [ ] Color is never the only indicator of status.
- [ ] Badges include readable text.
- [ ] Cards use sufficient spacing and padding.
- [ ] Mobile layout stacks controls vertically.

## Visual Polish

- [ ] Cards use consistent `rounded-2xl border bg-white shadow-sm` styling.
- [ ] Page background uses a subtle neutral background.
- [ ] Charts do not dominate sections over summary text.
- [ ] Dense chart grids are removed from default view.
- [ ] Details are collapsed by default.
