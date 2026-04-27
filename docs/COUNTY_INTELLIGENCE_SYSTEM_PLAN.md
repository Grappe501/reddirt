# County Intelligence System — Master Plan (RedDirt)

**Status:** Planning document only — **no implementation in this packet.**  
**Lane:** `RedDirt/` only (no cross-lane imports).  
**Prototype county:** Pope County (`pope-county`, FIPS `05115`).  
**Principle:** Organizing model rolls up **Precinct → Community → County → Region → State**; dashboards are **designed top-down** — **State → Region → County → Community → Precinct** — with the same cards, metrics contracts, and strategic language at every level.

---

## Protocol read-in (this session)

| Document | Result |
|----------|--------|
| `README.md` | Read — Kelly SOS production site; Prisma/Postgres; admin workbench; `npm run check` gate; doc index points to foundations. |
| `docs/AI_MIGRATION_CONTROL_CENTER.md` | **Not present** in `RedDirt/docs/` (search 2026-04-27). Treat as TBD or add when available. |
| `docs/REDDIRT_SITE_AND_ENGINE_FUNNEL_PLAN.md` | **Not present** in `RedDirt/docs/` (search 2026-04-27). Treat as TBD or add when available. |
| Pope / workbench-related | See §1 and cross-refs below. |

**Related docs actually used:** `docs/data-targeting-foundation.md` (DATA-1), `docs/field-structure-foundation.md` (FIELD-1), `docs/ingested/county-wikipedia/pope-county.md` (reference only), `docs/README.md` index.

---

## 1. Current Pope County Assessment

### 1.1 What Pope County already has

| Layer | What exists |
|-------|-------------|
| **Public county command** | `/counties/pope-county` — `CountyCommandExperience` driven by `County` + `CountyVoterMetrics` + events/road/owned media (`getCountyPageSnapshot`). |
| **Master registry** | `arkansas-county-registry.ts` includes Pope with `regionId: "central"` (campaign region enum, not the eight marketing names below — see §3). |
| **Seed / DB** | `prisma/seed.ts` — Pope is a “fully wired pilot” with hero copy, lead placeholders, `CountyCampaignStats`, `CountyPublicDemographics`, voter metrics wiring. |
| **Political profile engine** | `buildCountyPoliticalProfile` / `buildPopeCountyPoliticalProfile` (`county-political-profile.ts`, `county-profiles/pope-county.ts`) — COUNTY-PROFILE-ENGINE-1: election history, turnout, win-number / plurality models, Census/ACS/BLS block, precinct *aggregates* (no PII), opposition notes, missing-data warnings. |
| **Public briefing page** | `/county-briefings/pope` — narrative + GOTV universe aggregates + relational organizing (public-safe). |
| **Admin** | `/admin/county-profiles` — Pope profile preview; `/admin/county-intelligence` — COUNTY-INTEL-2 workbench: registration goal math, drop-off, win strategy, Hammer bill heuristics, static export script reference. |
| **Intel bundle** | `pope-briefing-bundle.ts` + script `emit-pope-county-intel-site.ts` for static zip export. |
| **Campaign engine hooks** | `county-win-strategy`, `aggregate-dropoff`, `registration-kpis`, priority plan meta — Pope-named calls. |
| **Content / research** | Ingested Wikipedia summary under `docs/ingested/county-wikipedia/pope-county.md` (CC BY-SA — verify before public claims). |

### 1.2 What is strong

- **Honest data contract:** Missing data is explicit; no fabricated party registration; guardrails in briefing copy (no individual voter tables on public pages).
- **Reusable engine:** `buildCountyPoliticalProfile({ countyName, fips, ... })` is the right abstraction to clone for other counties *once* schema and imports align.
- **Clear separation:** Public briefing vs staff workbench vs static export.
- **Strategic math:** Win number, plurality scenarios, fair-share registration goals connect numbers to *planning* language.

### 1.3 What is missing

- **No unified “profile + strategy + dashboard” product** for public users: command page, briefing page, and admin intel are **three** surfaces with overlapping but non-identical content.
- **No maps:** DATA-1 states no precinct boundary geometry; FIELD-1 excludes GIS. Pope has no choropleth or drill map in UI.
- **No “community” or “precinct” dashboard routes** — only engine hints (`precinctMapData` top lists) and `VoterRecord.precinct` string when file has it.
- **No region dashboard** that aggregates Pope + peers under one URL pattern.
- **No standard scorecards** (organizing readiness, issue intensity, candidate pipeline) as *shared components* with rollup IDs.
- **Region taxonomy drift:** `County.regionLabel` (string), `arkansas-county-registry` `regionId`, and Field `FieldUnit` REGION are not yet a single **canonical** region model (FIELD-1 allows region nodes without auto-linking to `County`).

### 1.4 What to improve before duplicating statewide

1. **Freeze a canonical region model** (§3) and migrate labels in one direction (registry as source of truth for public + rollup keys).
2. **Define one `CountyIntelligenceViewModel`** (or layered props) that both `/counties/[slug]` and `/county-briefings/[slug]` can consume *opt-in* so duplicate narratives don’t diverge.
3. **Map strategy:** Decide placeholder vs real GeoJSON (Arkansas SOS/census sources) and **never** show individual voters on public maps.
4. **Packet-gate** each new county: Benton/Washington only after Pope passes **Packet 1 audit** checklist (§8).
5. **Document handoff** in `docs/` when a packet completes (per README “division” practice).

---

## 2. Standard County Profile Architecture

Every Arkansas county should eventually surface the same **chapters** (order can flex by locale, but names and data contracts should match).

| # | Section | Purpose |
|---|---------|---------|
| 1 | **County overview** | Hero + “why this county matters” + SOS tie-in. |
| 2 | **Political profile** | Registration landscape, last races, competitive context (existing engine). |
| 3 | **Demographic profile** | ACS/Census + trends; education, age, race/ethnicity *aggregates* only. |
| 4 | **Economic profile** | Income, employment, key industries; *no individual employer PII.* |
| 5 | **Turnout / voter profile** | Registration growth, file-as-of, participation drop-off, baseline vs goal. |
| 6 | **Precinct & community breakdown** | Top/bottom geographies, community anchors (churches, schools, unions) — *narrative + aggregates*. |
| 7 | **Leadership map** | Electeds + public-facing field leads (`CountyElectedOfficial` + `County.lead*`). |
| 8 | **Volunteer strategy** | Targets, pipeline stages, relational organizing (align `VolunteerProfile` / goals over time). |
| 9 | **Candidate recruitment strategy** | Down-ballot, locals who can carry message (no oppo dirt — consistent with campaign rules). |
| 10 | **Issue strategy** | Localized SOS-adjacent issues; link to explainer / editorial where appropriate. |
| 11 | **Communications strategy** | Channels, messengers, tone; tie to workbench comms when internal. |
| 12 | **Risk / opposition analysis** | **Fact-based, sourced** — Hammer/sponsor research, legal constraints; never unsourced smears. |
| 13 | **Recommended next actions** | 3–7 time-bound, owner-ready moves (the “so what” for every card). |

**Implementation note:** Not all sections need a database table on day one — a **versioned JSON document** (reviewed) keyed by `countyId` *or* structured markdown in repo can bootstrap until Prisma models stabilize.

---

## 3. Regional Roll-Up System

### 3.1 Campaign region names (target UX copy)

 These eight names are the **stakeholder-facing** set for dashboards and comms:

1. Northwest Arkansas  
2. Central Arkansas  
3. River Valley  
4. North Central / Ozarks  
5. Northeast Arkansas  
6. Delta / Eastern Arkansas  
7. Southeast Arkansas  
8. Southwest Arkansas  

### 3.2 Repo reality (2026-04-27)

`src/lib/county/arkansas-county-registry.ts` already defines **eight** internal region IDs:  
`northwest`, `north_central`, `northeast`, `central`, `west_central`, `southwest`, `southeast`, `south` — with `ARKANSAS_COMMAND_REGIONS` for labels.

**Reconciliation (recommended, non-destructive as a first step):**

- Add a **display mapping** (TypeScript) from `ArCommandRegionId` → the eight user-facing names above, **or** realign one taxonomy with Steve’s sign-off.  
- Do **not** delete existing `regionId` values until a migration + seed plan is written.

### 3.3 Proposed TypeScript shape (additive)

```ts
/** Canonical campaign region for rollup dashboards (keys stable for URLs + analytics). */
export type CampaignRegionSlug =
  | "northwest-arkansas"
  | "central-arkansas"
  | "river-valley"
  | "north-central-ozarks"
  | "northeast-arkansas"
  | "delta-eastern-arkansas"
  | "southeast-arkansas"
  | "southwest-arkansas";

export type CountyRegionBinding = {
  countySlug: string;
  fips: string;
  /** Existing registry / DB field */
  registryRegionId: import("@/lib/county/arkansas-county-registry").ArCommandRegionId;
  /** After reconciliation — optional second column until migration */
  campaignRegionSlug?: CampaignRegionSlug;
  displayLabel: string;
  sortOrder: number;
};

export type RegionProfileStub = {
  regionSlug: CampaignRegionSlug;
  displayName: string;
  childCountySlugs: string[];
  /** Rollups filled by queries or materialized views later */
  aggregates: {
    estRegisteredVoters: number | null;
    volunteerCountSum: number | null;
    registrationGoalSum: number | null;
  };
};
```

**Where to put it (future packets, low risk):**  
- `src/lib/county/region-model.ts` (new) — pure types + mapping tables.  
- Optional Prisma: `regionSlug` on `County` *after* ADR, or a join table `CountyRegion` if multiple memberships are ever needed (default: one region per county).

**FIELD-1 alignment:** `FieldUnit` of type `REGION` can use `name` = `displayLabel` and later `metadata` or FK to `CampaignRegionSlug` when integrating field assignments with dashboards.

---

## 4. Dashboard Hierarchy

**Design order (top-down):** users land on **state**, filter to **region**, open **county**, then **community** (town / organizing unit), then **precinct** when data allows.

| Level | Route pattern (proposed) | Primary audience | Core questions |
|-------|-------------------------|------------------|----------------|
| **State** | `/intelligence` or extend `/admin/...` + public “Arkansas” summary | State leadership | Where are we winning registration? Where is risk concentrated? |
| **Region** | `/intelligence/region/[regionSlug]` | Regional leads | How do counties compare? Who needs support? |
| **County** | `/counties/[slug]` (enhanced) + `/county-briefings/[slug]` | County leads | What is the plan here? |
| **Community** | `/counties/[slug]/community/[communityKey]` (future) | Local hosts | Events, partners, local narrative. |
| **Precinct** | `/counties/[slug]/precinct/[precinctKey]` (future) | Canvass captains | Walk lists, **staff-only** for PII; public = aggregates only. |

**Shared UI patterns (every level):**

- **Executive strip:** 3–5 KPIs + “last updated” + data source badges.  
- **Strategy rail:** “What this means / next moves” (always).  
- **Drill cards:** same card components; depth adds *detail*, not *new visual language*.  
- **Empty states:** explicit “we don’t have this yet” — same copy component.

---

## 5. Visual System Requirements

**Aesthetic goal:** **Dense, modern, technological** — *readable* through hierarchy, not padding. Think: **executive dashboard on top**, **drill intelligence** below, **no orphan numbers** (each metric ties to an action).

### 5.1 Maps

- **State:** AR outline with county choropleth (metric selector: registration growth, goal %, volunteer density *aggregate*).
- **Region:** Subset of counties highlighted; rest muted.
- **County:** County outline + (when available) precinct polygons or dot density by **aggregate bucket**.
- **Community / Precinct:** Only when **geometry** + **ethics review** allow; public views = **no household-level** data.

**Stack (recommendation):** Leaflet is already in repo (events). For heavy choropleth, evaluate **MapLibre** or **deck.gl** in a **later** packet; start with **SVG/TopoJSON placeholders**.

### 5.2 Charts (consistent library)

- **Line:** turnout trend, registration growth vs baseline.  
- **Bar / stacked bar:** vote share, demographic composition.  
- **Small multiples:** compare peer counties.  
- **Heat / matrix:** issue intensity (county vs issue grid), *aggregates only*.  
- **Funnel / pipeline:** volunteer and candidate *stages* (counts, not names, on public).

**Recommendation:** One chart theme in Tailwind (existing Kelly tokens) + `recharts` or `visx` — pick in Packet 5 and **do not** mix libraries per page.

### 5.3 Tables

- **Sortable, filterable** data grids for peer comparison; export **CSV** staff-only.  
- **Row density:** compact typography (`text-sm`, zebra optional), mobile **horizontal scroll** with shadow cues.

### 5.4 Scorecards

- **Organizing readiness:** composite index (document formula; review for fairness).  
- **Risk / opportunity:** RAG (red/amber/green) with **sourced** drivers only.

### 5.5 Accessibility & safety

- Color is not the only channel (pattern + label).  
- **No** microtargeting copy on public pages.  
- **PII** and walk lists: **admin or field tools only** — see DATA-1.

---

## 6. Pope County — Specific Improvements (prototype backlog)

1. **Map panels** — Placeholder state/county/precinct panels with “data pipeline” callouts.  
2. **Regional context** — Strip showing Central AR peer counties (or post-reconciliation, “River Valley” peers).  
3. **Peer comparison** — Small-multiple or table: Saline, Faulkner, Conway, etc. (select defensible peer set in Packet 1).  
4. **Strategy scorecards** — Organizing readiness + registration pace vs fair share.  
5. **Precinct / community drill-down** — Start with **list + aggregate**; map when GeoJSON exists.  
6. **“What we know / need / next moves”** — Three-column panel; reuse at every level.  
7. **Organizing readiness metrics** — Define 4–6 inputs (volunteer growth, event cadence, relational counts *aggregate*).  
8. **Candidate recruitment & volunteer pathways** — Narrative + pipeline stages.  
9. **Local terrain narrative** — River Valley + Ozarks split (Wikipedia/ACS-informed, verified).  
10. **Roll-up-ready cards** — Each card takes `geoScope: { type, id }` for future state/region pages.

---

## 7. Data Model Proposal (TypeScript shapes)

*Illustrative only — not implemented in this document.*

```ts
/** Shared discriminant for every geography node */
export type GeoScope =
  | { level: "state"; stateFips: "05" }
  | { level: "region"; regionSlug: string }
  | { level: "county"; countySlug: string; fips: string }
  | { level: "community"; countySlug: string; communityId: string }
  | { level: "precinct"; countySlug: string; precinctId: string };

export type CountyProfileDoc = {
  scope: { level: "county"; countySlug: string; fips: string };
  version: string;
  overview: { headline: string; summaryMd: string };
  political: unknown; // ties to CountyPoliticalProfileResult subset
  demographic: { sources: string[]; summary: string };
  economic: { sources: string[]; summary: string };
  voter: { registrationNarrative: string; fileAsOf: string | null };
  communityPrecinct: { highlightCommunities: string[]; notes: string };
  leadership: { entries: { name: string; role: string; jurisdiction: string }[] };
  volunteerStrategy: { goals: string; pipelineStages: { label: string; count: number | null }[] };
  candidateRecruitment: { priority: string; seatsOfInterest: string[] };
  issues: { topic: string; localAngle: string }[];
  comms: { messengers: string[]; channelNotes: string };
  riskOpposition: { item: string; sourceUrl?: string; confidence: "high" | "medium" | "low" }[];
  nextActions: { action: string; owner?: string; by?: string }[];
};

export type StrategyProfile = {
  scope: GeoScope;
  pillars: { id: string; title: string; metrics: { key: string; value: string | number | null; action: string }[] }[];
};

export type RollupMetrics = {
  scope: GeoScope;
  asOf: string;
  sumRegistered: number | null;
  sumNewRegs: number | null;
  sumVolunteer: number | null;
  avgReadiness: number | null;
};
```

**Prisma (future, subject to ADR):** optional `CountyProfileJson` or versioned `CountyStrategyDocument` table with `reviewStatus` (mirror `CountyContentReviewStatus` pattern).

**Low-risk file locations for future code (suggested, do not create prematurely):**  
- `src/lib/county/intelligence-view-model.ts`  
- `src/components/intelligence/*` (shared cards)  
- `src/app/(site)/intelligence/...` (public) vs `src/app/admin/.../intelligence/...` (staff)

---

## 8. Build Packet Roadmap (safe order)

| Packet | Name | Outcome | Risk if skipped |
|--------|------|---------|-----------------|
| **1** | Audit Pope current structure | Single markdown audit: routes, data sources, gaps, PII risk | Duplicated work / leaking scope |
| **2** | Region field on county index | Canonical `CampaignRegionSlug` or mapping; document migration | Rollups wrong |
| **3** | Shared county profile schema | TS types + optional JSON contract | Inconsistent UIs |
| **4** | Pope enhanced profile data | One county fully populated in approved format | No template |
| **5** | Reusable visual dashboard components | Card/chart shell + storybook or style-guide page | Inconsistent look |
| **6** | Map / visual placeholders | State/region/county frames + loading states | Map shock later |
| **7** | Region roll-up pages | Region dashboard reads same cards | No middle layer |
| **8** | State dashboard roll-up | Arkansas-wide executive view | No north star |
| **9** | Benton + Washington profiles | Two counties to stress-test | Overfit to Pope |
| **10** | Docs + handoff | Update `docs/README`, thread handoff block | Onboarding cost |

**Dependency rule:** No Packet **5+** without **1–3** signed off. No new Prisma tables without **Steve / counsel** for PII and finance.

---

## 9. UI/UX Principles (shared language)

- **Dense but readable** — use grid, typographic scale, and progressive disclosure, not long scrolls of prose.  
- **Executive dashboard on top** — answer “where are we?” in 5 seconds.  
- **Drill-down intelligence below** — answer “what do I do on Tuesday?” next.  
- **Visual-first** — chart or map for every *comparison*; table for *lookup*.  
- **Every number drives an action** — if a metric has no follow-up, demote it or move to appendix.  
- **Every card answers:** (1) What does this mean? (2) What do we do next?  
- **Honesty** — same spirit as existing COUNTY-INTEL-2 / DATA-1 guardrails.

---

## 10. Recommended Next Cursor Script (Packet 1 — Steve paste)

```text
You are in H:\SOSWebsite\RedDirt only. Read docs/COUNTY_INTELLIGENCE_SYSTEM_PLAN.md, docs/data-targeting-foundation.md, and docs/field-structure-foundation.md.

Packet 1 — Audit Pope County current intelligence structure (read-only, no refactors, no deletions):
1) List all routes, components, and lib modules that touch Pope, Benton, or Washington, or the generic county engine (e.g. county-political-profile, pope-county, CountyCommandExperience, county-briefings, admin county-intelligence, admin county-profiles, arkansas-county-registry, seed for pope-county).
2) For each, summarize: data sources (Prisma tables, static JSON, scripts), PII risk level (low/med/high), and whether it is public or staff-only.
3) Output a new file docs/audits/POPE_COUNTY_INTELLIGENCE_PACKET1_AUDIT.md (create docs/audits/ if needed) with a table and a "gap list" against §1 and §6 of COUNTY_INTELLIGENCE_SYSTEM_PLAN.md.
4) Do not change application behavior. Do not run destructive DB commands. End with 5 recommended next PR titles for Packets 2–4.

Quality gate: npm run check
```

---

## Changelog

| Date | Author | Note |
|------|--------|------|
| 2026-04-27 | Planning session | Initial plan. Missing protocol files noted. |

---

*This document is the contract for a future implementation thread. Update it when region taxonomy or schema decisions change.*
