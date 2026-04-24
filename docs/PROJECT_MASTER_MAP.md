# RedDirt — PROJECT MASTER MAP (MASTER-MAP-1)

**Purpose:** Single **canonical continuity document** for a **new AI thread** or expert collaborator working in **`RedDirt/`**.

**Orientation (read first):** **[`THREAD_HANDOFF_MASTER_MAP.md`](./THREAD_HANDOFF_MASTER_MAP.md)** (**THREAD-HANDOFF-1**) is the **first** orientation doc — vision, loop, guardrails, lane table, next paths.  
**Operating protocol:** **[`BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md`](./BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md)** (**PROTO-2** + **BLUEPRINT-OPS-1**) — return formats, packet scaling, preflight, drift checks.  
**Blueprint rule:** **Every** packet should **update** blueprint status here, in the thread handoff, and in any lane doc the packet claims.

Use this file as the **primary** `@` reference for **packet** history and code-grounded lists; use the **thread handoff** when **onboarding a fresh** ChatGPT thread with **no** prior chat.

**Stack (ground truth):** Next.js App Router · Prisma · PostgreSQL · optional OpenAI / RAG · package `reddirt-site`.

**Quality gate:** `npm run check` (lint + `tsc --noEmit` + build) before significant pushes. Local dev: `npm run dev:full` (see root `README.md`).

---

## Table of contents

1. [What this project is](#1-what-this-project-is)
2. [Blueprint Progress Ledger](#blueprint-progress-ledger)
3. [Core build philosophy](#2-core-build-philosophy)
4. [Work protocol with Cursor](#3-work-protocol-with-cursor)
5. [System north star](#4-system-north-star)
6. [Major foundation rails](#5-major-foundation-rails)
7. [Major departments / level-3 domains](#6-major-departments--level-3-domains)
8. [What has been built so far (packet map)](#7-what-has-been-built-so-far-packet-map)
9. [Current real capabilities (code-grounded)](#8-current-real-capabilities-code-grounded)
10. [Major models / tables / system assets](#9-major-models--tables--system-assets)
11. [Source-of-truth notes](#10-source-of-truth-notes)
12. [Known strengths of the current repo](#11-known-strengths-of-the-current-repo)
13. [Known gaps / fragmentation](#12-known-gaps--fragmentation)
14. [Launch strategy](#13-launch-strategy)
15. [Agent knowledge / ingest strategy](#14-agent-knowledge--ingest-strategy)
16. [What a new AI thread should do first](#15-what-a-new-ai-thread-should-do-first)
17. [Recommended next packets](#16-recommended-next-packets)
18. [Appendix: key docs to read next](#appendix-key-docs-to-read-next)

---

## 1. What this project is

**Campaign operating system, not just a marketing site.** RedDirt is a **real operations codebase**: public voter-facing pages, forms, county storytelling, **and** a large admin **workbench** surface for comms, social monitoring, events, content, and growing **foundation rails** (incoming work, positions, seating, policy, budget, ledger, field units, launch planning helpers).

**Statewide race without a traditional staff footprint.** The product vision assumes **one operator can hold the mental model**—incoming → triage → route → act → close—while the system **aggregates** open work and **deep-links** into specialized tools. Scaling is **seat-based** and **assignment-based** on **shared objects**, not duplicate “department apps.”

**AI as digital campaign manager (advisory, not autonomous).** The repo already has substantial **RAG**, **assistant**, **comms thread** summaries, form **classification**, and **deterministic** email-workflow **interpretation** (E-2A/B). Governance is explicit: **queue-first** for sensitive paths, **no blind auto-send** from the email workflow packet line, **human** finality for trust and compliance-adjacent moves.

**Bottom-up philosophy.** Organizing is meant to meet people **where they are**—county pages, local proof points, field rails, volunteer intake—without collapsing everything into a single generic national template. Public tone aims to be **calm**, direct, and human (see `docs/philosophy/`, `docs/narrative/`, `docs/brand/`).

**Honest boundary:** Philosophy and narrative live in `docs/` and `src/content/`; **code reality** is the admin app + Prisma models. When they diverge, **prefer honest “doc intent vs code today”** language (this file tries to do that throughout).

---

## Blueprint Progress Ledger

Compact **lane** status for **blueprint** continuity (maturity = **L0–L5**; see [`BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md`](./BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md)). Update this table when a packet **materially** advances a lane.

| Lane | Current status (Apr 2026) |
|------|---------------------------|
| **Email Workflow Intelligence** | **Strongest** lane. **Queue-first**, **approval-first**; E-1/E-2 in code; **policy-gated** automation still needed for any no-review send. |
| **Relational Organizing** | **REL-2** at **L2** (persistence, admin seam, truth snapshot advisory). **REL-3** (volunteer home, rollups, dedupe) **pending**; **migration** apply per environment. |
| **GOTV / Voter File** | **Persistence** + import **foundations** exist (voter file, models, election ingest, signals); **turnout planning read models** (e.g. **GOTV-1**) still **pending** relative to full GOTV doc vision. |
| **Workbench** | **Hierarchy** and many **surfaces** exist; **operator workflows** still **expanding** toward CM orchestration spec. |
| **Truth Snapshot / Deterministic Brain** | **Advisory** governance **layer** in code (`truth` / `getTruthSnapshot`); **must not** become an **authority** tier over data or policy. |
| **AJAX Organizing Hub / Discord** | **Communication** infrastructure (concept + foundation docs); **not** system source of truth. |
| **Finance / Compliance** | **Must** remain **approval-** and **audit-first**; ledger/budget/compliance paths are **governed**, not auto-executing. |
| **Volunteer / Field** | Needs **volunteer-facing UX** and **county** / relational **rollups** in product (per REL / VOL / FIELD packets). |
| **Content / Author Studio** | Exists in **pieces** across comms, editorial, media; **queue / publishing** governance must stay explicit. |
| **Data inventory** | [`database-table-inventory.md`](./database-table-inventory.md) **table count** may **drift**; **refresh** after **schema** changes. |

---

## 2. Core build philosophy

| Principle | Meaning in this repo |
|-----------|----------------------|
| **Foundation-first** | Name **rails** (incoming, identity, assignment, policy, geography) before thickening specialty UI. See FND-1 + [`shared-rails-matrix.md`](./shared-rails-matrix.md). |
| **Rails before specialty features** | Workbenches are **execution surfaces** on shared objects; avoid one-off queues that bypass provenance and assignment patterns. |
| **Queue-first where sensitive** | Email workflow (`EmailWorkflowItem`) is **review-first**; comms execution stays on **`CommunicationSend`** / broadcast paths with their own policy. Do not merge “triage” and “send” semantics without an explicit product decision. |
| **Humans retain final authority** | E-2B **preserves** operator-set triage fields; ALIGN-1 describes **overrides as learning signal**, not silent model governance. |
| **Existing features are evidence, not the architecture** | Current routes inform **migration order** and DTOs; **target shape** is in [`unified-campaign-engine-foundation.md`](./unified-campaign-engine-foundation.md). |
| **Packet-by-packet delivery** | Each packet updates **blueprint docs** + **small, reviewable** code (or doc-only where scoped). Names like **E-1**, **UWR-1**, **BUDGET-2** are **contracts** for continuity. |

---

## 3. Work protocol with Cursor

This section captures **how this project is meant to be extended** with AI assistance so threads **do not rediscover or drift**.

**Cycle**

1. **User** runs a scoped task in Cursor (or pastes results back).
2. **We** read outputs, reconcile with **existing** docs and code, and **compose the next packet** (scope, acceptance criteria, explicit *out of scope*).
3. **Every packet** should **update the blueprint**: foundation doc section, `docs/README.md` row if needed, and **this master map** when the continuity story shifts.
4. **Every packet** should instruct the implementer to **inspect what already exists**—grep routes, read `workbench-build-map`, check `database-table-inventory.md`—before adding models.
5. **Avoid rebuilding** if a capability exists: e.g. unified open work is already **`getOpenWorkForCampaignManager`**; comms execution already lives in **`comms-workbench`**; don’t add a second “send engine” without cause.
6. **Do not drift into specialty UI too early** if the rail isn’t named (e.g. building a flashy dashboard before **incoming** and **assignment** stories are honest).
7. **Lay seams ahead of time**: typed stubs (`extension-points.ts`, `campaign-engine/*.ts`), provenance keys in `metadataJson`, read-only helpers (`launch.ts`, `county-goals.ts`).
8. **Docs + code + handoff continuity are one build artifact**. A feature without a doc row **will be misinterpreted** by the next thread.

**Tone for AI collaborators:** Prefer **calm**, **precise**, **campaign-safe** language; match the movement voice in philosophy docs when writing user-facing copy; never **overclaim** legal compliance or consent.

---

## 4. System north star

**Finished vision (multi-year):**

- **Campaign Manager orchestration** — one layer that answers “what needs attention next?” across departments, without replacing specialized editors.
- **Role-based / seat-based scaling** — [`position-system-foundation.md`](./position-system-foundation.md), `PositionSeat`, position workbenches; **not** full RBAC yet.
- **AI-guided, human-governed** — suggestions, summaries, interpretation; **execution** and **trust expansion** stay human where policy says so.
- **Automation-first where safe** — cron/webhooks, bounded status updates; **never** “magic send” from scattered tools.
- **Personalized workbenches** — position inbox **read layer** today; richer personalization is **future** on top of ALIGN-1 + seating.
- **Launch via re-engagement** — bounded cohorts, **consent-aware** messaging, responses routed into **intake / email workflow / threads** (LAUNCH-1).
- **County-led organizing** — `County` spine, county pages, metrics, field units; **GEO-1** documents gaps between FK, slug, and free-text county shapes.
- **Future departments** (data, field ops depth, youth execution, fundraising desk, compliance depth, budget commitments, comms unification) **under one mental model** — FND-1 layers and rails, not separate siloed products.

---

## 5. Major foundation rails

Status legend: **Doc** = documented only · **Scaffold** = types/stubs/minimal code · **Partial** = real queries/UI, incomplete coverage · **Build-on** = solid enough for next features without redesign.

| Rail | Role | Status (Apr 2026) | Notes |
|------|------|-------------------|--------|
| **AI brain / alignment** | RAG, assistant, comms AI, E-2 heuristics; ALIGN-1 types | **Partial** + **Scaffold** | Runtime: `src/lib/openai/`, `assistant/`, `comms/ai.ts`; alignment **types** in `alignment.ts` / `overrides.ts` — **no** alignment version table |
| **Assignment** | `assignedToUserId` patterns, open-work helpers | **Partial** | UWR-1 + seat-aware **read**; **no** `positionId` on source rows |
| **Unified incoming work** | Merged list for CM | **Partial** | **UWR-2:** `getOpenWorkForCampaignManager` — email + intake + task + **actionable threads** + **pending festival ingests**; **`Submission`** still **out** (no triage state); see [`unified-open-work-expansion-notes.md`](./unified-open-work-expansion-notes.md) |
| **Position system** | Org tree, job defs | **Scaffold** + **Doc** | `positions.ts` tree; docs are canonical until DB-backed |
| **Seating** | Who sits where | **Partial** | `PositionSeat` + `/admin/workbench/seats`; **staffing metadata**, not RBAC |
| **Talent / training** | Advisory development | **Scaffold** | `talent.ts` / `training.ts` types only |
| **Compliance** | Governance + doc intake | **Partial** + **Doc** | COMP-1 types; COMP-2 **`ComplianceDocument`** upload UI |
| **Policy** | Campaign defaults | **Partial** | `CAMPAIGN_POLICY_V1` in `policy.ts`; wired where noted (e.g. disclaimer) |
| **Finance / budget** | Ledger + plans vs actuals | **Partial** | `FinancialTransaction` + confirm; `BudgetPlan` / `BudgetLine` + variance views |
| **Geography / county** | County spine, metrics | **Partial** + **Doc** | Strong `County` usage; GEO-1 documents **fragmentation** (FieldUnit vs County, etc.) |
| **Identity / voter link** | User ↔ voter file | **Partial** + **Doc** | `linkedVoterRecordId`; volunteer matching helpers; IDENTITY-1 narrative |
| **Launch activation** | Re-engagement planning | **Scaffold** + **Doc** | `launch.ts` read-only counts/lists; **no** send automation |
| **Communications unification** | Single story across surfaces | **Doc** | COMMS-UNIFY-1 maps concepts; **no** unified `Message` table |
| **Data / targeting** | County goals, voter file, **election tabulation ingest**, **voter signals + provisional tiers + interaction log** | **Partial** + **Doc** | `VoterRecord`, **`VoterSignal`**, **`VoterModelClassification`**, **`VoterInteraction`**, **`VoterVotePlan`** (VOTER-MODEL-1 + INTERACTION-1); metrics, precinct **string** only; **DATA-4** tabulation (no per-voter vote history); precinct crosswalk still **not** solved |

---

## 6. Major departments / level-3 domains

| Domain | Maturity | What already exists | Biggest gap | Likely next step |
|--------|----------|---------------------|-------------|------------------|
| **Campaign Manager** | **Partial UI → thin L3 bands** | CM-1 maps; **`/admin/workbench`** hub; **CM-2** **`CampaignManagerDashboardBands`** (truth / warnings / governance / division grid); **UnifiedOpenWorkSection**; **UWR-2** wider open-work read | Dedicated CM shell; **unified work index** in DB; actor-scoped hub | **CM-3:** “for me” band + drill-downs; **UWR-3:** county filter, governed **Submission** queue if status exists |
| **Communications** | **Strong** | Comms workbench (plans, drafts, sends, recipients), Tier-2 broadcast, threads + AI hints, email workflow queue | One **orchestrated** “intent → execution” **metadata** story across Tier 1/2/social | Deep links from plan/send failure → E-1 item; glossary per COMMS-UNIFY-1 |
| **Field / organizing** | **Mid** | Events, festivals, tasks, county pages, **FieldUnit** / **FieldAssignment** (read) | **FieldUnit ↔ County** linkage; precinct ops; volunteer **pipeline** cohesion | GEO-2 or field admin UI on assignments; festival → intake automation (policy) |
| **Finance / fundraising** | **Early** | FIN-1/2 ledger + BUDGET-2; FUND-1 **types** | Fundraising **desk** UI; donor workflows; commitments | FUND-2 persistence + desk route when ready |
| **Data / research** | **Mid** | Voter import, county metrics, `CountyCampaignStats`, analytics hooks | **Targeting** “universe” models; warehouse story | Data dictionary ingest; honest reporting on what metrics mean |
| **Compliance** | **Early** | COMP-1 types; COMP-2 uploads; policy defaults | Legal **rules engine**, filing automation, deep ingest | RAG on compliance docs **only** with governance; expand SOP docs |
| **Talent / training** | **Scaffold** | TALENT-1 docs + types | Observation ingestion, LMS, UI | TALENT-2 event contract when product priority |
| **Youth** | **Scaffold** | YOUTH-1 docs + `youth.ts` types | Programs, content, routing | Youth content ingest + first real UI when scoped |

---

## 7. What has been built so far (packet map)

Packets are **the project’s memory**. Below: **what moved** system-wide, not just names.

### Email & workflow intelligence

- **E-1** — `EmailWorkflowItem` model, enums, DTOs, queries, **`/admin/workbench/email-queue`**, manual create, **queue-first** policy encoded.
- **E-2A** — Deterministic **interpretation** pipeline (`src/lib/email-workflow/intelligence/*`), provenance in `metadataJson.emailWorkflowInterpretation`, **`ENRICHED`** status, manual “Run interpretation,” E-3/E-4 **typed stubs** in `extension-points.ts`. **No** LLM in this path.
- **E-2B** — Per-field triage writeback (respect operator overrides), **WorkbenchPill** + **EmailWorkflowInterpretationProvenancePanel**, shared patterns for other queues; [`workbench-build-map.md`](./workbench-build-map.md) as planning hub.

### System & orchestration (docs-first)

- **SYS-1** — [`public-site-system-map.md`](./public-site-system-map.md), [`system-domain-flow-map.md`](./system-domain-flow-map.md): public vs admin flows, form persistence, gaps (**`WorkflowIntake`** not universal on all forms).
- **CM-1** — [`campaign-manager-orchestration-map.md`](./campaign-manager-orchestration-map.md), [`incoming-work-matrix.md`](./incoming-work-matrix.md): CM as layer above workbenches; fragmentation made explicit.
- **CM-2** — [`campaign-manager-dashboard-bands.md`](./campaign-manager-dashboard-bands.md): thin **read-only** dashboard bands on **`/admin/workbench`** consuming **`getTruthSnapshot()`** (no new metrics); division grid + honest gaps.

### Foundation engine

- **FND-1** — [`unified-campaign-engine-foundation.md`](./unified-campaign-engine-foundation.md), [`shared-rails-matrix.md`](./shared-rails-matrix.md), `src/lib/campaign-engine/README.md`, `vocabulary.ts`: **target architecture** vs **repo evidence**.
- **ROLE-1** — Position tree (`positions.ts`), job definitions, hierarchy docs; **no** Prisma position table.
- **TALENT-1** — Advisory talent + training **types** and rich docs; **no** engine.
- **BRAIN-1** — `ai-brain.ts`, `ai-context.ts` + brain/integration **docs**; maps existing AI touchpoints.
- **ALIGN-1** — `alignment.ts`, `overrides.ts`, `user-context.ts` + docs; **no** persistence for overrides.
- **BRAIN-OPS-1** — `truth.ts` + deterministic brain **docs** (truth classes / governance vocabulary; **no** resolver).
- **BRAIN-OPS-2** — `truth-snapshot.ts` **`getTruthSnapshot`** — repo-grounded health read model; thin JSON on **`/admin/workbench`**.
- **BRAIN-OPS-3** — **Same file:** county goal **mirror** check (`registrationGoal` vs latest COMPLETE snapshot **`countyGoal`**), **stale** signals (pipelineError, compliance AI gate, draft-only ledger, CM-subtree vacancies), **conflicts** for numeric mirror mismatch; **`warningGroups`**.
- **PROTO-1** — [`progressive-build-protocol.md`](./progressive-build-protocol.md), [`master-blueprint-expansion-rules.md`](./master-blueprint-expansion-rules.md) — progressive packet discipline + blueprint expansion **obligations**.

### Assignment, work, seating

- **ASSIGN-1** — Assignment rail **docs** + types; conceptual position inbox.
- **UWR-1** — **`getOpenWorkForCampaignManager`** / user variants; **`UnifiedOpenWorkSection`** on main workbench; merges **email workflow + intake + tasks** (read-only, bounded).
- **UWR-2** — [`unified-open-work-expansion-notes.md`](./unified-open-work-expansion-notes.md): **`ArkansasFestivalIngest` `PENDING_REVIEW`** in CM merge + counts; **`CommunicationThread` `NEEDS_REPLY`/`FOLLOW_UP`** in user/unassigned + CM paths; **`Submission`** rejected until governed status/`href` exist.
- **WB-CORE-1** — **`/admin/workbench/positions`**, **`[positionId]`**; `position-inbox.ts` heuristics; read-only **lens** into UWR-1-style data.
- **SEAT-1** — **`PositionSeat`** Prisma model; **`/admin/workbench/seats`**; seating helpers in `seating.ts`; links from position pages.
- **SKILL-1 + ASSIGN-2** — `skills.ts` ingest constants; seat-aware **read** alignment on position page; **no** auto-assign.

### Fundraising, compliance, policy, finance, field, youth (mixed maturity)

- **FUND-1** — Fundraising desk **blueprint** + `fundraising.ts` types; **no** desk route.
- **COMP-1** — Compliance rail **types** + extensive docs; **no** full workbench.
- **POLICY-1 + COMP-2 + BUDGET-1** — `CAMPAIGN_POLICY_V1`; **`ComplianceDocument`** + **`/admin/compliance-documents`**; budget/spend types and skills hooks.
- **FIN-1** — **`FinancialTransaction`** + ingest **seams** from submissions; list UI.
- **BUDGET-2** — **`BudgetPlan`** / **`BudgetLine`**; **`budget-queries.ts`** planned vs **CONFIRMED** actuals; **`/admin/budgets`** pages.
- **FIN-2** — **Confirm** ledger rows; **`CONTRIBUTION`** type; actuals exclude contributions from spend rollup.
- **FIELD-1** — **`FieldUnit`**, **`FieldAssignment`**; `field.ts` read helpers.
- **YOUTH-1** — Youth **docs** + `youth.ts` types.

### Data, comms map, identity, inventory, launch, geography, goals

- **DATA-1** — [`data-targeting-foundation.md`](./data-targeting-foundation.md): honest targeting story (county goals, optional precinct string).
- **COMMS-UNIFY-1** — [`communications-unification-foundation.md`](./communications-unification-foundation.md), [`message-workbench-analysis.md`](./message-workbench-analysis.md): conceptual map of message surfaces.
- **IDENTITY-1** — [`identity-and-voter-link-foundation.md`](./identity-and-voter-link-foundation.md), [`volunteer-data-gap-analysis.md`](./volunteer-data-gap-analysis.md).
- **DBMAP-1** — [`database-table-inventory.md`](./database-table-inventory.md) (**115** models), `scripts/print-prisma-inventory.mjs`.
- **LAUNCH-1** — Launch **docs** + `launch.ts` **read-only** helpers (`countLaunchAudienceByKind`, `listLaunchReadySupporters`).
- **GEO-1** — County/geo **mapping docs** only (**no** schema migration).
- **GOALS-VERIFY-1** — County registration goal **source-of-truth** doc + `county-goals.ts` read helpers.
- **DATA-4 + ELECTION-INGEST-1** — Prisma **`ElectionResultSource`** + related tabulation tables (migration `20260513120000_data4_election_ingest_foundation`); variant-aware JSON ingest `scripts/ingest-election-results-json.ts` + `npm run ingest:election-results -- --file …` (**one election JSON per run**; default folder only if it contains a single `*.json`); read helpers `election-results.ts`; **BRAIN-OPS** truth snapshot consumes **`getElectionResultCoverageSummary()`**; docs [`election-results-schema-and-ingest.md`](./election-results-schema-and-ingest.md), [`gotv-strategic-readiness-foundation.md`](./gotv-strategic-readiness-foundation.md) (GOTV **planning only**).
- **VOTER-MODEL-1 + INTERACTION-1** — Prisma **`VoterSignal`**, **`VoterModelClassification`**, **`VoterInteraction`**, **`VoterVotePlan`** (migration `20260514120000_voter_model_1_interaction_1_foundation`); helpers `voter-model.ts` (rule output only), `voter-model-queries.ts`, `voter-interactions.ts`; read-only admin **`/admin/voters/[id]/model`**; doc [`voter-model-implementation-foundation.md`](./voter-model-implementation-foundation.md); plan sketch [`modeling-database-implementation-plan.md`](./modeling-database-implementation-plan.md). **No** auto-classification jobs, **no** canvassing UI, **no** win probabilities.

---

## 8. Current real capabilities (code-grounded)

**Workbench hub:** `src/app/admin/(board)/workbench/page.tsx` — county/comms/calendar/orchestration cards + **CM-2** truth/warning/governance/**division** bands (`CampaignManagerDashboardBands`) + **Unified open work** (**UWR-1 + UWR-2**) + collapsible **BRAIN-OPS-2/3** truth snapshot JSON (mirror / truth / health / governance; includes **`openWorkCounts`** on snapshot type).

**Position + seats:** `…/workbench/positions`, `…/workbench/positions/[positionId]`, `…/workbench/seats` — read-only position **lens**, seat banner, ASSIGN-2 alignment block, seat staffing **save** (metadata only).

**Email workflow:** `…/workbench/email-queue`, `…/email-queue/[id]` — list, detail, manual create, **Run interpretation** (E-2A), provenance panel (E-2B).

**Comms:** `…/workbench/comms` — plans, segments, media, broadcasts (Tier-2), execution patterns via `comms-workbench` libs.

**Social / conversation:** `…/workbench/social` — `SocialContentItem`, monitoring, opportunity routing patterns (see domain map).

**Tasks, events, festivals, calendar:** routes under `workbench/` and `events/` per [`workbench-build-map.md`](./workbench-build-map.md).

**Financial:** `…/financial-transactions` — list, **create**, **confirm** (FIN-2).

**Budget:** `…/budgets`, `…/budgets/[id]` — plan + lines + variance vs ledger actuals.

**Compliance uploads:** `…/compliance-documents` — upload/list; API route for file fetch (admin).

**County admin:** `…/admin/counties`, `…/admin/counties/[slug]` — includes **`registrationGoal`** write path.

**Voter file:** `…/admin/voter-import` — import pipeline; **`VoterRecord`** warehouse; **public** voter registration **center** links to **official** Arkansas VoterView URL (`getArVoterRegistrationLookupUrl`) — **not** a campaign-owned replacement for state lookup.

**Voter model (read-only admin):** `…/admin/voters/[id]/model` — signals, current **`VoterModelClassification`**, interactions, latest vote plan; **provisional** layer only.

**Election results (ingest):** `npm run ingest:election-results -- --file <path>` — **one election JSON per run** (default folder / `--path` only if that directory has exactly one `*.json`); raw path `H:\SOSWebsite\campaign information for ingestion\electionResults`; **`ElectionResultSource`** + contests / counties / candidates / precinct-location rows; **`election-results.ts`** read-only helpers; **no** turnout targeting math.

**Volunteer ↔ voter matching:** `src/lib/volunteer-intake/match-entries-to-voters.ts` — heuristic matching for intake rows against **`VoterRecord`**.

**Campaign “assistance lookup”:** `src/lib/voter-file/campaign-assist-lookup.ts` — **stub only** (`campaignAssistLookupStub` throws); future bounded feature, explicitly **not** official confirmation.

**Launch planning:** `src/lib/campaign-engine/launch.ts` — **read-only** audience helpers; **no** automated send.

**County registration goals (read model):** `src/lib/campaign-engine/county-goals.ts` — lists/goals by county for reporting.

---

## 9. Major models / tables / system assets

**Do not duplicate the full Prisma inventory here.** The authoritative alphabetical map is **[`database-table-inventory.md`](./database-table-inventory.md)** (DBMAP-1, **105** models) + `prisma/schema.prisma`.

**Highest-leverage groups:**

| Area | Representative models / assets |
|------|--------------------------------|
| **Identity / contact** | `User`, `VolunteerProfile`, `ContactPreference`, `Commitment` |
| **Voter file + modeling (VOTER-MODEL-1)** | `VoterRecord`, `VoterSignal`, `VoterModelClassification`, `VoterInteraction`, `VoterVotePlan`, `VoterFileSnapshot`, `CountyVoterMetrics`, `CountyCampaignStats` |
| **Communications** | `CommunicationPlan`, `CommunicationDraft`, `CommunicationSend`, `CommunicationRecipient*`, `CommunicationThread`, `CommunicationMessage`, Tier-2 `CommunicationCampaign*` |
| **Workflow / tasks** | `WorkflowIntake`, `CampaignTask`, `Submission`, `EmailWorkflowItem` |
| **Seat / position** | `PositionSeat` (+ `PositionSeatStatus`); position **tree** in code (`positions.ts`) |
| **Finance / compliance / budget** | `FinancialTransaction`, `BudgetPlan`, `BudgetLine`, `ComplianceDocument` |
| **Field / geography** | `County`, `FieldUnit`, `FieldAssignment`, `CampaignEvent`, `EventSignup` |
| **Election tabulation (DATA-4)** | `ElectionResultSource`, `ElectionContestResult`, `ElectionCountyResult`, `ElectionCandidateResult`, `ElectionPrecinctResult`, `ElectionPrecinctCandidateResult` |
| **Social / content / media** | `SocialContentItem`, `InboundContentItem`, `OwnedMediaAsset`, `ConversationOpportunity`, monitoring/cluster tables |

---

## 10. Source-of-truth notes

**County registration goals**

- **`CountyCampaignStats.registrationGoal`** — **authoritative** campaign-entered target (admin county page, seed in dev).
- **`CountyVoterMetrics.countyGoal`** — **per-snapshot mirror** for progress math; copied during `recomputeAllCountyVoterMetricsForSnapshot`.
- If they diverge, assume **recompute lag** or manual inconsistency — see [`county-registration-goals-verification.md`](./county-registration-goals-verification.md).

**Mirrors vs sources**

- Voter metrics rollups are **derived** from file import + stats inputs — not a second opinion on goals.
- **Comms send state** vs **email workflow status** are **different products** — link by FK for context, don’t conflate “approved to send.”

**Policy defaults**

- **`CAMPAIGN_POLICY_V1`** in `src/lib/campaign-engine/policy.ts` — versioned **defaults** (tone, disclaimers, mileage rate, spend posture scaffolding). **Not** legal advice.

**Alignment**

- **De facto:** `src/lib/openai/prompts.ts`, `SearchChunk` ingest, E-2 provenance, job-definition docs.
- **Structured types:** `alignment.ts` / `overrides.ts` — **no** single persisted `CampaignAlignmentVersion` table yet.

**Heuristic vs explicit**

- E-2A interpretation is **deterministic** heuristics, not ML.
- Position inbox filtering is **heuristic** (`position-inbox.ts`), not DB-enforced routing.
- `LaunchResponseIntent` in `launch.ts` is **vocabulary**, not persisted launch state.

---

## 11. Known strengths of the current repo

- **Comms + social depth:** mature workbench patterns, DTO layers, sends/recipients, conversation monitoring, content pipelines — see [`workbench-build-map.md`](./workbench-build-map.md).
- **Message / comms analysis docs** — [`message-workbench-analysis.md`](./message-workbench-analysis.md), [`communications-unification-foundation.md`](./communications-unification-foundation.md) reduce duplicate “where does copy live?” debates.
- **RAG / AI infrastructure** — embeddings, search API, assistant, ingest scripts (`npm run ingest`), `SearchChunk` — summarized in [`ai-agent-brain-map.md`](./ai-agent-brain-map.md).
- **Queue-first email workflow** — schema + UI + interpretation provenance pattern that other queues can reuse.
- **Voter file + county metrics** — import, recomputation, public county storytelling with **honest** limits (precinct string, no invented universes).
- **Workbench/admin patterns** — `requireAdminPage` / `requireAdminAction`, server actions + `revalidatePath`, shared **WorkbenchPill** / provenance panels.

---

## 12. Known gaps / fragmentation

- **Volunteer pipeline** — intake → tasking → measurement not fully closed; see volunteer gap analysis.
- **County / field unification** — `FieldUnit` not FK’d to `County`; three county representations in places (GEO-1).
- **True position routing** — no `positionId` on `EmailWorkflowItem` / intake / tasks; seat is **visibility**, not router.
- **Precinct-level ops** — optional `VoterRecord.precinct` string only; no precinct goal table; **election** precinct/location rows are **raw ingest** until **PRECINCT-1** crosswalk.
- **Unified budget commitments** — plans vs actuals exist; **commitments** table / forecasting out of scope for BUDGET-2.
- **Launch automation** — LAUNCH-1 is **doctrine + read helpers**, not a runner.
- **Compliance / legal depth** — uploads exist; no rules engine, no filing automation.
- **Fundraising execution** — FUND-1 is blueprint/types; no desk.
- **Identity / auth as voter** — `linkedVoterRecordId` exists; **not** a voter-login product.

---

## 13. Launch strategy

From [`launch-reengagement-foundation.md`](./launch-reengagement-foundation.md) and [`launch-segmentation-and-response-foundation.md`](./launch-segmentation-and-response-foundation.md):

- **First re-engagement wave** — bounded **~100+** known people (volunteers, event signups, resolved users, segment members **where consent is clear**).
- **Cohorts** grounded in Prisma: `VolunteerProfile`, `EventSignup`, `User` + optional `linkedVoterRecordId`, historical `Submission` — **not** a reason to blast everyone without review.
- **Response-triggered activation** — replies and forms should land in **`WorkflowIntake`**, **`EmailWorkflowItem`**, **`CommunicationThread`**, or **tasks** per existing patterns; **then** downstream work activates.
- **No risky consent assumptions** — treat list provenance seriously; use `ContactPreference` honestly.
- **Operational routing** — email workflow remains **queue-first**; interpretation assists triage, does not send.

---

## 14. Agent knowledge / ingest strategy

See **[`agent-knowledge-ingest-map.md`](./agent-knowledge-ingest-map.md)** (SKILL-1) for tiers T1–T3 and category table.

**Still needed for a truly effective governed agent:**

- Campaign **philosophy** and **forbidden claims** consistently in RAG
- **Issue briefs** with citations
- **SOPs** per queue (E-1/E-2, comms send, intake)
- **County** one-pagers and local proof
- **Fundraising / finance** memos (often counsel-gated)
- **Compliance** packs + uploaded **ComplianceDocument** metadata discipline
- **Messaging frameworks** (pillars, voice)
- **Training** paths (TALENT-1 is types; content is separate)
- **Historical filings / reports**, **vendor/budget** reality
- **Youth** content and guardrails

**Reality check:** Ingest scripts exist, but **environments must be run** with discipline; “docs exist in repo” ≠ “present in SearchChunk index.”

---

## 15. What a new AI thread should do first

0. **Read** [`THREAD_HANDOFF_MASTER_MAP.md`](./THREAD_HANDOFF_MASTER_MAP.md) (THREAD-HANDOFF-1) for **full** orientation, protocol, guardrails, and lane table—especially if you have **no** access to prior chat.
1. **Read this file** (`docs/PROJECT_MASTER_MAP.md`) end-to-end once.
2. **Skim** [`unified-campaign-engine-foundation.md`](./unified-campaign-engine-foundation.md) + [`shared-rails-matrix.md`](./shared-rails-matrix.md) for rail vocabulary.
3. **Skim** [`workbench-build-map.md`](./workbench-build-map.md) for **routes that already exist**.
4. **Read** [`email-workflow-intelligence-AI-HANDOFF.md`](./email-workflow-intelligence-AI-HANDOFF.md) for E-1/E-2 **invariants** (queue-first, no auto-send).
5. **Inspect** `src/lib/campaign-engine/open-work.ts`, `position-inbox.ts`, `seating.ts`, `launch.ts`, `county-goals.ts` — the **current** read models.
6. **Grep** before proposing new tables: `schema.prisma` + [`database-table-inventory.md`](./database-table-inventory.md).
7. **Stay on foundation rails** — if the feature touches incoming work, say which **existing** models it joins.
8. **Preserve calm, bottom-up tone** in user-facing copy; align with `docs/philosophy/`.
9. **Ask for capability mapping** in Cursor before rebuilding — duplicate queues are a major failure mode.

---

## 16. Recommended next packets

Practical ordering (adjust with campaign priorities):

1. **PRECINCT-1** — normalization / crosswalk for voter `precinct` strings vs SOS location keys (follows DATA-4 ingest grains).
2. **GOTV-1** — phased GOTV **read model** + docs (no scheduler automation in first slice); see [`gotv-strategic-readiness-foundation.md`](./gotv-strategic-readiness-foundation.md).
3. **UWR-3** — county filter on unified queries; governed **`Submission`** / review-queue inclusion **only** with explicit status + admin `href` (see [`unified-open-work-expansion-notes.md`](./unified-open-work-expansion-notes.md)).
4. **CM-3** — actor-scoped band (`getOpenWorkForUser` for signed-in admin) + optional drill-down links from truth cards (still read-only).
5. **E-3 stub (read-only policy)** — implement `policyRoutingHookE3` as **logging-only** to `metadataJson` (no side effects) when product is ready.
6. **Comms ↔ email workflow linking** — drill-down from failed send / stuck plan to **existing** `EmailWorkflowItem` creation pattern (human-triggered).
7. **GEO-2 or FIELD-2** — explicit `FieldUnit`↔`County` mapping strategy (app-level or FK) + admin UX; county/precinct **staffing** toward GOTV.
8. **GOALS-BREAKDOWN / VOL-GOAL-1** — county goal → volunteer/field decomposition (per GOALS-VERIFY-1 suggestion).
9. **REL-3+** — volunteer-facing relational UI + county network rollups + dedupe (REL-2 **shipped**: `RelationalContact`, admin `/admin/relational-contacts`, helpers in `relational-contacts.ts` / `relational-matching.ts`).
10. **FUND-2** — first fundraising desk persistence + route (after compliance review for donor PII handling).
11. **ALIGN-2 / OVR-1** — first persisted override log on one touchpoint (likely E-2 or comms AI) when governance demands it.

**Rule:** Pick **one** packet; ship **docs + code** with explicit *out of scope*.

---

## Appendix: key docs to read next

**Suggested order:**

0. **[`THREAD_HANDOFF_MASTER_MAP.md`](./THREAD_HANDOFF_MASTER_MAP.md)** — THREAD-HANDOFF-1 (complete transition map)
1. **This file** — `docs/PROJECT_MASTER_MAP.md`
2. [`unified-campaign-engine-foundation.md`](./unified-campaign-engine-foundation.md)
3. [`shared-rails-matrix.md`](./shared-rails-matrix.md)
4. [`workbench-build-map.md`](./workbench-build-map.md)
5. [`email-workflow-intelligence-AI-HANDOFF.md`](./email-workflow-intelligence-AI-HANDOFF.md)
6. [`campaign-manager-orchestration-map.md`](./campaign-manager-orchestration-map.md) + [`incoming-work-matrix.md`](./incoming-work-matrix.md)
7. [`database-table-inventory.md`](./database-table-inventory.md)
8. [`public-site-system-map.md`](./public-site-system-map.md) + [`system-domain-flow-map.md`](./system-domain-flow-map.md)
9. [`launch-reengagement-foundation.md`](./launch-reengagement-foundation.md)
10. [`identity-and-voter-link-foundation.md`](./identity-and-voter-link-foundation.md)
11. [`county-registration-goals-verification.md`](./county-registration-goals-verification.md)
12. `src/lib/campaign-engine/README.md`

**Philosophy / brand (voice and public narrative):** `docs/philosophy/README.md`, `docs/narrative/README.md`, `docs/brand/README.md`

---

*MASTER-MAP-1 — Canonical project handoff + build protocol map. Last updated: 2026-04-23 (THREAD-HANDOFF-1 `THREAD_HANDOFF_MASTER_MAP.md`; REL-2 relational contact foundation; VOTER-MODEL-1 + INTERACTION-1; DATA-4 + GOTV readiness retained).*
