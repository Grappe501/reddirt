# Power of 5 — dashboard integration (RedDirt)

**Lane:** `RedDirt/`  
**Scope:** State organizing intelligence (`/organizing-intelligence`), region dashboards (`/organizing-intelligence/regions/*`), and county dashboard v2 (gold sample: Pope v2).  
**Constraint:** Public pages stay **aggregate-only** — no voter PII, no household identifiers, no unsourced competitive claims.

## Goals

1. **One visual language** for the Power of 5 ladder and relational KPI cards across state → region → county.
2. **KPI strips include Power of 5** headline metrics (invites, activations, derived rates) next to executive / scale metrics.
3. **Charts reflect relational data** using the same demo numerators as the strips (invite → activate → team depth, conversation cadence, follow-up buckets).

## Shared UI components

| Component | Path | Role |
|-----------|------|------|
| `PowerOf5PipelineVisualization` | `src/components/power-of-5/PowerOf5PipelineVisualization.tsx` | Six-stage organizing ladder (`lib/power-of-5/pipelines.ts`). |
| `PowerOf5DashboardPanel` | `src/components/power-of-5/PowerOf5DashboardPanel.tsx` | **Canonical section:** `CountySectionHeader` + optional impact callout + intro + pipeline + optional `CountyKpiCard` grid. |
| `PowerOf5RelationalCharts` | `src/components/power-of-5/PowerOf5RelationalCharts.tsx` | Three-up demo charts: conversation trend, invite/activate funnel, follow-up cadence. |

Thin wrappers (same props families as before):

- `CountyPowerOf5Panel` → delegates to `PowerOf5DashboardPanel`.
- `RegionPowerOf5Panel` → maps `RegionPowerOf5Block` onto `PowerOf5DashboardPanel`.

Barrel exports: `src/components/power-of-5/index.ts`.

## Shared data helpers

| Helper | Path | Role |
|--------|------|------|
| `buildPowerOf5RelationalChartDemo` | `src/lib/power-of-5/relational-chart-demos.ts` | Deterministic **demo** relational chart bundle from invited / activated / conversations / follow-ups (and optional team-linked estimate). |

Types:

- `PowerOf5RelationalChartBundle` — `src/lib/campaign-engine/county-dashboards/types.ts`
- Optional `CountyDashboardChartBundle.relational` — rendered inside `CountyChartPanel` when present.

KPI math for derived percentages remains in `src/lib/power-of-5/kpi.ts` (`calculateActivation`, `calculateTeamCompletion`, `calculateCoverage`, `calculateGrowthRate`, …).

## State dashboard (`/organizing-intelligence`)

**Builder:** `src/lib/campaign-engine/state-organizing-intelligence/build-state-oi-dashboard.ts`

- **`kpiStripItems`:** Executive metrics (registered voters, counties, teams, coverage, readiness) **concatenated with** Power of 5 strip items (`P5 — People invited`, `P5 — Activation rate (KPI engine %)`, etc.).
- **`relationalCharts`:** `buildPowerOf5RelationalChartDemo(...)` aligned to the same statewide demo invites/activations.
- **`powerOf5`:** Retained on the payload for audits and future hydration; the duplicate mini-grid was removed from the view in favor of the unified strip + shared panel.

**View:** `src/components/organizing-intelligence/StateOrganizingIntelligenceView.tsx`

- `CountyKpiStrip` for the combined strip.
- `PowerOf5RelationalCharts` immediately below the strip.
- `PowerOf5DashboardPanel` with **empty `items`** — pipeline + narrative only (counts live in the strip).

## Region dashboards

**Builder:** `src/lib/campaign-engine/regions/build-region-dashboard.ts`

- **`kpiItems`:** Appends `P5 — People invited`, `P5 — People activated`, `P5 — Activation rate (KPI engine %)`.
- **`relationalCharts`:** Same helper, scaled from regional demo numerators.
- **`powerOf5.items`:** Deduplicated against the strip (no second copy of invites/activations/activation rate); keeps team scale, completion %, conversations, follow-ups.

**View:** `src/components/regions/dashboard/RegionDashboardView.tsx`

- `PowerOf5RelationalCharts` sits under `RegionKpiStrip` in the wide column.
- `RegionPowerOf5Panel` uses `pipelineVariant="full"` for parity with state/county.

## County dashboard v2 (Pope sample)

**Builder:** `src/lib/campaign-engine/county-dashboards/pope-county-dashboard.ts`

- `charts.relational` populated via `buildPowerOf5RelationalChartDemo` from `getPopeDemoPowerOfFiveRollup` / relational graph seed.

**View:** `src/components/county/pope/PopeCountyDashboardV2View.tsx`

- Single `CountyKpiStrip`: `buildPopeExecutiveKpis` + `buildPopePowerOf5Items`.
- `CountyPowerOf5Panel` with **`items={[]}`** and `pipelineVariant="full"` — ladder only; avoids duplicating the KPI grid.

**Charts:** `src/components/county/dashboard/CountyChartPanel.tsx` renders `PowerOf5RelationalCharts` when `charts.relational` is set (above the legacy electoral / pipeline bar grid).

## Operational notes

- **Demo vs derived vs DB** badges come from `CountyKpiCard` / `CountySourceBadge`; keep labeling honest as pipelines move from seed → ingest.
- **Do not** place individual nodes or voter tokens on public routes; relational graph demos use synthetic IDs and aggregate summaries only (`pope-seed.ts`).
- When wiring **live** relational telemetry, replace `buildPowerOf5RelationalChartDemo` inputs with server-side rollups and keep chart titles honest about freshness and aggregation level.

## File checklist (this integration)

- `src/components/power-of-5/PowerOf5DashboardPanel.tsx` (new)
- `src/components/power-of-5/PowerOf5RelationalCharts.tsx` (new)
- `src/lib/power-of-5/relational-chart-demos.ts` (new)
- `src/lib/campaign-engine/county-dashboards/types.ts` (`PowerOf5RelationalChartBundle`, `charts.relational`)
- `src/lib/campaign-engine/state-organizing-intelligence/build-state-oi-dashboard.ts` (`kpiStripItems`, `relationalCharts`)
- `src/lib/campaign-engine/regions/types.ts` (`relationalCharts` on `RegionDashboard`)
- `src/lib/campaign-engine/regions/build-region-dashboard.ts`
- `src/lib/campaign-engine/county-dashboards/pope-county-dashboard.ts`
- `src/components/organizing-intelligence/StateOrganizingIntelligenceView.tsx`
- `src/components/regions/dashboard/RegionDashboardView.tsx`
- `src/components/regions/dashboard/RegionPowerOf5Panel.tsx`
- `src/components/county/dashboard/CountyPowerOf5Panel.tsx`
- `src/components/county/dashboard/CountyChartPanel.tsx`
- `src/components/county/pope/PopeCountyDashboardV2View.tsx`
