# Power of 5 — Pope County demo seed report

**Lane:** `RedDirt/`  
**Date:** 2026-04-27  
**Scope:** Synthetic relational graph for **Pope dashboard v2 only** (`/county-briefings/pope/v2`). No other counties, routes, or admin surfaces consume this seed.

## Purpose

Provide a **deterministic, public-safe** demo that:

- Exercises canonical Power of 5 domain types (`PowerUser`, `PowerTeam`, `PowerNode`, `RelationshipEdge`, `OrganizingActivity`) from `src/lib/power-of-5/types.ts`.
- Gives the Pope v2 dashboard a **coherent story**: 50 synthetic users, 10 teams, a mix of **complete** and **forming** rosters, leader spokes, a few **mentor** bridges, and **logged activity** (conversations, texts, doors, etc.).
- Stays **aggregate-first**: display names are `Volunteer 01`… style; no voter file joins, no street-level PII, no raw contact tokens.

## Artifact locations

| Piece | Path |
|--------|------|
| Seed + layout + rollup helpers | `src/lib/power-of-5/demo/pope-seed.ts` |
| Dashboard integration | `src/lib/campaign-engine/county-dashboards/pope-county-dashboard.ts` |
| UI panel (SVG) | `src/components/county/pope/PopeRelationalGraphDemoPanel.tsx` |
| Page wiring | `src/components/county/pope/PopeCountyDashboardV2View.tsx` → `buildPopeCountyDashboardV2()` |

## Seed topology (fixed counts)

- **50** `PowerUser` rows: **42** linked to roster `PowerNode`s, **8** in signup pipeline (`primaryNodeId: null`).
- **10** `PowerTeam`s named for Pope-area placeholders (Russellville, Atkins, Dover, Pottsville, etc.).
- **Roster sizes:** six teams × **5** members (status **`complete`**), four teams with **3 / 4 / 3 / 2** members (status **`forming`**).
- **42** `PowerNode`s total; leaders are **active**; some members are **`invited`** (lighter nodes in the diagram).
- **Edges:** each non-leader has a leader tie (`invited` or `co_volunteer`); **three** optional **`mentor`** edges link leaders across teams (dashed lines).
- **96** `OrganizingActivity` rows, rotated across **active** actors and types (`conversation`, `text`, `phone`, `door`, `event_touch`, `training`) with pipeline ids for dashboard realism.

## KPI alignment

`buildPopeCountyDashboardV2()` calls `buildPopeDemoRelationalGraph()` once, then `getPopeDemoPowerOfFiveRollup(graph)` so the **executive** and **Power of 5** strips match the graph:

- Active / complete / incomplete teams, completion %, invited and activated counts, conversation count, follow-ups due, leader gaps, weekly growth.
- **Charts:** `powerTeamGrowth` ends at the seeded team count; `volunteerPipeline` uses graph summary totals.

City drilldown **power team** demo integers were adjusted so the **sum across cities is 10**, matching the county-level team count (still labeled demo).

## UI behavior

`PopeRelationalGraphDemoPanel` renders an **SVG** cluster diagram (no extra npm dependencies):

- Rounded **team frames**: emerald outline = complete, amber = forming.
- **Dots:** leader vs member; muted fill = invited slot.
- **Lines:** leader spokes; dashed = mentor bridges.
- Caption lists user/team/edge/activity counts from `graph.summary`.

## Privacy and constraints

- **No deletes** of existing engine data; this work is **additive**.
- **No** Prisma or relational-contact imports in the seed module.
- **No** real names, phones, emails, or voter keys — only stable demo ids (`pope-demo-user-001`, `pope-demo-node-001`, …).

## Future packets (out of scope here)

- Persist graph edges in DB with consent and visibility flags.
- Replace static layout with force-directed or map-backed views behind auth.
- Reuse seed patterns for other counties only after an explicit integration review.
