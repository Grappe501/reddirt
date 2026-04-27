# Power of 5 — KPI engine

**Lane:** `RedDirt/`  
**Module:** `src/lib/power-of-5/kpi.ts`

This document describes the shared **percent rollup** helpers used on public organizing dashboards (county, region, state). All functions are **pure** (no I/O, no voter PII). Callers own **labeling**: `demo` vs `derived` in `CountyDashboardLabeledMetric` / OIS payloads.

## Functions

| Function | Formula | Edge cases |
|----------|---------|------------|
| `calculateCoverage` | `activeUnits / targetUnits × 100`, clamped to `[0, 100]` | `targetUnits ≤ 0` → `0` |
| `calculateActivation` | `activated / invited × 100`, clamped to `[0, 100]` | `invited ≤ 0` → `0` |
| `calculateTeamCompletion` | `completeTeams / formedTeams × 100`, clamped to `[0, 100]` | `formedTeams ≤ 0` → `0` |
| `calculateGrowthRate` | `(current − previous) / previous × 100` | `previous ≤ 0` or non-finite → `0` |

Rounding: **one decimal place** for all returned percentages (consistent with existing Pope / OIS demo formatting).

## Semantics (organizing)

- **Coverage** — share of a **planning target** reached (e.g. active Power Teams vs county/region/state team goal). It is **not** geographic area coverage unless the caller defines `activeUnits` that way.
- **Activation** — share of **invited** relational contacts (or invite signals) that reached an **activated** state. Inputs must stay **aggregate-only** on public routes.
- **Team completion** — complete teams ÷ teams formed; aligns with `getPopeDemoPowerOfFiveRollup` / county v2 `teamCompletionRate`.
- **Growth rate** — relative change between two **period snapshots** (e.g. this week vs last week team count). The **state** dashboard uses demo `totalTeams` and `weekOverWeekTeams` to synthesize a prior value for illustration.

## Where it is wired

| Surface | Usage |
|---------|--------|
| **County** (Pope v2) | Executive **coverage** uses `calculateCoverage` in `pope-county-dashboard.ts`. Demo graph **completion rate** uses `calculateTeamCompletion` in `pope-seed.ts`. **Activation rate** card is computed in `PopeCountyDashboardV2View` via `calculateActivation`. |
| **Region** | `build-region-dashboard.ts`: executive strip **modeled coverage** and **WoW team growth %**; Power of 5 block **team completion %** and **activation rate %**. |
| **State** (OIS) | `build-state-oi-dashboard.ts`: executive **statewide coverage**, `powerOf5.coverageTargetPct`, and `powerOf5.kpiEngine` (`activationRatePct`, `teamCompletionRatePct`, `teamCountGrowthRatePct`). UI: `StateOrganizingIntelligenceView`. |

## Policy

- Public pages remain **aggregate-only**; no voter file fields pass through these helpers.
- When live pipelines replace demo numerators, keep **one** implementation of each formula here so county → region → state stay **comparable**.
