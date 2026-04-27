# Power of 5 — full system audit (RedDirt)

**Lane:** `RedDirt/` only.  
**Status:** Read-only inventory of **implemented UI**, **libraries**, **data surfaces**, and **gaps** relative to the relational organizing spine.  
**Date:** 2026-04-27.  
**Related:** `docs/POWER_OF_5_RELATIONAL_ORGANIZING_SYSTEM_PLAN.md`, `docs/POWER_OF_5_DASHBOARD_INTEGRATION.md`, `docs/audits/DASHBOARD_HIERARCHY_COMPLETION_AUDIT.md`.

**Scope:** No code or product changes were made to produce this document.

---

## 1. What works

### 1.1 Shared product surface (visual + narrative spine)

- **Pipeline ladder:** `src/lib/power-of-5/pipelines.ts` drives `PowerOf5PipelineVisualization` (six-stage organizing ladder).
- **Unified dashboard block:** `PowerOf5DashboardPanel` (`src/components/power-of-5/PowerOf5DashboardPanel.tsx`) is the canonical section (header, optional impact callout, intro, pipeline, optional KPI grid).
- **County / region wrappers:** `CountyPowerOf5Panel`, `RegionPowerOf5Panel` delegate to the same panel for parity across levels.
- **Relational charts (demo):** `PowerOf5RelationalCharts` + `buildPowerOf5RelationalChartDemo` (`src/lib/power-of-5/relational-chart-demos.ts`) — deterministic demo bundles wired into state, region, and Pope v2 chart surfaces.

### 1.2 KPI and gamification math (library layer)

- **Derived metrics:** `src/lib/power-of-5/kpi.ts` — activation rate, team completion, coverage, growth rate, etc., used by builders and copy.
- **Personal gamification snapshot:** `src/lib/power-of-5/gamification.ts` builds display state from the personal demo payload (streaks, missions — demo-only inputs).

### 1.3 Public organizing intelligence (OIS) — Power of 5 in context

- **State:** `/organizing-intelligence` — `buildStateOrganizingIntelligenceDashboard()` + `StateOrganizingIntelligenceView`: executive + P5 strip, relational charts, shared ladder panel; disclaimers describe demo/seed vs registry-derived counts.
- **Regions (eight campaign regions):** Per-slug pages use `RegionDashboardView` + `buildRegionDashboard` / regional builders in `src/lib/campaign-engine/regions/build-region-dashboard.ts` — P5 headlines in KPI strip, regional `powerOf5` block, charts; explicitly labeled demo/seed in payloads.

### 1.4 County gold sample (densest public P5 + charts)

- **`/county-briefings/pope/v2`:** `buildPopeCountyDashboardV2()` + `PopeCountyDashboardV2View` — executive + P5 KPI strip, `CountyPowerOf5Panel` (ladder-first, no duplicate grid), `CountyChartPanel` with `PowerOf5RelationalCharts` fed from `getPopeDemoPowerOfFiveRollup` / `buildPopeDemoRelationalGraph` (`src/lib/power-of-5/demo/pope-seed.ts`). This is the best **aligned** demo (relational seed ↔ strip ↔ charts).

### 1.5 Volunteer-facing routes (demo data, public today)

- **`/dashboard`:** `PersonalDashboardView` — synthetic “My Five,” team, tasks, impact, gamification panel, full pipeline viz; **prominent demo banner** (no session, no voter data).
- **`/dashboard/leader`:** `PowerOf5LeaderDashboardView` + `buildPowerOf5LeaderDashboardDemo()` — teams, weak nodes, follow-ups, KPI strip; **demo banner** via payload; copy states future auth/consent-scoped rosters.

### 1.6 Onboarding prototype

- **`/onboarding/power-of-5`:** Multi-step `PowerOf5OnboardingView` — trust-first flow, previews, pipelines; metadata states no contact/voter collection on that route.

### 1.7 Persistence layer (REL-2) — schema exists; not the same as public P5 UI

- **`RelationalContact` model** (`prisma/schema.prisma`): owner-scoped relational organizing record with optional `matchedVoterRecordId`, `powerOfFiveSlot`, `isCoreFive`, `organizingStatus` (includes states such as `INVITED_TO_POWER_OF_FIVE`), contact fields, notes, follow-up timestamps. This is the **durable** side of “my five” / relational graph **when** wired to authenticated experiences and admin tools.
- **Admin:** `/admin/relational-contacts` (and related REL-2 flows) operate in the authenticated admin shell — separate from public OIS and public `/dashboard*` demos.

### 1.8 Operator / IA shells

- **`/admin/organizing-intelligence`:** Placeholder page under `(board)` layout (existing `requireAdminPage` gate). No P5 aggregates or exports implemented there yet.
- **`/organizing-intelligence/counties/[countySlug]`:** Placeholder county route under public OIS layout — hierarchy stub only, **no** county P5 panel or live rollup.

---

## 2. Missing data

| Gap | Notes |
|-----|--------|
| **Live P5 telemetry** | Public OIS and regional dashboards use **demo/seed** numerators for invites, activations, conversations, follow-ups, team health — not field-system feeds. |
| **Bridge: `RelationalContact` → rollups** | Schema supports per-owner relational rows; there is **no** product path in this audit that aggregates REL-2 into state/region/county OIS KPIs (and doing so would require strict aggregation, consent, and policy review). |
| **Team / node graph (runtime)** | Plan-level objects (`PowerTeam`, `PowerNode`, edges) are design artifacts; runtime graph is **not** fully modeled in app code beyond `RelationalContact` + related enums. |
| **Geography assignment truth** | `GeographyAssignment`-style mandatory rollup (plan §4) is **not** fully represented in UI builders; region/county lists come from registry + campaign region maps. |
| **Precinct / city / community metrics** | No precinct geometry or block-level product data (see hierarchy audit DATA-1); P5 “coverage” remains illustrative. |
| **API-sourced metrics** | No `src/app/api/**` handlers matched for Power of 5 or relational rollups in a quick inventory — dashboards are **server-built** from static/demo builders, not from REST ingestion. |
| **Leader dashboard hydration** | `buildPowerOf5LeaderDashboardDemo` is explicitly static; no roster, latency, or completion **from DB**. |
| **Personal dashboard hydration** | `PERSONAL_DASHBOARD_DEMO` is a constant object; no tie to authenticated user or `RelationalContact` rows. |

---

## 3. Missing routes

| Intended / planned layer | Status |
|--------------------------|--------|
| **OIS county drill with P5 UI** | `/organizing-intelligence/counties/[countySlug]` exists as **copy-only placeholder** — no `CountyPowerOf5Panel`, no builder. |
| **City / precinct / community / block OIS** | Not implemented under `organizing-intelligence` (per `DASHBOARD_HIERARCHY_COMPLETION_AUDIT.md`). |
| **Auth-gated `/dashboard*`** | Routes live under public `(site)` layout; **no** session gate — acceptable for prototype if banners stay; **missing** relative to plan’s permission model. |
| **Dedicated JSON / mobile API for P5** | Not observed in API tree; any future app clients would need a packet for contracts + rate limits + privacy. |
| **Admin operator P5 hub** | `/admin/organizing-intelligence` is a **stub** — no queues, exports, QA, or reconciliation tools for P5/OIS. |

---

## 4. Performance concerns

| Area | Risk | Mitigation ideas (future work) |
|------|------|--------------------------------|
| **Large single pages** | State, region, and Pope v2 pages compose many sections (KPI strip, charts, map panel, strategy, grids). TTFB and RSC payload size can grow as copy and demo objects expand. | Lazy boundaries for below-fold panels; trim duplicate narrative; static generation where dynamic isn’t required. |
| **Chart + viz duplication** | Multiple SVG/bar blocks per page (`PowerOf5RelationalCharts`, pipeline viz, county chart panel). | Shared memoization of demo bundles; avoid recomputing identical chart data in multiple parents. |
| **Regional builder work** | `build-region-dashboard` constructs rich objects per region; ensure dynamic rendering choices stay intentional (`force-dynamic` on admin board is separate). | Profile server timing; cache registry-derived slices if builders grow. |
| **Personal / leader dashboards** | Rich client trees (many cards, lists). | Code-split heavy panels if bundle size becomes an issue; keep demo payloads lean. |
| **`RelationalContact` at scale** | Indexes exist on common filters; naive list UIs could still over-fetch or N+1 without careful Prisma `select`. | List views should use pagination + minimal `select`; audit admin relational list queries under load. |

---

## 5. Privacy risks

| Risk | Severity | Mitigation in repo today |
|------|----------|---------------------------|
| **Public `/dashboard` and `/dashboard/leader` look “real”** | Medium (trust / confusion) | Strong **demo banners** and synthetic names; metadata describes demo. Risk remains if users share screenshots without context. |
| **`RelationalContact` PII in DB** | High if exposed | Names, phone, email, notes, voter match IDs — **must** stay behind admin/auth + least privilege; never echoed on public OIS. |
| **Voter match on relational rows** | High | `matchedVoterRecordId` links to voter file; any UI or export must follow stewardship rules (plan §12, OIS constraint docs). |
| **Public OIS misread as targeting** | Medium | Disclaimers and `CountySourceBadge` / “demo” labeling — must stay accurate when any metric becomes partially live. |
| **Onboarding** | Lower | Stated no collection on prototype route; keep true if analytics or forms are added later. |
| **Logging / errors** | Medium (ops) | Ensure server logs never print raw relational notes or contact details (general app hygiene — verify in future logging passes). |

---

## 6. Next build packets

Suggested sequencing only; each packet should have its own spec and privacy review where data moves across trust boundaries.

1. **AUTH-P5-1 — Gate personal & leader dashboards**  
   Move `/dashboard` and `/dashboard/leader` behind session when accounts are ready; keep a **public** “preview” or marketing slice only if still needed.

2. **DATA-P5-1 — Hydrate personal dashboard from `RelationalContact`**  
   Map `isCoreFive`, `powerOfFiveSlot`, `organizingStatus`, follow-up fields to `PersonalDashboardView` (replace `PERSONAL_DASHBOARD_DEMO` for logged-in users only).

3. **DATA-P5-2 — Leader scope**  
   Define “teams under leader” query model (or interim tagging) and feed `PowerOf5LeaderDashboardView` from DB with consent-scoped fields only.

4. **OIS-P5-1 — County OIS drill**  
   Replace `/organizing-intelligence/counties/[countySlug]` placeholder with a **public-safe** county rollup (aggregate-only, labeled sources), reusing `CountyDashboardShell` patterns where appropriate.

5. **OIS-P5-2 — Optional aggregate bridge**  
   If policy allows, derive **coarse** statewide/regional KPIs from internal rollups (not voter microtargeting); never expose per-contact data on public routes.

6. **ADMIN-P5-1 — Operator hub**  
   Flesh out `/admin/organizing-intelligence` with exports, QA queues, and reconciliation — still no public PII.

7. **API-P5-1 — Mutation + read contracts**  
   Conversation logging, invite state transitions, encrypted note refs (per plan); rate limits + audit trail.

8. **GEO-P5-1 — City / precinct shells**  
   When DATA-1 unblocks geography, add routes and aggregate scoreboards per `POWER_OF_5_RELATIONAL_ORGANIZING_SYSTEM_PLAN.md`.

9. **OBS-P5-1 — Performance + privacy QA**  
   Load-test regional pages; red-team public URLs for accidental PII; verify admin relational screens under RLS or equivalent patterns if introduced.

---

## 7. File index (quick reference)

| Area | Primary paths |
|------|----------------|
| Components | `src/components/power-of-5/*`, `src/components/dashboard/personal/*`, `src/components/dashboard/leader/*`, `src/components/onboarding/power-of-5/*` |
| Libraries | `src/lib/power-of-5/*`, `src/lib/campaign-engine/power-of-5/build-leader-dashboard-demo.ts` |
| Builders | `src/lib/campaign-engine/state-organizing-intelligence/build-state-oi-dashboard.ts`, `src/lib/campaign-engine/regions/build-region-dashboard.ts`, `src/lib/campaign-engine/county-dashboards/pope-county-dashboard.ts` |
| Routes | `src/app/organizing-intelligence/**`, `src/app/(site)/dashboard/**`, `src/app/onboarding/power-of-5/page.tsx`, `src/app/admin/(board)/organizing-intelligence/page.tsx` |
| Schema | `prisma/schema.prisma` (`RelationalContact`, related enums) |

---

**Bottom line:** The **spine is real in UI and libraries** — ladder, panels, KPI math, demo charts, Pope alignment, and two rich volunteer demo dashboards — but **production relational data and rollups are not yet wired** from `RelationalContact` or field systems into public OIS or authenticated dashboards. Treat all public aggregates as **demo or registry-derived** until an explicit packet says otherwise.
