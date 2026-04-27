# Pope County Dashboard v2 — polish (gold-standard sample)

**Lane:** `RedDirt/` only.  
**Date:** 2026-04-27.  
**Route (unchanged):** `/county-briefings/pope/v2`

This pass tightens the Pope v2 “command” layout, sharpens **demo/seed** labeling, adds the **Pope County Intelligence Stack** ladder, surfaces **Power of 5** rollup copy, and structures **action** and **risk** cards for scanability — **no new dependencies**, **no new voter/PII data**, same architecture as the shared county dashboard shell.

---

## Files changed

| File | Change |
|------|--------|
| `src/components/county/pope/PopeCountyDashboardV2View.tsx` | Gold-sample hero, `CountyKpiStrip` `compact` + `CountySectionHeader`, `PopeIntelligenceStack`, drilldown `pathwayCallout`, `POWER_OF_5_IMPACT` copy, action/risk section descriptions. |
| `src/components/county/pope/PopeIntelligenceStack.tsx` | Ladder: County → City → Community → Precinct → Power Team; **visible** `→` connectors; `CountySectionHeader`. |
| `src/components/county/dashboard/countyDashboardFormat.tsx` | Tighter `CountyKpiCard` (`compact`), **Demo / seed** badge, suffix logic via `metricSuffixForLabel` (fixes short labels like “Org. readiness”). |
| `src/components/county/dashboard/CountyKpiStrip.tsx` | `overline`, `CountySectionHeader`, responsive **compact grid** (2→5 columns). |
| `src/components/county/dashboard/CountyActionPanel.tsx` | `CountySectionHeader`, definition list: owner, urgency (pill + dot), KPI, impact, **next step** in callout. |
| `src/components/county/dashboard/CountyRiskPanel.tsx` | `CountySectionHeader`, per-card **Severity / Mitigation / Owner** labels. |
| `src/components/county/dashboard/CountyDrilldownGrid.tsx` | `CountySectionHeader`, optional `pathwayCallout`, left-border cards, route “target (not live)” copy. |
| `src/components/county/dashboard/CountyPowerOf5Panel.tsx` | `impactExplanation` callout (kelly-success tint), `CountySectionHeader`, compact Power of 5 KPI grid. |
| `src/lib/campaign-engine/county-dashboards/types.ts` | `nextStep` on `CountyDashboardNextAction`. |
| `src/lib/campaign-engine/county-dashboards/pope-county-dashboard.ts` | `nextStep` for all six `nextActions`. |
| `src/components/county/dashboard/countyDashboardClassNames.ts` | `countyDashboardCardCompactClass` (if not already present). |
| `docs/POPE_COUNTY_DASHBOARD_POLISH_REPORT.md` | This report. |

*Note: Some shared files may have been updated in an earlier pass in the same effort; the table lists the polish surface as delivered.*

---

## Visual improvements (what you should see)

- **KPI command strip:** Smaller cards, more columns on wide screens, **DB / Derived** vs **Demo / seed** badges on every value line.
- **Section rhythm:** `CountySectionHeader` (overline + `border-b` + larger title) on executive, stack, charts, actions, risks, and drilldown.
- **Intelligence stack:** Five-step horizontal ladder with “you are here” styling on **County** and **→** between levels.
- **Drill path:** Teal/blue callout above city cards narrates **County → City → … → Power Team** and reminds public = aggregates only.
- **Power of 5 impact:** Green-tinted block with requested rollup line + demo caveat.
- **Action queue:** Each item is a structured card (owner, urgency chip, KPI, impact, next step in a box).
- **Risks:** Category title, then labeled severity / mitigation / owner blocks.

---

## Remaining placeholders (honest)

- **Maps / battlefield:** Still SVG/placeholder; no new map libraries.
- **City and precinct metrics:** Still largely **demo/seed** in builder; list-mode precinct chips unchanged.
- **Charts:** Still mix of real turnout point where ingest allows + **demo** series for pipelines, issue intensity, etc.
- **Power of 5 counts:** Still illustrative until a relational data model is wired (Packet 4–5 in OIS roadmap).
- **Routes:** `futureCityHref` / precinct patterns are **design targets** — not created in this pass.

---

## Next recommended script

- **Packet 1 (if missing):** `docs/audits/POPE_COUNTY_INTELLIGENCE_PACKET1_AUDIT.md` — read-only inventory of routes, components, and safe files for geography taxonomy (Packet 2) and first **city route stub** (Packet 8) without breaking `/county-briefings/pope/v2`.
- **Or:** Benton/Washington reuse of the same `CountyDashboardV2` types + shell — swap data builder, keep this Pope page as the visual reference.

---

## Build / lint

Re-run: `Set-Location H:\SOSWebsite\RedDirt; npm run check`.
