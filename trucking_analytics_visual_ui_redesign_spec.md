# Trucking Analytics App — Visual/UI Redesign Implementation Spec

**Role:** Senior Product Designer + UX Systems Architect  
**Scope:** Interface design system, visual language, layout polish, component styling, interaction details  
**Do not change:** product logic, data model, backend processing, section order, reporting flow, compare behavior

---

## 1) Visual Direction

### Concept A — Operational Command Center

| Attribute | Description |
|---|---|
| Mood / personality | Practical, calm, confident, dispatch-office inspired, highly readable |
| Visual feel | Light dashboard with strong white cards, slate neutrals, blue primary actions, subtle amber/red alerts |
| Best suited for | Small fleet owners who want clarity, not a flashy BI tool |
| Why it fits trucking owners | Feels like a weekly operating report. It prioritizes decisions, status, and exceptions without looking overly technical. |
| Pros | Very readable, easy to implement, strong accessibility, works well with dense tables/charts, professional but not corporate-heavy |
| Cons | Less visually distinctive than a premium/dark industrial product |

### Concept B — Premium Industrial Ledger

| Attribute | Description |
|---|---|
| Mood / personality | Premium, rugged, industrial, financial-report inspired |
| Visual feel | Off-white background, charcoal text, muted steel/green palette, stronger card borders, more editorial spacing |
| Best suited for | Owners who want the app to feel like a serious financial operating system |
| Why it fits trucking owners | Connects trucking operations with money discipline. Feels less like analytics software and more like a professional weekly business review. |
| Pros | More memorable, premium feel, strong business identity, good for client-facing reports |
| Cons | Slightly more styling effort, must avoid becoming too heavy or dark |

### Recommended Direction

**Choose Concept A: Operational Command Center.**

Reason:

- The app is local-first and practical for small fleets.
- The biggest UX problem is density and cognitive load, so readability beats visual drama.
- It is easier for a coding agent to implement safely without changing product logic.
- It supports tables, KPI cards, comparison mode, charts, and admin workflows with minimal complexity.
- It feels like a weekly decision system, not a generic BI product.

Use Concept B only as a later brand polish layer after the core UI is simplified.

---

## 2) Design Tokens

## 2.1 Color Tokens

### Human-Readable Token Table

| Token | Value | Usage |
|---|---:|---|
| `--color-primary-50` | `#eff6ff` | Primary subtle background |
| `--color-primary-100` | `#dbeafe` | Primary hover background |
| `--color-primary-500` | `#2563eb` | Main primary button |
| `--color-primary-600` | `#1d4ed8` | Primary button hover |
| `--color-primary-700` | `#1e40af` | Primary active / text |
| `--color-bg-page` | `#f8fafc` | App page background |
| `--color-bg-surface` | `#ffffff` | Cards, panels, table backgrounds |
| `--color-bg-subtle` | `#f1f5f9` | Subtle blocks, table header |
| `--color-bg-muted` | `#e2e8f0` | Disabled / muted surfaces |
| `--color-text-primary` | `#0f172a` | Main text |
| `--color-text-secondary` | `#475569` | Secondary text |
| `--color-text-muted` | `#64748b` | Helper text |
| `--color-text-disabled` | `#94a3b8` | Disabled text |
| `--color-border-subtle` | `#e2e8f0` | Card/table borders |
| `--color-border-strong` | `#cbd5e1` | Strong dividers / active borders |
| `--color-success-50` | `#ecfdf5` | Positive badge background |
| `--color-success-600` | `#059669` | Positive text/icon |
| `--color-success-700` | `#047857` | Positive strong text |
| `--color-warning-50` | `#fffbeb` | Warning badge background |
| `--color-warning-600` | `#d97706` | Warning text/icon |
| `--color-warning-700` | `#b45309` | Warning strong text |
| `--color-danger-50` | `#fef2f2` | Negative badge background |
| `--color-danger-600` | `#dc2626` | Negative text/icon |
| `--color-danger-700` | `#b91c1c` | Negative strong text |
| `--color-info-50` | `#eff6ff` | Info background |
| `--color-info-600` | `#2563eb` | Info text/icon |
| `--color-chart-current` | `#2563eb` | Current week chart series |
| `--color-chart-compare` | `#94a3b8` | Compared week chart series |
| `--color-chart-positive` | `#059669` | Positive chart segment |
| `--color-chart-negative` | `#dc2626` | Negative chart segment |
| `--color-chart-warning` | `#d97706` | Warning chart segment |

### CSS Variables Block

Paste into `app/globals.css` or equivalent global stylesheet:

```css
:root {
  /* Primary */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-500: #2563eb;
  --color-primary-600: #1d4ed8;
  --color-primary-700: #1e40af;

  /* Backgrounds */
  --color-bg-page: #f8fafc;
  --color-bg-surface: #ffffff;
  --color-bg-subtle: #f1f5f9;
  --color-bg-muted: #e2e8f0;

  /* Text */
  --color-text-primary: #0f172a;
  --color-text-secondary: #475569;
  --color-text-muted: #64748b;
  --color-text-disabled: #94a3b8;

  /* Borders */
  --color-border-subtle: #e2e8f0;
  --color-border-strong: #cbd5e1;

  /* Semantic */
  --color-success-50: #ecfdf5;
  --color-success-600: #059669;
  --color-success-700: #047857;
  --color-warning-50: #fffbeb;
  --color-warning-600: #d97706;
  --color-warning-700: #b45309;
  --color-danger-50: #fef2f2;
  --color-danger-600: #dc2626;
  --color-danger-700: #b91c1c;
  --color-info-50: #eff6ff;
  --color-info-600: #2563eb;

  /* Charts */
  --color-chart-current: #2563eb;
  --color-chart-compare: #94a3b8;
  --color-chart-positive: #059669;
  --color-chart-negative: #dc2626;
  --color-chart-warning: #d97706;
}
```

---

## 2.2 Typography Tokens

### Font Families

| Token | Value | Usage |
|---|---|---|
| `--font-sans` | `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` | Main UI |
| `--font-mono` | `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace` | IDs, debug, file processing details only |

### Type Scale

| Token | Size | Line Height | Weight | Usage |
|---|---:|---:|---:|---|
| `text-page-title` | `30px` | `36px` | `700` | Dashboard title desktop |
| `text-page-title-mobile` | `24px` | `32px` | `700` | Dashboard title mobile |
| `text-section-title` | `20px` | `28px` | `650` | Section title |
| `text-card-title` | `16px` | `24px` | `650` | Card title |
| `text-kpi-value` | `30px` | `36px` | `700` | KPI main value |
| `text-kpi-value-mobile` | `24px` | `32px` | `700` | KPI main value mobile |
| `text-body` | `14px` | `22px` | `400` | Main body text |
| `text-body-strong` | `14px` | `22px` | `600` | Important body text |
| `text-helper` | `13px` | `20px` | `400` | Helper text |
| `text-caption` | `12px` | `16px` | `500` | Badges, captions |
| `text-table` | `14px` | `20px` | `400` | Table cells |
| `text-table-header` | `12px` | `16px` | `650` | Table headers |

### CSS Variables Block

```css
:root {
  --font-sans: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;

  --text-page-title-size: 30px;
  --text-page-title-line: 36px;
  --text-page-title-weight: 700;

  --text-page-title-mobile-size: 24px;
  --text-page-title-mobile-line: 32px;

  --text-section-title-size: 20px;
  --text-section-title-line: 28px;
  --text-section-title-weight: 650;

  --text-card-title-size: 16px;
  --text-card-title-line: 24px;
  --text-card-title-weight: 650;

  --text-kpi-value-size: 30px;
  --text-kpi-value-line: 36px;
  --text-kpi-value-weight: 700;

  --text-kpi-value-mobile-size: 24px;
  --text-kpi-value-mobile-line: 32px;

  --text-body-size: 14px;
  --text-body-line: 22px;

  --text-helper-size: 13px;
  --text-helper-line: 20px;

  --text-caption-size: 12px;
  --text-caption-line: 16px;
}
```

---

## 2.3 Spacing Scale

Use a strict 4px base grid.

| Token | Value | Tailwind Equivalent | Usage |
|---|---:|---|---|
| `space-1` | `4px` | `1` | Tight icon/text gap |
| `space-2` | `8px` | `2` | Small internal gap |
| `space-3` | `12px` | `3` | Form/control gap |
| `space-4` | `16px` | `4` | Card internal spacing |
| `space-5` | `20px` | `5` | Section card padding mobile |
| `space-6` | `24px` | `6` | Card padding desktop |
| `space-8` | `32px` | `8` | Section vertical gap |
| `space-10` | `40px` | `10` | Large group gap |
| `space-12` | `48px` | `12` | Page major section gap |

### CSS Variables Block

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
}
```

---

## 2.4 Radius, Shadows, Strokes

| Token | Value | Usage |
|---|---:|---|
| `--radius-sm` | `6px` | Badges, small controls |
| `--radius-md` | `10px` | Inputs, buttons |
| `--radius-lg` | `14px` | Small cards |
| `--radius-xl` | `18px` | KPI cards |
| `--radius-2xl` | `24px` | Section cards / narrative cards |
| `--stroke-thin` | `1px` | Standard border |
| `--stroke-focus` | `2px` | Focus ring |
| `--shadow-sm` | `0 1px 2px rgba(15, 23, 42, 0.06)` | Cards |
| `--shadow-md` | `0 8px 24px rgba(15, 23, 42, 0.08)` | Sticky bars / dropdowns |
| `--shadow-lg` | `0 16px 40px rgba(15, 23, 42, 0.12)` | Menus/modals only |

```css
:root {
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 18px;
  --radius-2xl: 24px;

  --stroke-thin: 1px;
  --stroke-focus: 2px;

  --shadow-sm: 0 1px 2px rgba(15, 23, 42, 0.06);
  --shadow-md: 0 8px 24px rgba(15, 23, 42, 0.08);
  --shadow-lg: 0 16px 40px rgba(15, 23, 42, 0.12);
}
```

---

## 2.5 Z-Index Layers

| Token | Value | Usage |
|---|---:|---|
| `--z-base` | `0` | Page content |
| `--z-sticky` | `20` | Sticky dashboard controls |
| `--z-dropdown` | `40` | Week selectors / menus |
| `--z-toast` | `60` | Toasts |
| `--z-modal` | `80` | Modal dialogs |

```css
:root {
  --z-base: 0;
  --z-sticky: 20;
  --z-dropdown: 40;
  --z-toast: 60;
  --z-modal: 80;
}
```

---

## 2.6 Motion Tokens

| Token | Value | Usage |
|---|---:|---|
| `--duration-fast` | `120ms` | Hover/focus |
| `--duration-normal` | `180ms` | Buttons, cards, badges |
| `--duration-slow` | `240ms` | Accordions / compare activation |
| `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | Standard transitions |
| `--ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Entrance |
| `--ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Exit |

```css
:root {
  --duration-fast: 120ms;
  --duration-normal: 180ms;
  --duration-slow: 240ms;
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
}
```

---

## 3) Global Layout Spec

## 3.1 Page Container

Use a centered max-width layout.

```tsx
<main className="min-h-screen bg-slate-50">
  <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
    {/* content */}
  </div>
</main>
```

| Breakpoint | Container |
|---|---|
| Mobile `<640px` | `px-4 py-5` |
| Tablet `640–1024px` | `px-6 py-6` |
| Desktop `1024px+` | `max-w-7xl px-8 py-8` |

## 3.2 Dashboard Header

Desktop:

```text
Height: auto, min 72px
Layout: title left, actions right
Gap: 16px
Bottom margin: 20px
```

Tailwind:

```tsx
<header className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
```

## 3.3 Sticky Control Bar

The week/compare controls should be sticky below the app header.

```tsx
<div className="sticky top-0 z-20 mb-6 rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/75 md:p-4">
```

Dimensions:

| Breakpoint | Layout | Height |
|---|---|---:|
| Mobile | Stacked controls | Auto, usually 132–168px |
| Tablet | 2-column controls | Auto, usually 88–112px |
| Desktop | Single row | 72–88px |

## 3.4 Section Rhythm

```tsx
<div className="space-y-6 lg:space-y-8">
```

Each section shell:

```tsx
<section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5 lg:p-6">
```

## 3.5 Card Internal Padding

| Component | Mobile | Desktop |
|---|---:|---:|
| KPI card | `p-4` | `p-5` |
| Narrative card | `p-4` | `p-5` |
| Section card | `p-4` | `p-6` |
| Chart container | `p-4` | `p-5` |
| Empty state | `p-6` | `p-8` |

## 3.6 Global Tailwind Recommendations

Add or standardize these utility patterns:

```tsx
// Page surface
"bg-slate-50 text-slate-900 antialiased"

// Main card
"rounded-2xl border border-slate-200 bg-white shadow-sm"

// Subtle panel
"rounded-xl border border-slate-200 bg-slate-50"

// Muted helper text
"text-sm leading-5 text-slate-500"

// Interactive transition
"transition duration-150 ease-out"

// Focus ring
"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
```

---

## 4) Component-by-Component UI Spec

---

## 4.1 App Header

### Visual Anatomy

```text
[Product / Client Name]
[Report subtitle]
[right side admin/client actions]
```

Client dashboard header:

```text
Acme Trucking Weekly Report
Fleet performance for Mar 16–22, 2026
```

Admin header:

```text
Admin Dashboard
Manage clients, reporting weeks, uploads, and published reports
```

### Layout

```tsx
<header className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
  <div>
    <h1 className="text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
    <p className="mt-1 text-sm text-slate-600 md:text-base">
  </div>
  <div className="flex flex-wrap items-center gap-2">
</header>
```

### States

| State | Design |
|---|---|
| Default | White page background, no card wrapper |
| Loading company name | Skeleton title width `280px`, subtitle width `180px` |
| Admin preview mode | Show amber badge: `Previewing client report` |
| Published client report | Show green badge: `Published` |
| Unpublished admin report | Show gray badge: `Draft` |

### Microcopy Rules

Use:

```text
Weekly Report
Previewing client report
Report visible to client
Draft report
```

Avoid:

```text
BI Dashboard
Analytics Interface
Dataset View
```

---

## 4.2 Week / Compare Control Bar

### Visual Anatomy

```text
[Selected week dropdown] [Compare with dropdown] [Comparison status] [Clear comparison]
```

### Layout

Desktop:

```tsx
<div className="grid grid-cols-[minmax(220px,1fr)_minmax(220px,1fr)_auto] items-end gap-3">
```

Mobile:

```tsx
<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1fr)_minmax(220px,1fr)_auto]">
```

### Control Styling

```tsx
<label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
<select className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
```

### States

| State | Behavior |
|---|---|
| Single week | Show `Showing one week only` muted text |
| Compare active | Show blue info pill: `Comparing with Mar 9–15, 2026` |
| Same-week selected | Disable current option and show inline error |
| Loading weeks | Disable selectors, show skeleton or `Loading weeks…` |
| Error | Show red inline alert: `Could not load reporting weeks.` |

### Exact Microcopy

```text
Selected week
Compare with
Compare with another week
Showing one week only
Comparing with Mar 9–15, 2026
Clear comparison
Choose a different week to compare.
Loading weeks…
```

---

## 4.3 KPI Card

### Visual Anatomy

```text
[Small label]          [optional status badge]
[Large value]
[Helper text]
[Compare row if active]
```

### Base Styling

```tsx
<article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-150 ease-out hover:border-slate-300 md:p-5">
```

### Internal Spacing

```text
Label to value: 8px
Value to helper: 6px
Helper to compare row: 12px
```

### Single Mode Example

```text
Estimated Profit
$12,430
After fuel, maintenance, and driver pay
```

### Compare Mode Example

```text
Estimated Profit
$12,430
After fuel, maintenance, and driver pay
+$1,120 vs Mar 9–15
```

### KPI Card Variants

| Variant | Use | Styling |
|---|---|---|
| Default | Normal metric | White card |
| Positive | Good change | Green delta badge only, not full card |
| Negative | Bad change | Red delta badge only, not full card |
| Warning | Needs attention | Amber status badge |
| Neutral | Volume / unchanged | Gray badge |

### Delta Badge Styling

Positive:

```tsx
"inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700"
```

Negative:

```tsx
"inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700"
```

Neutral:

```tsx
"inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-600"
```

### Microcopy Rules

- Label: 1–3 words.
- Helper: max 1 line on desktop, max 2 lines mobile.
- Delta: always include compared week label.

Good:

```text
+$1,120 vs Mar 9–15
-$0.18 / mile vs Mar 9–15
No change vs Mar 9–15
```

Bad:

```text
+8.943% WoW delta variance
```

---

## 4.4 Narrative Card

### Visual Anatomy

```text
[Icon / label]
[Short narrative paragraph]
[Recommended actions list]
```

### Base Styling

```tsx
<div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 md:p-5">
```

### Single-Week Narrative

Title:

```text
This week in plain English
```

Body:

```text
Your fleet had a solid revenue week, but profit was held back by higher fuel and one underperforming truck.
```

Actions title:

```text
Recommended actions
```

### Comparison Narrative

Title:

```text
What changed compared with Mar 9–15
```

Body:

```text
Revenue improved, but fuel cost also increased. Profit improved only slightly because higher costs absorbed part of the revenue gain.
```

### Layout

```tsx
<div className="flex gap-3">
  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700" />
  <div className="min-w-0">
    <h3 className="text-sm font-semibold text-slate-950" />
    <p className="mt-1 text-sm leading-6 text-slate-700" />
  </div>
</div>
```

### States

| State | Copy / visual |
|---|---|
| Loading AI | Skeleton paragraph, title `Building weekly explanation…` |
| Missing AI | Gray card: `Weekly explanation has not been generated yet.` |
| Error | Red alert: `Could not generate weekly explanation.` |
| Compare active | Change title to comparison wording |

### Rules

- Max visible narrative: 120 words.
- Use 2–3 recommended actions max.
- Do not make the card taller than the KPI grid unless expanded.

---

## 4.5 Section Card Shell

### Visual Anatomy

```text
[Section title] [Optional status / compare badge]
[One-line section description]
[Top content grid: chart/table/cards]
[See details accordion]
```

### Base Styling

```tsx
<section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5 lg:p-6">
```

### Header Styling

```tsx
<div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
  <div>
    <h2 className="text-xl font-semibold tracking-tight text-slate-950" />
    <p className="mt-1 text-sm leading-5 text-slate-600" />
  </div>
</div>
```

### Section Descriptions

| Section | Description |
|---|---|
| Weekly Summary | `The most important numbers and issues from this week.` |
| Truck Profitability | `See which trucks made money and which need attention.` |
| Lane Performance | `See which lanes are worth keeping, renegotiating, or avoiding.` |
| Driver Performance | `See driver activity and performance for the week.` |
| Costs & Trends | `See where money was spent this week.` |

### Details Accordion Placement

Always at the bottom of the section:

```tsx
<div className="mt-4 border-t border-slate-200 pt-4">
  <button>See details</button>
</div>
```

---

## 4.6 Tables

### Default Table Styling

```tsx
<div className="overflow-hidden rounded-xl border border-slate-200">
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-slate-200">
```

Header:

```tsx
<thead className="bg-slate-50">
  <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
```

Cell:

```tsx
<td className="whitespace-nowrap px-3 py-3 text-sm text-slate-700">
```

First column:

```tsx
<td className="font-medium text-slate-950">
```

Numeric cells:

```tsx
<td className="text-right tabular-nums">
```

### Table Variants

| Variant | Usage | Max columns default |
|---|---|---:|
| Default | Section preview | 5 |
| Expanded | Details accordion | 8–10 |
| Comparison | Compare active | 5–6 |
| Admin processing | Upload/process diagnostics | 6–8 |

### Default Row Counts

| Section | Default max rows |
|---|---:|
| Weekly Summary attention items | 3 |
| Truck Profitability | 5 |
| Lane Performance | 5 |
| Driver Performance | 5 |
| Costs & Trends | 5 |

### Comparison Table Rules

Do not add many columns. Replace secondary metrics with comparison metrics.

Example:

```text
Truck | Estimated Profit | Previous Profit | Change | Status
```

### Row States

| State | Styling |
|---|---|
| Hover | `hover:bg-slate-50` |
| Selected | `bg-blue-50` + left border if needed |
| Warning | Use status badge, not full row color |
| Negative value | Red text only on value or badge |
| Empty | Empty state block, not blank table |

---

## 4.7 Chart Containers

### Base Styling

```tsx
<div className="rounded-xl border border-slate-200 bg-white p-4 md:p-5">
```

### Header Anatomy

```text
[Chart title]
[Optional helper text]
[Legend: Current week / Compared week]
```

### Chart Heights

| Breakpoint | Standard chart | Compact chart |
|---|---:|---:|
| Mobile | `260px` | `220px` |
| Tablet | `300px` | `240px` |
| Desktop | `340px` | `260px` |

### ECharts Visual Rules

Current week:

```ts
color: "#2563eb"
```

Compared week:

```ts
color: "#94a3b8"
lineStyle: { type: "dashed" }
```

Grid:

```ts
grid: { top: 24, right: 16, bottom: 32, left: 48 }
```

Tooltip:

```ts
trigger: "axis"
backgroundColor: "#ffffff"
borderColor: "#e2e8f0"
textStyle: { color: "#0f172a", fontSize: 12 }
```

Axis labels:

```ts
axisLabel: { color: "#64748b", fontSize: 12 }
```

Split line:

```ts
splitLine: { lineStyle: { color: "#e2e8f0" } }
```

### Chart Types

| Chart | Use | Styling |
|---|---|---|
| Bar | Truck/lane/driver ranking | Horizontal preferred |
| Line | Costs over time only if trend exists | Use current + compare if active |
| Heat | Only for lane intensity or weekly matrix | Keep behind details if complex |
| Donut | Cost share only | Avoid tiny labels; use side legend |

---

## 4.8 Status Badges

### Badge Anatomy

```text
[optional icon] Label
```

### Base Class

```tsx
"inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold leading-none"
```

### Variants

| Variant | Label examples | Class |
|---|---|---|
| Success | `Good`, `Strong`, `Improved`, `Published` | `border-emerald-200 bg-emerald-50 text-emerald-700` |
| Warning | `Watch`, `Review`, `Draft` | `border-amber-200 bg-amber-50 text-amber-700` |
| Danger | `Needs Review`, `High Cost`, `Underperforming` | `border-red-200 bg-red-50 text-red-700` |
| Neutral | `No Change`, `Not Compared`, `Unknown` | `border-slate-200 bg-slate-50 text-slate-600` |
| Info | `Comparing`, `Processing` | `border-blue-200 bg-blue-50 text-blue-700` |

### Rules

- Do not use more than 2 badges in one table row.
- Use badges for status, not for every number.
- Use owner-friendly labels.

---

## 4.9 Buttons

### Shared Button Base

```tsx
"inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
```

### Variants

| Variant | Usage | Class |
|---|---|---|
| Primary | Main action: process, publish, save | `bg-blue-600 text-white shadow-sm hover:bg-blue-700 active:bg-blue-800` |
| Secondary | Compare, preview, upload secondary | `border border-slate-300 bg-white text-slate-800 shadow-sm hover:bg-slate-50` |
| Ghost | Low emphasis: clear, cancel | `text-slate-700 hover:bg-slate-100` |
| Destructive | Delete, unpublish destructive | `bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-800` |
| Success | Optional publish confirmation | `bg-emerald-600 text-white hover:bg-emerald-700` |

### Sizes

| Size | Height | Padding | Text |
|---|---:|---:|---|
| Small | `32px` | `px-3` | `text-xs` |
| Default | `40px` | `px-4` | `text-sm` |
| Large | `44px` | `px-5` | `text-sm` |

### Microcopy Rules

Use action verbs:

```text
Upload files
Process week
Generate explanation
Publish report
Preview client dashboard
Clear comparison
See details
Hide details
```

Avoid vague labels:

```text
Submit
Run
Execute
Confirm operation
```

---

## 4.10 Empty State Blocks

### Base Styling

```tsx
<div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center md:p-8">
```

### Anatomy

```text
[Icon]
[Title]
[Short explanation]
[Optional action]
```

### Examples

No data:

```text
No data for this section
Upload or process weekly files to see results.
```

No comparison:

```text
Showing one week only
Choose another week if you want to compare performance.
```

No AI:

```text
Weekly explanation not generated yet
Generate the explanation before publishing the report.
```

No rows in details:

```text
No detailed rows found
The uploaded files did not include detailed records for this section.
```

---

## 4.11 Alerts, Warnings, Toasts

### Inline Alert Base

```tsx
<div className="rounded-xl border p-4 text-sm leading-6">
```

### Variants

| Variant | Class | Use |
|---|---|---|
| Info | `border-blue-200 bg-blue-50 text-blue-800` | Processing / compare active |
| Success | `border-emerald-200 bg-emerald-50 text-emerald-800` | Published / generated |
| Warning | `border-amber-200 bg-amber-50 text-amber-800` | Missing files / partial data |
| Error | `border-red-200 bg-red-50 text-red-800` | Failed processing |

### Toast Placement

```text
Top-right desktop
Bottom-center mobile
z-index: 60
Max width: 420px
```

### Toast Duration

| Toast | Duration |
|---|---:|
| Success | 3s |
| Info | 4s |
| Warning | 5s |
| Error | Persist until dismissed or 8s max |

---

## 5) Section-Level Screen Specs

---

## 5.1 Weekly Summary

### Default Composition Order

```text
1. Narrative card
2. KPI card grid: Revenue, Estimated Profit, Profit / Mile, Miles Run
3. Needs attention list
4. Optional revenue vs cost mini chart
5. See details accordion
```

### Above the Fold

Desktop should show:

```text
Header + control bar + narrative + KPI cards
```

Mobile should show:

```text
Header + selected week + narrative + first 2 KPI cards
```

### Chart/Table Placement

- KPI cards first.
- Attention list below KPI cards.
- Mini chart after attention list.
- No full table by default.

### See Details Location

Bottom of section after mini chart.

### Max Default Row Count

```text
Needs attention: 3 items
```

### Compare Mode Additions

- KPI cards gain delta row.
- Narrative title changes to `What changed compared with [week]`.
- Mini chart shows current and compared week as two horizontal bars.
- Layout position does not change.

### Visual Hierarchy Priorities

1. Narrative summary
2. Estimated profit
3. Profit / mile
4. Attention items
5. Revenue/miles

---

## 5.2 Truck Profitability

### Default Composition Order

```text
1. Section header
2. Short truck insight narrative
3. Two-column layout: chart left, top trucks table right
4. See details accordion
```

Desktop layout:

```tsx
<div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.9fr)]">
```

Mobile layout:

```text
Narrative → chart → table → details
```

### Above the Fold

Show:

```text
Section title + insight + profit by truck chart + top 5 truck table
```

### Chart/Table Placement

- Chart: horizontal bar `Estimated Profit by Truck`.
- Table: top 5 trucks.
- Chart appears before table on mobile.

### See Details Location

Below chart/table grid.

### Max Default Row Count

```text
5 trucks
```

### Compare Mode Additions

- Chart shows current bars with compared week as muted marker/secondary bar.
- Table columns become:

```text
Truck | Estimated Profit | Previous Profit | Change | Status
```

### Visual Hierarchy Priorities

1. Weak trucks needing attention
2. Best truck
3. Profit / mile
4. Fuel or maintenance causes only in details

---

## 5.3 Lane Performance

### Default Composition Order

```text
1. Section header
2. Lane insight narrative
3. Top lanes table
4. Rate / mile bar chart
5. See details accordion
```

Reason: lane names can be long, so table is often clearer than chart.

### Above the Fold

Show:

```text
Top 5 lane table + short insight
```

### Chart/Table Placement

Desktop:

```tsx
<div className="grid gap-4 lg:grid-cols-[minmax(460px,1fr)_minmax(0,0.9fr)]">
```

Left: table  
Right: chart

Mobile:

```text
Insight → table → chart → details
```

### See Details Location

Bottom of section.

### Max Default Row Count

```text
5 lanes
```

### Compare Mode Additions

Table columns:

```text
Lane | Rate / Mile | Previous Rate / Mile | Change | Status
```

Chart:

- Current week bars in blue.
- Compared week in muted gray.
- Keep same chart height.

### Visual Hierarchy Priorities

1. Lanes to keep
2. Lanes to renegotiate
3. Rate / mile
4. Loads count
5. One-off lanes hidden in details

---

## 5.4 Driver Performance

### Default Composition Order

```text
1. Section header
2. Driver insight narrative
3. Top driver table
4. Optional revenue/profit by driver bar chart
5. See details accordion
```

### Above the Fold

Show:

```text
Top 5 driver table
```

Driver section should be less visually aggressive to avoid blame-heavy UX.

### Chart/Table Placement

- Table first.
- Chart second or right side on desktop.
- If there are fewer than 3 drivers, hide chart and use KPI mini cards instead.

Desktop:

```tsx
<div className="grid gap-4 lg:grid-cols-[minmax(460px,1fr)_minmax(0,0.9fr)]">
```

### See Details Location

Bottom of section.

### Max Default Row Count

```text
5 drivers
```

### Compare Mode Additions

Table columns:

```text
Driver | Revenue | Previous Revenue | Change | Status
```

If profit is more reliable than revenue:

```text
Driver | Estimated Profit | Previous Profit | Change | Status
```

### Visual Hierarchy Priorities

1. Activity and reliability
2. Contribution to revenue/profit
3. Review signals
4. Avoid blame language

---

## 5.5 Costs & Trends

### Default Composition Order

```text
1. Section header
2. Cost insight narrative
3. Cost KPI mini cards: Fuel, Maintenance, Driver Pay, Cost / Mile
4. Cost breakdown chart
5. Cost category table
6. See details accordion
```

### Above the Fold

Show:

```text
Cost insight + 4 cost KPI cards
```

### Chart/Table Placement

Desktop:

```tsx
<div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,1fr)]">
```

Left: horizontal stacked cost chart  
Right: cost table

Mobile:

```text
Insight → KPI cards → chart → table → details
```

### See Details Location

Bottom of section.

### Max Default Row Count

```text
5 cost categories
```

### Compare Mode Additions

- Cost KPIs show deltas with inverted color semantics.
- Cost table columns:

```text
Cost | Amount | Previous Amount | Change | Status
```

### Visual Hierarchy Priorities

1. Biggest cost category
2. Cost / mile
3. Cost increase if comparison active
4. Truck/driver cost details hidden behind details

---

## 6) Interaction + Motion Spec

## 6.1 Hover States

| Element | Hover behavior |
|---|---|
| KPI card | Border changes `slate-200 → slate-300`; no lift required |
| Section card | No hover effect |
| Table row | `bg-slate-50` |
| Buttons | Background darkens or subtle gray fill |
| Links | Text blue-700 + underline |
| Chart data | Tooltip appears, cursor pointer only if clickable |

## 6.2 Focus States

All interactive elements:

```tsx
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
```

Focus ring must appear on:

- Buttons
- Selects
- Inputs
- Accordion triggers
- Table row actions
- Tabs if used
- Dropdown options

## 6.3 Active States

Buttons:

```text
Scale should not animate.
Use darker background only.
```

Class example:

```tsx
active:bg-blue-800
```

## 6.4 Accordion Open/Close Motion

Use height/opacity transition.

```tsx
transition-[height,opacity] duration-200 ease-out
```

Rules:

- Open duration: 200–240ms.
- Close duration: 160–200ms.
- Chevron rotates 180 degrees.
- Focus remains on the accordion trigger after toggle.

## 6.5 Skeleton / Loading Behavior

Use skeletons instead of spinners for dashboard content.

Skeleton class:

```tsx
"animate-pulse rounded-md bg-slate-200"
```

Loading patterns:

| Area | Skeleton |
|---|---|
| Header | Title line + subtitle line |
| KPI cards | 4 card skeletons |
| Narrative | 3 lines of text |
| Table | Header + 5 rows |
| Chart | Rounded rectangle + fake axis lines |

## 6.6 Chart Transitions

ECharts:

```ts
animationDuration: 300,
animationEasing: "cubicOut",
animationDurationUpdate: 250,
animationEasingUpdate: "cubicOut"
```

Disable complex animations for large tables or low-power devices.

## 6.7 Compare Mode Activated Transition

When compare week is selected:

- Control bar updates instantly.
- Delta badges fade in.
- Chart compared series fades in.
- Tables keep same position and only columns update.

CSS:

```tsx
"transition-opacity duration-200 ease-out"
```

Do not animate page layout with large movement.

## 6.8 Reduced Motion

Respect user settings:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 7) Responsive Spec

## 7.1 Breakpoints

Use Tailwind defaults:

| Name | Width |
|---|---:|
| Mobile | `<640px` |
| Tablet | `640px–1023px` |
| Desktop | `1024px+` |

---

## 7.2 Mobile Rules `<640px`

### KPI Grid

```tsx
grid grid-cols-1 gap-3
```

Optional for 4 compact KPIs:

```tsx
grid grid-cols-2 gap-3
```

Use one column if labels/values wrap.

### Tables

- Horizontal scroll.
- Minimum table width `640px`.
- Default max rows: 3 on mobile.
- Keep first column sticky only if implementation is simple.

```tsx
<div className="overflow-x-auto">
  <table className="min-w-[640px]">
```

### Charts

```text
Height: 240–260px
Legend below chart
Axis labels shortened
```

### Sticky Bar

- Sticky can remain enabled.
- Controls stack vertically.
- Buttons full width.

```tsx
button className="w-full sm:w-auto"
```

### Font Scaling

```text
Page title: 24px
KPI values: 24px
Section title: 20px
Body: 14px
```

---

## 7.3 Tablet Rules `640–1024px`

### KPI Grid

```tsx
grid grid-cols-2 gap-4
```

### Tables

- Horizontal scroll if more than 5 columns.
- Default rows: 5.

### Charts

```text
Height: 280–300px
```

### Sticky Bar

- Two-column layout.
- Compare status can wrap below controls.

---

## 7.4 Desktop Rules `1024px+`

### KPI Grid

```tsx
grid grid-cols-4 gap-4
```

If section has 3 KPIs:

```tsx
grid grid-cols-3 gap-4
```

### Tables

- No horizontal scroll for default tables.
- Expanded tables may scroll.

### Charts

```text
Standard height: 320–340px
Compact height: 240–260px
```

### Sticky Bar

- Single horizontal row.
- Compare status aligned right.

### Font Scaling

```text
Page title: 30px
KPI values: 30px
Section title: 20px
Body: 14px
```

---

## 8) Accessibility Spec

## 8.1 WCAG Contrast Targets

Minimum targets:

| Text / element | Target |
|---|---:|
| Normal text | 4.5:1 |
| Large text | 3:1 |
| Icons carrying meaning | 3:1 |
| Focus indicators | 3:1 against adjacent color |
| Disabled text | Can be lower, but must look clearly disabled |

Use slate-600 or darker for important text. Avoid slate-400 for body copy.

## 8.2 Keyboard Navigation Requirements

Must be keyboard accessible:

- Week selector
- Compare selector
- Clear comparison button
- See details accordion
- Table row action buttons
- Admin upload/process/generate/publish buttons
- Toast dismiss buttons

Tab order:

```text
Header actions → Selected week → Compare with → Clear comparison → Weekly Summary → Section details buttons
```

## 8.3 Focus Ring Style

Use consistent focus ring:

```tsx
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
```

For dark/colored buttons:

```tsx
focus-visible:ring-blue-500 focus-visible:ring-offset-2
```

## 8.4 ARIA Requirements

### Compare Controls

```tsx
<select aria-label="Select reporting week" />
<select aria-label="Compare with another reporting week" />
<button aria-label="Clear selected comparison week">Clear comparison</button>
```

Same-week error:

```tsx
<p id="compare-error" role="alert">Choose a different week to compare.</p>
<select aria-describedby="compare-error" />
```

### Accordions

```tsx
<button
  aria-expanded={isOpen}
  aria-controls="truck-details-panel"
>
  See details
</button>
<div id="truck-details-panel" hidden={!isOpen}>
```

### Charts

Every chart container must include:

```tsx
<div
  role="img"
  aria-label="Estimated profit by truck for Mar 16 to Mar 22, 2026"
>
```

Also provide a table fallback or same data in adjacent table.

### Tables

Use captions:

```tsx
<caption className="sr-only">
  Top 5 trucks by estimated profit for Mar 16 to Mar 22, 2026
</caption>
```

Column headers must use `<th scope="col">`.

## 8.5 Reduced Motion

- Disable chart animations when `prefers-reduced-motion: reduce`.
- Disable accordion height animation.
- Keep state changes instant.

## 8.6 Color-Blind-Safe Semantic Encoding

Never rely only on color.

Use:

```text
Green + ↑ + Improved
Red + ↓ + High Cost
Amber + ! + Watch
Gray + → + No Change
```

For cost metrics, use explicit labels:

```text
Fuel cost up — higher cost
Maintenance down — lower cost
```

---

## 9) Before vs After UI Improvement Checklist

| # | UI Area | Checklist Item | Pass/Fail Test |
|---:|---|---|---|
| 1 | Global | Page uses `bg-slate-50` with white cards | Background and cards are visually distinct |
| 2 | Global | All section cards use consistent `rounded-2xl border shadow-sm` styling | Every section has the same shell style |
| 3 | Header | Dashboard title and subtitle follow defined type scale | Title is 24px mobile / 30px desktop |
| 4 | Control bar | Week and compare controls are sticky and visually grouped | Controls remain visible at top while scrolling |
| 5 | Control bar | Single-week state shows `Showing one week only` | No empty compare placeholders appear |
| 6 | Compare | Current selected week is disabled in compare dropdown | User cannot compare a week to itself |
| 7 | KPI cards | KPI cards show label, value, helper, and optional delta only | No card shows comparison row unless compare active |
| 8 | KPI cards | Cost deltas use inverted semantic coloring | Fuel cost up appears red, fuel cost down appears green |
| 9 | Narrative | AI narrative appears in a distinct blue-tinted card | Narrative is visually separate from KPI cards |
| 10 | Narrative | Narrative text is capped visually to a short summary | No long wall of AI text appears by default |
| 11 | Tables | Default tables show max 5 columns | No preview table has more than 5 columns |
| 12 | Tables | Default tables show max 5 rows desktop and max 3 rows mobile | Tables do not dominate the section |
| 13 | Tables | Expanded details are hidden behind `See details` | Full detail table is not visible by default |
| 14 | Tables | Numeric values use `tabular-nums` and right alignment | Columns scan cleanly |
| 15 | Charts | Current week and compared week use consistent chart colors | Current is blue, compared is muted gray |
| 16 | Charts | Chart containers have title, helper, and accessible label | Screen reader has chart description |
| 17 | Badges | Status badges use text plus color | No status depends on color alone |
| 18 | Buttons | Buttons use consistent primary/secondary/ghost/destructive variants | No random button styles remain |
| 19 | Loading | Dashboard uses skeletons instead of layout jumps/spinners | Loading state preserves page structure |
| 20 | Mobile | Tables are horizontally scrollable and do not break layout | Mobile width does not overflow page |

---

## 10) Implementation Blueprint for Developer Agent

## Phase 1 — Quick Visual Wins

**Goal:** Improve readability and consistency without changing layout logic.  
**Risk:** Low

### Files

```text
app/globals.css
tailwind.config.ts
components/ui/Button.tsx
components/ui/Badge.tsx
components/ui/Card.tsx
components/dashboard/KpiCard.tsx
components/dashboard/SectionCard.tsx
components/dashboard/WeekCompareControls.tsx
```

### Tasks

1. Add CSS variables from this spec to `globals.css`.
2. Set global body classes:

```tsx
className="bg-slate-50 text-slate-900 antialiased"
```

3. Standardize cards:

```tsx
rounded-2xl border border-slate-200 bg-white shadow-sm
```

4. Standardize button variants.
5. Standardize badge variants.
6. Update KPI card spacing, value typography, helper text, delta badge styling.
7. Ensure compare delta only renders when compare week exists.
8. Add focus ring classes to all buttons/selects.

### Expected Impact

- App immediately feels cleaner and more professional.
- Reduced visual inconsistency.
- No backend/data risk.

---

## Phase 2 — Dashboard Layout System

**Goal:** Make sections feel structured and stable across single/compare mode.  
**Risk:** Medium-low

### Files

```text
components/dashboard/DashboardPage.tsx
components/dashboard/DashboardHeader.tsx
components/dashboard/WeekCompareControls.tsx
components/dashboard/NarrativeCard.tsx
components/dashboard/SectionCard.tsx
components/dashboard/ExecutiveSummarySection.tsx
components/dashboard/TruckProfitabilitySection.tsx
components/dashboard/LanePerformanceSection.tsx
components/dashboard/DriverPerformanceSection.tsx
components/dashboard/CostsTrendsSection.tsx
```

### Tasks

1. Implement global page container:

```tsx
mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8
```

2. Make week/compare control bar sticky.
3. Standardize section card header anatomy.
4. Add one-line descriptions to each section.
5. Move full tables/details into bottom accordion area.
6. Ensure all default section tables cap at 5 rows.
7. Ensure mobile default row cap is 3 where possible.
8. Keep comparison additions inside existing components, not new duplicate layouts.

### Expected Impact

- Lower cognitive load.
- More predictable navigation.
- Compare mode feels contained instead of noisy.

### Risk Notes

- Watch for table width regressions.
- Ensure existing data props are reused.
- Do not change report calculation logic.

---

## Phase 3 — Charts and Data Presentation Polish

**Goal:** Make charts readable, consistent, and less BI-heavy.  
**Risk:** Medium

### Files

```text
components/charts/*
components/dashboard/TruckProfitabilitySection.tsx
components/dashboard/LanePerformanceSection.tsx
components/dashboard/CostsTrendsSection.tsx
lib/chartTheme.ts
```

### Tasks

1. Create shared ECharts theme constants:

```ts
export const chartColors = {
  current: "#2563eb",
  compare: "#94a3b8",
  positive: "#059669",
  negative: "#dc2626",
  warning: "#d97706",
}
```

2. Standardize tooltip, axis, split lines, grid spacing.
3. Use horizontal bars for ranking charts.
4. Use muted gray/dashed style for compared week.
5. Add accessible chart labels.
6. Add chart loading skeletons.
7. Disable/reduce animation for `prefers-reduced-motion`.

### Expected Impact

- Charts become easier to scan.
- Visual language becomes consistent across sections.
- Compare mode becomes easier to understand.

### Risk Notes

- ECharts responsive resizing can be fragile.
- Test charts inside hidden accordion panels.
- Ensure charts resize after accordion opens.

---

## Phase 4 — States, Empty Views, Admin Polish

**Goal:** Make the app feel complete during loading, missing data, upload, processing, and publishing.  
**Risk:** Medium

### Files

```text
components/ui/EmptyState.tsx
components/ui/Alert.tsx
components/ui/Toast.tsx
components/ui/Skeleton.tsx
components/admin/*
components/upload/*
components/dashboard/*
```

### Tasks

1. Add reusable `EmptyState` component.
2. Add reusable `Alert` component.
3. Add reusable `Skeleton` component.
4. Replace spinners with skeletons where dashboard structure is known.
5. Add specific empty states for:
   - no files uploaded
   - no processed data
   - no AI narrative
   - no comparison selected
   - no rows for section
6. Add admin status badges:
   - Draft
   - Processing
   - Report Ready
   - Published
7. Standardize toast behavior and placement.

### Expected Impact

- App feels reliable even when data is missing.
- Admin workflow becomes clearer.
- Fewer confusing blank states.

### Risk Notes

- Avoid adding new state machine logic.
- Use existing status values if available.
- Do not block existing flows.

---

## Phase 5 — Accessibility and Responsive QA

**Goal:** Ensure UI is usable on mobile, keyboard, and assistive technologies.  
**Risk:** Low-medium

### Files

```text
components/ui/*
components/dashboard/*
components/charts/*
app/globals.css
```

### Tasks

1. Add ARIA labels to selectors, charts, and accordions.
2. Add `caption` to tables using `sr-only`.
3. Verify keyboard tab order.
4. Verify focus ring visibility.
5. Add reduced-motion CSS.
6. Test mobile layouts at 375px, 430px, 768px, 1024px, 1440px.
7. Ensure no horizontal page overflow on mobile.
8. Ensure tables scroll inside containers only.

### Expected Impact

- Better usability and compliance.
- Fewer mobile layout bugs.
- More professional client-facing experience.

### Risk Notes

- Sticky bar can consume mobile space; test real viewport height.
- Focus rings may be clipped by overflow containers; adjust if needed.

---

# Final Implementation Notes

## Do Not Change

- Data model
- Backend parsing
- Report calculations
- AI generation logic
- Section order
- Compare mode activation logic
- Admin/client permissions

## Must Preserve

- Single-week mode as default
- Optional comparison only when selected
- Same section order in both modes
- Owner-friendly language
- Progressive disclosure through `See details`
- Existing route structure unless already planned otherwise

## Primary UI Outcome

The final interface should feel like:

```text
A calm weekly operating report for a small trucking company owner.
```

Not:

```text
A dense BI dashboard.
```
