# Campaign Intelligence System Map

**Lane:** `RedDirt/` · Kelly SOS statewide campaign OS  
**Purpose:** Inventory all known campaign intelligence systems and datasets for NSI-3 synchronization planning.  
**Status:** Read-only reference — no autonomous orchestration.

---

## Overview

This map documents campaign intelligence sources beyond the Kim Hammer opposition corpus. Each entry records stewardship, integration posture, governance sensitivity, and synchronization readiness. NSI-3 uses this map to prepare cross-system composition without introducing mutation surfaces.

**Legend**

| Integration status | Meaning |
| ------------------ | ------- |
| **LIVE** | Governed read path exists in RedDirt lane today |
| **PARTIAL** | Schema or seed exists; not fully synchronized |
| **PLANNED** | Documented target; no production read path yet |
| **EXTERNAL** | Owned outside RedDirt lane; integration packet required |

---

## Campaign Core Systems

### Opposition Intelligence Corpus (Kim Hammer)

- **Purpose:** Curated opponent dossier — bills, claims, debate evidence, profile workbench.
- **Owner / steward:** Opposition research desk · Evidence Command
- **Integration status:** **LIVE**
- **Read / write:** Read via JSON workbench loaders; write via governed review/task/citation workflows only.
- **Governance sensitivity:** HIGH — publication-safety gates, no unsourced opponent claims.
- **AI access level:** Sandboxed suggestions only (NON_PUBLISHABLE); no autonomous claim generation.
- **Synchronization readiness:** READY — stable identifiers (`claimId`, `taskId`, bill keys).
- **Geographic relevance:** Statewide; county overlays via KH-0B + NSI-2.
- **Update cadence:** Operator-driven; retrieval tasks queue gaps.
- **Key identifiers:** `pdeb-*`, `claim-*`, `kh3b-*`, `cite-*`, narrative registry IDs.
- **Future orchestration:** Cross-link to turnout overlays and CountyWorkbench burden signals.

### Narrative Intelligence (NSI-1)

- **Purpose:** Dependency-aware narrative readiness — claims, citations, tasks, exports, AI pressure.
- **Owner / steward:** Evidence governance · NSI layer
- **Integration status:** **LIVE**
- **Read / write:** Read-only composition; registry JSON curated by operators.
- **Governance sensitivity:** HIGH — readiness bands gate external deployment decisions.
- **AI access level:** Read-only context for sandbox routing; no narrative synthesis.
- **Synchronization readiness:** READY — `narrativeId` stable across export and geographic layers.
- **Geographic relevance:** Feeds NSI-2 county overlays.
- **Update cadence:** Recomputed on each admin load from governed primitives.
- **Key identifiers:** `narrativeId` in `kim-hammer-narrative-registry.json`.
- **Future orchestration:** Entity resolution (NSI-4) across counties and exports.

### Citation Locker (V3-C)

- **Purpose:** Durable source cards with health, review state, and claim/narrative linkage.
- **Owner / steward:** Evidence desk · Citation workflow operators
- **Integration status:** **LIVE**
- **Read / write:** Read via locker loader; write via `kimHammerCitationWorkflow` (backup + audit).
- **Governance sensitivity:** CRITICAL — citations anchor all external messaging.
- **AI access level:** Suggestion routing only; no auto-verification.
- **Synchronization readiness:** READY — `cite-*` IDs propagate to export lineage.
- **Geographic relevance:** Indirect via narrative and county burden narratives.
- **Update cadence:** Operator validation; stale/archive-missing signals on demand.
- **Key identifiers:** `cite-*`, `sourceId`, `linkedNarrativeIds`.
- **Future orchestration:** Archive/Wayback revalidation loops; media ecosystem cross-checks.

### Export History & Lineage (V3-E)

- **Purpose:** Governed export events with claim → citation → narrative traceability.
- **Owner / steward:** Export control operators
- **Integration status:** **LIVE**
- **Read / write:** Read via export control; write via `recordKimHammerExportEvent` only.
- **Governance sensitivity:** CRITICAL — external output audit trail.
- **AI access level:** None — exports are human-gated.
- **Synchronization readiness:** READY — feeds NSI-3 usage analytics and fatigue signals.
- **Geographic relevance:** `scope` (STATEWIDE, COUNTY, INTERNAL_DRY_RUN) + optional `countyId`.
- **Update cadence:** Per export event.
- **Key identifiers:** `exportId`, `packetVersion`, `contentChecksum`.
- **Future orchestration:** Export fatigue → debate prep throttling recommendations (read-only).

### Unified Audit Systems (V3-B)

- **Purpose:** Claim review, task, citation, AI, and export audit timeline.
- **Owner / steward:** Evidence governance
- **Integration status:** **LIVE**
- **Read / write:** Read via audit browser; append-only JSON logs per workflow.
- **Governance sensitivity:** HIGH — operator accountability.
- **AI access level:** Audit of AI disposition only.
- **Synchronization readiness:** READY — event types extensible for cross-system sync.
- **Geographic relevance:** Low direct; supports county operator actions.
- **Update cadence:** Per governed mutation.
- **Key identifiers:** Audit entry IDs per workflow artifact.
- **Future orchestration:** Federate volunteer and field audit streams under NSI-4 graph.

### Debate Prep Systems

- **Purpose:** Public debate evidence board, debate packet export, rebuttal/contrast modules.
- **Owner / steward:** Debate prep desk · KH-2/KH-4
- **Integration status:** **LIVE**
- **Read / write:** Read workbench JSON; export via gated API route.
- **Governance sensitivity:** CRITICAL — only export-ready claims pass filter (baseline: 2).
- **AI access level:** KH-4 copilot registry (read-only agents).
- **Synchronization readiness:** READY — claim IDs shared with export history.
- **Geographic relevance:** Debate frames map to NSI-2 county relevance scores.
- **Update cadence:** Operator review cycles.
- **Key identifiers:** `pdeb-*`, debate packet version semver.
- **Future orchestration:** County-aware debate packet variants (human-approved only).

### AI Suggestion Sandbox (V3-D)

- **Purpose:** Deterministic, non-publishable AI suggestion candidates with disposition workflow.
- **Owner / steward:** Evidence governance
- **Integration status:** **LIVE**
- **Read / write:** Read sandbox; disposition records intent only (no downstream auto-mutation).
- **Governance sensitivity:** HIGH — all suggestions NON_PUBLISHABLE until human review.
- **AI access level:** Sandboxed — rule-based live candidates + seeded suggestions.
- **Synchronization readiness:** READY — routes to tasks, citations, narratives by ID.
- **Geographic relevance:** NSI-2/NSI-3 pressure overlays.
- **Update cadence:** Operator disposition + live candidate regeneration.
- **Key identifiers:** `sugg-*`, `relatedNarrativeIds`.
- **Future orchestration:** Read-only strategic readiness prompts over NSI-4 entity graph.

### Geographic Narrative Overlays (NSI-2)

- **Purpose:** County-aware narrative readiness — strength, blockers, local media/debate relevance.
- **Owner / steward:** Regional strategy · Evidence desk
- **Integration status:** **LIVE**
- **Read / write:** Read-only composition over NSI-1 + overlay JSON.
- **Governance sensitivity:** MEDIUM — informs prioritization, not auto-targeting.
- **AI access level:** Read-only context only.
- **Synchronization readiness:** READY — `countyId` keys align with Arkansas registry.
- **Geographic relevance:** PRIMARY — Pulaski, Washington, Benton, Sebastian, Craighead, statewide.
- **Update cadence:** Overlay JSON curated; scores recomputed at load.
- **Key identifiers:** `countyId`, overlay `narrativeIds`.
- **Future orchestration:** CountyWorkbench public portal cross-links.

### Volunteer Systems (Power of 5)

- **Purpose:** Relational organizing, team KPIs, leader dashboards, pipeline gamification.
- **Owner / steward:** Field operations · Organizing desk
- **Integration status:** **PLANNED**
- **Read / write:** Demo/seed UI today; production hydration pending auth + Prisma policy.
- **Governance sensitivity:** HIGH — no public voter microtargeting; aggregate-first public surfaces.
- **AI access level:** None in v1.
- **Synchronization readiness:** PLANNED — stable team/county identifiers needed (NSI-4).
- **Geographic relevance:** County and region hierarchy.
- **Update cadence:** TBD — event-driven field updates.
- **Key identifiers:** Team IDs, county slugs, pipeline stage enums.
- **Future orchestration:** Volunteer intelligence routing without persuasion automation.

### CountyWorkbench

- **Purpose:** Public county portal and aggregate county views (separate product lane).
- **Owner / steward:** County portal team
- **Integration status:** **EXTERNAL**
- **Read / write:** Separate lane — no cross-import without integration packet.
- **Governance sensitivity:** MEDIUM — public aggregate only.
- **AI access level:** None assumed.
- **Synchronization readiness:** PLANNED — county slug + FIPS alignment documented in RedDirt registry.
- **Geographic relevance:** PRIMARY for public county messaging.
- **Update cadence:** Independent release cycle.
- **Key identifiers:** County slug, FIPS code.
- **Future orchestration:** Read-only narrative readiness summaries for county stewards.

### Voter Files

- **Purpose:** Stewarded voter reference for field staff — not a public people browser.
- **Owner / steward:** Data stewardship · DATA-1 policy
- **Integration status:** **PARTIAL**
- **Read / write:** Prisma-backed ingest in RedDirt; strict role gates; no NSI mutation paths.
- **Governance sensitivity:** CRITICAL — PII, no public exposure, no AI training on raw file.
- **AI access level:** PROHIBITED on raw rows — aggregate overlays only in future.
- **Synchronization readiness:** PLANNED — NSI-4 entity resolution required before narrative sync.
- **Geographic relevance:** Precinct/county/region hierarchy.
- **Update cadence:** Ingest batches per election cycle.
- **Key identifiers:** Voter record IDs (internal), county FIPS, precinct keys.
- **Future orchestration:** Turnout-sensitive messaging analysis (read-only, aggregate).

### Election Results

- **Purpose:** Historical election outcomes, registration snapshots, turnout derivation.
- **Owner / steward:** Data ingest · County political profiles
- **Integration status:** **PARTIAL**
- **Read / write:** Read via county profile builders; ingest pipelines for selected counties.
- **Governance sensitivity:** MEDIUM — public aggregate data; no individual inference.
- **AI access level:** Aggregate context only.
- **Synchronization readiness:** PARTIAL — Pope and registry counties seeded; full statewide ingest incomplete.
- **Geographic relevance:** County and precinct level.
- **Update cadence:** Post-election ingest.
- **Key identifiers:** County FIPS, election date, office codes.
- **Future orchestration:** Turnout overlay on NSI-2 geographic readiness.

### County Governance Data

- **Purpose:** Clerk/commissioner/quorum court operational context for election administration burden framing.
- **Owner / steward:** KH-0B legislative intelligence · Regional desk
- **Integration status:** **PARTIAL**
- **Read / write:** Read via KH-0B JSON narratives; no live clerk API integration.
- **Governance sensitivity:** MEDIUM — verify before local deployment.
- **AI access level:** None.
- **Synchronization readiness:** PARTIAL — burden signals in NSI-2 overlays; live clerk feeds PLANNED.
- **Geographic relevance:** County-primary.
- **Update cadence:** Operator research + public records pulls.
- **Key identifiers:** `countyId`, bill narrative IDs (SB487, etc.).
- **Future orchestration:** Auto-suggest retrieval tasks from clerk statement deltas (human-gated).

### Census API Datasets

- **Purpose:** Demographic overlays for regional messaging analysis.
- **Owner / steward:** Data / regional strategy
- **Integration status:** **PLANNED**
- **Read / write:** No production Census API client in Kim Hammer path.
- **Governance sensitivity:** LOW for aggregate public ACS; no household-level storage.
- **AI access level:** Aggregate overlays only when integrated.
- **Synchronization readiness:** PLANNED — tract/county crosswalk to FIPS required.
- **Geographic relevance:** County, tract, media market.
- **Update cadence:** Annual ACS releases.
- **Key identifiers:** FIPS, GEOID, ACS vintage.
- **Future orchestration:** Demographic narrative overlays (read-only composition).

### Bureau of Labor Statistics Datasets

- **Purpose:** Economic indicators for regional issue framing.
- **Owner / steward:** Regional strategy / comms
- **Integration status:** **PLANNED**
- **Read / write:** Not integrated in opposition workbench.
- **Governance sensitivity:** LOW — public aggregate statistics.
- **AI access level:** Aggregate context only (future).
- **Synchronization readiness:** PLANNED — county/MSA mapping needed.
- **Geographic relevance:** County and MSA.
- **Update cadence:** Monthly/quarterly releases.
- **Key identifiers:** Series IDs, county FIPS, MSA codes.
- **Future orchestration:** Economic stress signals in geographic narrative overlays.

### GIS / County Overlays

- **Purpose:** Spatial county boundaries, precinct maps, regional dashboard shells.
- **Owner / steward:** Engineering · Regional pages
- **Integration status:** **PARTIAL**
- **Read / write:** Registry-derived county lists; map assets selective (e.g., Pope dashboard).
- **Governance sensitivity:** MEDIUM — no household geocoding on public pages.
- **AI access level:** None.
- **Synchronization readiness:** PARTIAL — FIPS/slug registry LIVE; full GIS sync PLANNED.
- **Geographic relevance:** PRIMARY.
- **Update cadence:** Static boundaries; dynamic map layers as needed.
- **Key identifiers:** County slug, FIPS, region slug.
- **Future orchestration:** Map visualization for NSI-2/NSI-3 dashboards.

### Media Market Datasets

- **Purpose:** DMA / local media market targeting context for narrative deployment risk.
- **Owner / steward:** Comms / regional strategy
- **Integration status:** **PLANNED**
- **Read / write:** `localMediaRisk` seeded in NSI-2 overlays only.
- **Governance sensitivity:** MEDIUM — no automated ad targeting from opposition intel.
- **AI access level:** None.
- **Synchronization readiness:** PLANNED — DMA ↔ county mapping artifact needed.
- **Geographic relevance:** Multi-county media markets (e.g., Little Rock, NWA).
- **Update cadence:** Static DMA definitions; dynamic saturation from export analytics.
- **Key identifiers:** DMA code, countyId, `localMediaRisk` enum.
- **Future orchestration:** Media saturation awareness in NSI-3 fatigue signals.

### Turnout History

- **Purpose:** Historical participation patterns for strategic readiness analysis.
- **Owner / steward:** Data ingest · OIS dashboards
- **Integration status:** **PARTIAL**
- **Read / write:** Derived in county profiles where election rows exist.
- **Governance sensitivity:** MEDIUM — aggregate only on public surfaces.
- **AI access level:** Aggregate overlays only.
- **Synchronization readiness:** PARTIAL — linked to election results ingest.
- **Geographic relevance:** County and precinct.
- **Update cadence:** Post-election updates.
- **Key identifiers:** County FIPS, election ID, turnout percentage fields.
- **Future orchestration:** Turnout-sensitive messaging analysis (read-only).

### Field Operations Datasets

- **Purpose:** Canvass, phone bank, event coverage, completion metrics.
- **Owner / steward:** Field directors
- **Integration status:** **PLANNED**
- **Read / write:** Not wired to Kim Hammer NSI layers.
- **Governance sensitivity:** HIGH — operational security; no public raw logs.
- **AI access level:** None in v1.
- **Synchronization readiness:** PLANNED — event IDs and county scope required.
- **Geographic relevance:** County, precinct, team territory.
- **Update cadence:** Daily during active field periods.
- **Key identifiers:** Shift IDs, team IDs, countyId.
- **Future orchestration:** Field-operation synchronization with narrative readiness (human-gated).

### Event / Contact Systems

- **Purpose:** CRM-style supporter and event tracking for campaign operations.
- **Owner / steward:** Operations / fundraising ops
- **Integration status:** **PLANNED**
- **Read / write:** External or future Prisma modules — not in NSI path.
- **Governance sensitivity:** CRITICAL — PII, consent, finance compliance.
- **AI access level:** PROHIBITED on contact records without explicit policy.
- **Synchronization readiness:** PLANNED — stable contact/event IDs for NSI-4 graph.
- **Geographic relevance:** Event location, county, media market.
- **Update cadence:** Real-time operational.
- **Key identifiers:** Event ID, contact ID (internal), countyId.
- **Future orchestration:** Event-aware narrative deployment notes (read-only).

### Fundraising / Finance Integrations

- **Purpose:** Compliance-aware fundraising data for resource prioritization context.
- **Owner / steward:** Finance / compliance
- **Integration status:** **PLANNED**
- **Read / write:** Not integrated with opposition NSI stack.
- **Governance sensitivity:** CRITICAL — FEC/state compliance, no public donor PII.
- **AI access level:** PROHIBITED without compliance review.
- **Synchronization readiness:** PLANNED — aggregate budget signals only if synced.
- **Geographic relevance:** Low direct; resource allocation by region possible.
- **Update cadence:** Reporting cycles.
- **Key identifiers:** Report IDs, committee IDs (internal).
- **Future orchestration:** Resource prioritization hints tied to geographic narrative readiness (read-only).

### Public Records Repositories

- **Purpose:** Act text, clerk filings, legislative records supporting citation locker.
- **Owner / steward:** Research desk
- **Integration status:** **PARTIAL**
- **Read / write:** Manual capture into citation locker; no automated scraper in NSI path.
- **Governance sensitivity:** MEDIUM — verify primary sources before claims.
- **AI access level:** None — human capture only.
- **Synchronization readiness:** PARTIAL — citations link to URLs; retrieval tasks queue gaps.
- **Geographic relevance:** State and county clerk records.
- **Update cadence:** Ad hoc research cycles.
- **Key identifiers:** `cite-*`, source URLs, bill numbers.
- **Future orchestration:** Automated retrieval task generation from docket deltas (human review).

### Archive / Wayback Infrastructure

- **Purpose:** Durable capture of web sources; `ARCHIVE_MISSING` health signals in citation locker.
- **Owner / steward:** Evidence desk
- **Integration status:** **PARTIAL**
- **Read / write:** `archiveCaptured` flag on citation cards; manual capture workflow.
- **Governance sensitivity:** MEDIUM — provenance for external messaging.
- **AI access level:** None.
- **Synchronization readiness:** PARTIAL — health signals LIVE; automated capture PLANNED.
- **Geographic relevance:** Low direct.
- **Update cadence:** On citation validation.
- **Key identifiers:** `cite-*`, `sourceUrl`, Wayback snapshot URL (when captured).
- **Future orchestration:** Stale citation revalidation loops feeding NSI-3 `USAGE_STALE`.

---

## NSI Layer Stack (Kim Hammer Path)

```text
Governance → Workflow → Memory → Citation Intelligence → AI Sandbox
→ Export Lineage → Narrative State (NSI-1) → Geographic Narrative (NSI-2)
→ Usage Analytics & Fatigue (NSI-3) → [NSI-4 Entity Graph — PLANNED]
```

---

## Cross-Lane Boundaries

| Lane | Integration rule |
| ---- | ---------------- |
| `sos-public/` | No RedDirt imports without approved packet |
| `countyWorkbench/` | County slug/FIPS alignment only; no voter file cross-import |
| `ajax/`, `phatlip/` | Out of scope for NSI-3 |

---

*Generated for NSI-3 Campaign Intelligence Source Mapping. Update when new systems achieve LIVE status.*
