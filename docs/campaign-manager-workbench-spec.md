# Campaign Manager Workbench spec (BRAIN-OPS-1) (RedDirt)

**Packet BRAIN-OPS-1 (Part C).** **Architecture-first** specification for the **Campaign Manager (CM) Workbench** as the **command center**: the layout and bands operators see **after** (conceptually) the deterministic brain classifies truth—**no** full UI build in this packet.

**Cross-ref:** [`deterministic-brain-foundation.md`](./deterministic-brain-foundation.md) · [`candidate-county-brief-foundation.md`](./candidate-county-brief-foundation.md) (visit prep: summary + Wikipedia unabridged) · [`campaign-manager-orchestration-map.md`](./campaign-manager-orchestration-map.md) · [`workbench-build-map.md`](./workbench-build-map.md) · [`truth-governance-ownership-map.md`](./truth-governance-ownership-map.md)

---

## 1. North star

The **Campaign Manager Workbench** is the **single command surface** where an operator can:

- See **classified** campaign state (truth + health), not raw ambiguous metrics.
- Act on **unified incoming work** (or drill to subordinate queues).
- Navigate **division** responsibilities without duplicating separate “HQ” products per department.
- Receive **recommendations** that are explicitly **non-authoritative** unless backed by resolved truth.

**Today’s anchor:** `/admin/workbench` (`workbench/page.tsx`) is the **closest** physical hub; this spec describes the **target bands** that should wrap or replace ad-hoc sections over time.

---

## 2. Layout bands

| Band | Role |
|------|------|
| **Command Bar** | Global search, actor context, cycle/phase label (manual or config), quick links to **seats** and **policy** references. |
| **Truth + Health Panel** | **Deterministic** snapshot: goal integrity, pipeline errors (`CountyCampaignStats.pipelineError`), ledger/budget flags, compliance AI gate summary, **seat vacancy** count. |
| **Unified Incoming Work** | UWR-1 list + filters; badges for source type; **never** merge unrelated objects into one DB table—**one view**, many pointers. |
| **Division Command Grid** | Eight divisions (see [`division-workbench-alignment.md`](./division-workbench-alignment.md)): maturity, primary route, **open count** proxy, deep link. |
| **Goals + Path Panel** | Registration goals (`CountyCampaignStats` / `county-goals.ts`), voter metrics snapshot, **honest** path-to-goal docs link—**no** fake vote-share without ingested results. |
| **Geographic Command View** | `County` lens: goals, metrics, field coverage (when FIELD-GEO seam exists), optional map/list—canonical **County** only. |
| **Strategic Recommendations** | AI/heuristic cards with **ADVISORY_ONLY** / **REVIEW_REQUIRED** labels; citations to **authoritative** rows or docs. |
| **Visit prep / Candidate brief** | **T−1 day** county packet: **dense summary** (demographics, metrics, labeled estimates) + **unabridged** Wikipedia context; email + workbench artifact ([`candidate-county-brief-foundation.md`](./candidate-county-brief-foundation.md)). |

---

## 3. What each band shows

### 3.1 Command Bar

| | |
|--|--|
| **Purpose** | Orientation + safe navigation; no hidden mode switches. |
| **Key signals** | Logged-in admin user; optional “impersonation” **out of scope** here. |
| **Feeds from** | Auth layout, `AdminBoardShell` nav. |
| **Built** | Partially (`AdminBoardShell`, workbench back-links). |
| **Missing** | Explicit “truth mode” / environment banner; unified global search across work objects. |

### 3.2 Truth + Health Panel

| | |
|--|--|
| **Purpose** | Surface **STALE** / **BLOCKED** / **REVIEW_REQUIRED** **deterministically** (not prettified guesses). |
| **Key signals** | Voter pipeline errors; budget variance thresholds; count of `ComplianceDocument` pending AI approval; **unfilled** `PositionSeat`. |
| **Feeds from** | `CountyCampaignStats`, `budget-queries.ts`, `seating.ts`, compliance list queries. |
| **Built** | **Pieces** exist on separate pages; **not** one panel. |
| **Missing** | `resolveTruthSnapshot`-style aggregator (BRAIN-OPS-2). |

### 3.3 Unified Incoming Work

| | |
|--|--|
| **Purpose** | One sortable **open work** index. |
| **Key signals** | Open email items, intakes, tasks; counts by source (`open-work.ts`). |
| **Feeds from** | `EmailWorkflowItem`, `WorkflowIntake`, `CampaignTask`. |
| **Built** | **`UnifiedOpenWorkSection`**, `getOpenWorkForCampaignManager`. |
| **Missing** | Submissions, festivals, conversation opportunities in same list **without** losing type safety (UWR-2). |

### 3.4 Division Command Grid

| | |
|--|--|
| **Purpose** | CM sees **who owns what domain** and **where to click**—aligns to BLUEPRINT divisions. |
| **Key signals** | Maturity label; “primary workbench” route; optional open-count proxies per division. |
| **Feeds from** | Static map + live counts (queries per division in later packets). |
| **Built** | **Conceptual** only; orchestration doc + maturity map. |
| **Missing** | UI grid component; per-division metric contracts. |

### 3.5 Goals + Path Panel

| | |
|--|--|
| **Purpose** | Registration organizing truth + narrative discipline (DATA-2/3). |
| **Key signals** | `registrationGoal`, `newRegistrationsSinceBaseline`, `CountyVoterMetrics` rollups. |
| **Feeds from** | `county-goals.ts`, public/admin county APIs. |
| **Built** | Data layer + some surfaces; **not** unified CM strip. |
| **Missing** | Single CM panel wiring; **FieldUnit** attribution to goals (schema gap). |

### 3.6 Geographic Command View

| | |
|--|--|
| **Purpose** | **County-canonical** operations picture. |
| **Key signals** | Goals, metrics, events, threads with `countyId`; field assignments when linked. |
| **Feeds from** | `County`, `CountyVoterMetrics`, `CampaignEvent`, `CommunicationThread`, `field.ts`. |
| **Built** | County admin + public pages; workbench county filter partial. |
| **Missing** | `FieldUnit`↔`County` enforced join; single “geographic command” route. |

### 3.7 Strategic Recommendations

| | |
|--|--|
| **Purpose** | **Advisory** next actions with eligibility tags. |
| **Key signals** | AI assistant, heuristics (E-2, talent stubs), **must** show **TruthClass** / governance. |
| **Feeds from** | `assistant` route, `search.ts`, future `truth` resolver. |
| **Built** | Assistant + email interpretation; **not** unified “recommendation deck.” |
| **Missing** | Explicit **RecommendationEligibility** in UI; prohibition on presenting inference as KPI. |

### 3.8 Visit prep / Candidate brief

| | |
|--|--|
| **Purpose** | Give the candidate a **scannable** county summary **before** each visit and a **deep** read (Wikipedia-sourced + staff notes later)—**county now**, cities when volunteers add structured local intel. |
| **Key signals** | `CountyPublicDemographics`, `CountyVoterMetrics` / goals, county seats directory, optional **MODELED** youth/HS estimates **only** with disclaimer; unabridged from `docs/ingested/county-wikipedia/`; trigger from `CampaignEvent` **T−1 day**. |
| **Feeds from** | DB county tables + Wikipedia ingest + future ACS/ADE; [`candidate-county-brief-foundation.md`](./candidate-county-brief-foundation.md). |
| **Built** | Wikipedia markdown ingest + RAG; **no** brief renderer, **no** T−1 email, **no** `VisitBrief` table yet. |
| **Missing** | BRIEF-1…BRIEF-3 packets (artifact, render, email + workbench UI). |

---

## 4. Navigation hierarchy (target)

**Left nav / sections** (conceptual—align to `AdminBoardShell` over time):

1. **Campaign Manager** — workbench hub (this spec); **future** “Visit briefs” list (T−1 county packets per [`candidate-county-brief-foundation.md`](./candidate-county-brief-foundation.md)).
2. **Incoming** — unified open work (expand UWR-1).
3. **Communications** — comms + email workflow + social subtree (existing).
4. **Field & People** — events, tasks, festivals, volunteers, field units.
5. **Data** — voter import, insights, targeting docs links / future warehouse UI.
6. **Finance** — ledger, budgets.
7. **Compliance & Policy** — documents, policy reference.
8. **Organization** — positions, seats, seating coverage.
9. **Content & Media** — owned media, review, editorial.

Deep links **must** land on **existing** routes (`workbench-build-map.md`) until consolidation ships.

---

## 5. What should never appear as “truth”

| Signal | Why |
|--------|-----|
| **Raw `SearchChunk` / RAG snippet** | May be wrong or stale; **not** operational authority. |
| **AI-generated email interpretation** | Advisory until operator confirms. |
| **`User.county` string** | Not FK to `County`; do not drive reporting without normalization. |
| **Segment JSON rules** | Opaque until documented; not voter strength. |
| **Files on disk** (e.g. `H:\SOSWebsite\campaign information for ingestion\electionResults\*.json`) | **Provisional** until ingested to Prisma election tables. |
| **Discord messages** | Coordination only; see [`discord-integration-foundation.md`](./discord-integration-foundation.md). |
| **Talent / GAME scores** | Not gates until human policy says so. |

---

*Last updated: Packet BRAIN-OPS-1.*
