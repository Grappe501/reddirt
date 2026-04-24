# Unified campaign engine — foundation (RedDirt)

**Packet FND-1.** **Canonical** architecture doc for a **fresh** unified campaign operating system: not “the admin app we have,” but the **target shape** the codebase should **grow into**. Existing routes and workbenches are **evidence and migration inputs**, not the final topology.

**New AI thread — start here first:** **[`PROJECT_MASTER_MAP.md`](./PROJECT_MASTER_MAP.md)** (MASTER-MAP-1) is the **single drag-and-drop continuity file** for packet history, rails status, work protocol with Cursor, code-grounded capabilities, and curated doc order. This foundation doc remains the **deep** target-architecture reference; the master map **orients** before you read every section below.

**Cross-ref:** [`shared-rails-matrix.md`](./shared-rails-matrix.md) · **BRAIN-OPS-1:** [`deterministic-brain-foundation.md`](./deterministic-brain-foundation.md) · [`campaign-manager-workbench-spec.md`](./campaign-manager-workbench-spec.md) · [`truth-governance-ownership-map.md`](./truth-governance-ownership-map.md) · `truth.ts` · **BRAIN-OPS-2/3:** `truth-snapshot.ts` (`getTruthSnapshot`) · **PROTO-1:** [`progressive-build-protocol.md`](./progressive-build-protocol.md) · [`master-blueprint-expansion-rules.md`](./master-blueprint-expansion-rules.md) · [`ai-agent-brain-map.md`](./ai-agent-brain-map.md) · [`ai-integration-matrix.md`](./ai-integration-matrix.md) · [`campaign-brain-alignment-foundation.md`](./campaign-brain-alignment-foundation.md) · [`automation-override-and-impact-foundation.md`](./automation-override-and-impact-foundation.md) · [`user-scoped-ai-context-foundation.md`](./user-scoped-ai-context-foundation.md) · [`position-system-foundation.md`](./position-system-foundation.md) · [`workbench-job-definitions.md`](./workbench-job-definitions.md) · [`assignment-rail-foundation.md`](./assignment-rail-foundation.md) · [`position-inbox-foundation.md`](./position-inbox-foundation.md) · [`position-workbench-foundation.md`](./position-workbench-foundation.md) · [`unified-open-work-foundation.md`](./unified-open-work-foundation.md) · [`unified-incoming-work-read-model.md`](./unified-incoming-work-read-model.md) · [`talent-intelligence-foundation.md`](./talent-intelligence-foundation.md) · [`campaign-manager-orchestration-map.md`](./campaign-manager-orchestration-map.md) · [`incoming-work-matrix.md`](./incoming-work-matrix.md) · [`system-domain-flow-map.md`](./system-domain-flow-map.md) · **Relational organizing (REL-1 / ROE):** [`relational-organizing-foundation.md`](./relational-organizing-foundation.md) · [`pod-system-foundation.md`](./pod-system-foundation.md) · [`relationship-data-model-foundation.md`](./relationship-data-model-foundation.md) · [`relational-voter-integration.md`](./relational-voter-integration.md) · [`relational-kpi-foundation.md`](./relational-kpi-foundation.md) · [`relational-ai-assist-foundation.md`](./relational-ai-assist-foundation.md) · **Volunteer progression (GAME-1 / VPE):** [`volunteer-progression-foundation.md`](./volunteer-progression-foundation.md) · [`volunteer-leveling-system.md`](./volunteer-leveling-system.md) · [`volunteer-xp-model.md`](./volunteer-xp-model.md) · [`volunteer-unlock-system.md`](./volunteer-unlock-system.md) · [`volunteer-identity-evolution.md`](./volunteer-identity-evolution.md) · [`gamification-ai-assist.md`](./gamification-ai-assist.md) · **Volunteer system core (VOL-CORE-1):** [`volunteer-philosophy-foundation.md`](./volunteer-philosophy-foundation.md) · [`volunteer-role-system.md`](./volunteer-role-system.md) · [`volunteer-onboarding-flow.md`](./volunteer-onboarding-flow.md) · [`power-of-5-system-integration.md`](./power-of-5-system-integration.md) · [`volunteer-county-integration.md`](./volunteer-county-integration.md) · [`volunteer-ai-guidance.md`](./volunteer-ai-guidance.md) · **Blueprint alignment (BLUEPRINT-LOCK-1):** [`system-division-map.md`](./system-division-map.md) · [`system-maturity-map.md`](./system-maturity-map.md) · [`system-integration-map.md`](./system-integration-map.md) · [`goals-system-status.md`](./goals-system-status.md) · [`next-build-sequence.md`](./next-build-sequence.md) · **Data targeting (DATA-2 / DATA-3):** [`targeting-data-inventory.md`](./targeting-data-inventory.md) · [`voter-strength-foundation.md`](./voter-strength-foundation.md) · [`county-precinct-strategy-foundation.md`](./county-precinct-strategy-foundation.md) · [`path-to-45-foundation.md`](./path-to-45-foundation.md) · `src/lib/campaign-engine/targeting.ts` · **DATA-3 (election ingest foundation, docs only):** [`election-results-foundation.md`](./election-results-foundation.md) · [`election-data-ingest-strategy.md`](./election-data-ingest-strategy.md) · [`targeting-signals-foundation.md`](./targeting-signals-foundation.md) · [`targeting-integration-foundation.md`](./targeting-integration-foundation.md) · `src/lib/campaign-engine/README.md`

---

## 1. North star

- **One product concept:** a **unified campaign operating system**—a machine that **ingests work**, **remembers people and context**, **executes and reviews** comms/field/content, and **orchestrates** under a **Campaign Manager** layer—not a loose bag of workbench pages.
- **Solo first:** A **single** operator can run a statewide campaign using **one mental model** (incoming → triage → route → act → close), with **concrete** UI that surfaces **all** critical open work, not a scavenger hunt across specialty tools.
- **Delegation without redesign:** **Roles** (Comms, Field, etc.) **pull** or **are assigned** work from the **same** rails; we add **visibility + assignment** on shared objects, not duplicate “org charts as apps.”
- **Automation-first where safe, review-first where sensitive:** **Queue-first** and **policy** for anything that touches **voters, consent, or send** (see `email-workflow-intelligence-AI-HANDOFF.md`); **cron/webhooks** for bounded status updates; **no** “magic send” from scattered tools.
- **Public ↔ operations:** The **public site** educates and captures **intent**; the engine **normalizes** that into the **same contact + incoming-work** world as **monitoring, comms, and tasks**—**eventually** on shared rails, not ad hoc ETLs per workbench.
- **Campaign-safe orchestration:** **Single-tenant, campaign-scoped** boundaries; no silent cross-tenant side effects. **Geography (county)** and **comms** stay **local** to how the campaign already models them.

*Repo today:* We have **strong pieces** (Prisma, DTOs, workbench, webhooks) but **no** single `UnifiedWorkItem` or global orchestration DB. **FND-1** names the **target layers and rails** so later packets can **implement** without re-litigating the whole map each time.

---

## 2. Core system layers (target shape + repo evidence)

| Layer | What it is | Build toward (clean) | Repo evidence (today) | Gap |
|-------|------------|------------------------|-------------------------|-----|
| **Public experience** | Voter education, forms, search, guide | **Same** `User`/contact and **intent** as ops world | `(site)/*`, `api/forms`, `api/search`, `api/assistant` | Public “capture” not always **same row** as `WorkflowIntake` |
| **Incoming work** | “Something needs attention” | **One** index + routing rules (not N queues in the head) | `Submission`, `WorkflowIntake`, `EmailWorkflowItem`, `ArkansasFestivalIngest`, `InboundContentItem`… | **No** unified work index table |
| **Identity / contact** | Who the campaign knows | **Single** `User` (+ volunteer, voter link) as spine | `User`, `VolunteerProfile`, `linkedVoterRecordId` | **Duplicate** touchpoints in forms without one **inbox** object |
| **Campaign context / state** | “Where we are in the race” | **Derived** from events, sends, tasks, file—**or** a future summary aggregate | `CampaignEvent` readiness, `CommunicationPlan` status, tasks | **No** one `CampaignState` row; OK if **read models** are explicit |
| **Execution / workbench** | **Tools** to act on work | Pluggable UIs on **shared** objects | `workbench/*`, `comms/*`, `email-queue`, `tasks`, `social` | UIs are **mature**; they need **shared contracts** to plug into **rails** |
| **Orchestration** | **Who** sees what **next** | Campaign Manager **shell** = aggregate + **deep links** | `workbench/page.tsx` (de facto) | **No** dedicated “CM home” v2 yet |
| **Automation / policy** | When machines may act | **Central** policy hooks, not ad hoc in each feature | `email-workflow` `extension-points`, webhooks, cron routes | **Policy** is **per-domain**; needs **naming** + optional **unified log** |
| **Reporting / feedback** | Close the loop | Metrics + “what went out / what resolved” | Analytics route, comms send rollups, voter metrics | **Fragmented** dashboards |

**Principle:** **Rails first** (contracts + a few key tables/indices), then **thicken** workbenches; **not** a big-bang “rewrite admin.”

---

## 3. Shared rails (see [`shared-rails-matrix.md`](./shared-rails-matrix.md))

At a minimum, future workbenches should align to:

1. **Incoming work rail** — normalize “open work” with a **handle** to source rows (matrix in CM-1 is the first cut).
2. **Identity / contact rail** — `User` and linked profiles; all comms and forms resolve here first.
3. **Assignment / ownership rail** — `assignedToUserId` patterns today; **future** could be a **view** or **join** table; **not** RBAC in FND-1.
4. **Status / priority rail** — enums + DTOs; **consistent** “open vs done” for each domain.
5. **Provenance / audit rail** — `metadataJson` namespaced (e.g. `emailWorkflowInterpretation`); same idea for any **AI** or **automation** touch.
6. **Automation & policy rail** — **Hooks** and **queue-first** defaults; no send without path through **execution** layer.
7. **Recommendation / AI assist rail** — **Read-heavy**, **suggest**; **never** the only source of truth for **send** (handoff).
8. **Geography / county rail** — `County` + `countyId` on threads, events, users—already in schema.
9. **Content & comms rail** — `CommunicationPlan` / `Send` / `Thread` / **Tier-2** where applicable—**single** story for “message out.”
10. **Calendar / timeline rail** — `CampaignEvent` + workbench/calendar; **dependencies** in tasks and comms.
11. **Talent / adaptive training rail (TALENT-1)** — Observes **operational** signals on tasks, queues, intakes, comms; issues **advisory** recommendations and **training** paths; **humans** decide seat changes and trust. **Depends** on identity, position model, provenance, assignment, and the **recommendation** (assist) ethic—**not** an HR product. See [`talent-intelligence-foundation.md`](./talent-intelligence-foundation.md).

Each rail: **defined** in the matrix (where applicable); **evidence** and **gaps** are explicit. **Shared-rails** matrix can be **extended** for talent when implementation packets land.

---

## 4. Canonical domain objects (system view, not just Prisma dump)

| Concept | Source of truth (today) | In unified system | Gaps / duplication |
|---------|------------------------|-------------------|--------------------|
| **Person / contact** | `User` | **Spine** for all comms, forms, assignment | Merges via email upsert; **not** all flows create `WorkflowIntake` |
| **Voter** | `VoterRecord` (file); optional `User.linkedVoterRecordId` | **Assistance** and metrics; not every contact is a voter row | Ingest is **admin**-heavy |
| **Volunteer** | `VolunteerProfile` + `Commitment` | **Field** programs | Same |
| **Incoming work (abstract)** | *Missing as one type* | **Future** `UnifiedWorkItem` **or** **materialized view** of open rows | Many tables = **cognitive** split |
| **Workflow intake** | `WorkflowIntake` | **Ops** queue for “human process” | Not 1:1 with every `Submission` |
| **Comms thread** | `CommunicationThread` + `CommunicationMessage` | **Live** conversation | Distinct from **email workflow** **review** queue |
| **Send / execution** | `CommunicationSend`, webhooks, recipients | **Execution truth** | Must stay **separate** from **EmailWorkflowItem** “review” until policy says otherwise |
| **Email workflow item** | `EmailWorkflowItem` | **Triage** for “email-shaped situation” (handoff) | **No** auto-send |
| **Task** | `CampaignTask` | **Work** with deadlines | Template vs ad hoc |
| **Event** | `CampaignEvent`, `EventRequest`, `ArkansasFestivalIngest` (suggest) | **Time** anchor for field + comms | **Three** entry styles |
| **Content item** | `SocialContentItem`, `OwnedMediaAsset`, editorial | **Publish** path | **Review queue** is another surface |
| **County / geo** | `County` | **Filter and assignment** for field | Works in workbench; **unify** in incoming rail **filters** |
| **Recommendation** | `AnalyticsRecommendationOutcome` (pattern), `ConversationOpportunity` | **Inputs** to intake/social; not automatic send | Each domain has its own type |
| **Campaign plan (abstract)** | **Not** a single model | **Comms** `CommunicationPlan` is closest “plan of record” for messaging | “Strategy” is **scattered** |

---

## 5. Existing surfaces as inputs, not architecture

- **Workbenches, routes, and pages** in the repo = **proven** UX, **data shapes**, and **what operators actually click.** They inform **where** to attach rails first (e.g. `lib/comms-workbench/`, `lib/email-workflow/`).
- They are **not** the **final** partition of the system: we will **not** force “email workflow is only ever `EmailWorkflowItem` page” as the only abstraction—we may **add** a **unified** list that **joins** to that row.
- **Use them for:** migration order, **DTO reuse**, **auth** patterns, **pessimistic** queue patterns.
- **Do not** use them to **block** a **unified incoming** index that **sits above** them.

---

## 6. What to standardize early (small, disciplined set)

1. **Naming + docs** for **rails** and **layer** terms (`vocabulary` in `src/lib/campaign-engine/`).
2. **One** read-model spec for **“open incoming work”** (even if v1 = SQL view or a **server** function that **queries 5 tables** in parallel—**contract** in code, not 5 ad hoc pages).
3. **Provenance** pattern for any **automation/AI** touch: **namespaced** `metadataJson` + version field (email workflow already does).
4. **Queue-first** defaults for any **outbound** or **sensitive** path (restate handoff; **do not** erode in new features).
5. **DTO** conventions for list/detail (already in `lib/*/dto.ts`); **extend** to any new **unified** list.

---

## 7. What not to standardize too early

- **A single `Work` table** that **replaces** all domain tables—**premature**; **duplicates** business rules.
- **Global RBAC** with roles in DB—**before** the **assignment rail** and **unified** list exist.
- **One mega-nav** that **hides** specialized workbenches before operators **validate** the unified list.
- **Abstraction of Comms** and **email workflow** into one “send” service—**policy** and **liability** differ; **integrate** at **orchestration** and **link FKs** first.

---

## 8. Foundation build sequence (post FND-1, systems-oriented)

1. **FND-2 (example):** **Incoming work v1** — read model + one **Campaign Manager** dashboard section (counts + links only).
2. **FND-3 (example):** **Assignment** on existing rows (`assignedToUserId` **coverage** and **conventions**), still **one** admin user for solo.
3. **FND-4 (example):** **Policy log** (append-only “automation considered / blocked / ran”) for **cross-cutting** visibility.
4. **Domain packets** (E-*, comms, intake) then **attach** to the **same** list and **same** provenance conventions—**not** redefined per feature.
5. **Only then** grow **workbench** **features** that **assume** the rail exists.

*(Exact FND-2+ numbering is indicative; the **order** is: **aggregate visibility** → **assignment** → **policy** → **thicken** tools.)*

---

## 9. Fastest path to a **real** unified system

1. **Adopt** this doc + **shared-rails matrix** as the **planning** contract for every new packet.
2. **Implement** a **single** “**open work**” **read** path (not necessarily one table) that **joins** **Submission, Intake, EmailWorkflow, festival pending,** etc.—**links only** in v1.
3. **Wire** **`/admin/workbench`** (or a thin new hub) to **top** of that read path so **solo** operator **lands** in **reality** not **theory**.
4. **Keep** workbenches as **editors and specialized views**; **unify** only **entry** and **orchestration**.

---

## 10. Packet ROLE-1 — Position system + workbench job definitions (documentation + typed seam)

**What shipped:** A hierarchical **position** model (architectural first-class; not a Prisma table yet) with workbench and incoming-work bindings per seat, roll-up when a seat is unfilled, and Campaign Manager as org root. Docs: [`position-system-foundation.md`](./position-system-foundation.md), [`workbench-job-definitions.md`](./workbench-job-definitions.md), [`position-hierarchy-map.md`](./position-hierarchy-map.md). **Code:** `src/lib/campaign-engine/positions.ts` — `PositionId`, `POSITION_TREE`, `getChildPositions` (no RBAC, no assignment engine).

**How it fits the unified system:** People will attach to positions in a later packet; work still uses the same shared rails (incoming, status, assignment). Solo = one user implicitly holds all positions; at scale, more seats are filled without duplicating Prisma models per department—only routing and inbox views change.

**Scaffolding now:** The placeholder tree in `positions.ts` should stay aligned with the docs (or be replaced by a single CMS/DB source of truth later).

**Intentionally not built:** `User`↔position assignment, per-route permissions, position-scoped inbox UI, auto-routing rules, workbench redesigns.

---

## 11. Packet TALENT-1 — Volunteer talent intelligence + adaptive training foundation

**What shipped:** [`talent-intelligence-foundation.md`](./talent-intelligence-foundation.md) (north star, AI as evaluator/recommender/trainer *not* judge, observable signals + gaps, recommendation chain, adaptive training, automation vs human augmentation, rail dependencies, human-only decisions, build sequence), [`position-development-matrix.md`](./position-development-matrix.md) (per ROLE-1 seat: competencies, fit, risk, training, metrics, upward path, advancement reviewers), [`talent-recommendation-flow.md`](./talent-recommendation-flow.md) (generation, routing, prominence, provenance, audit, examples). **Code:** `src/lib/campaign-engine/talent.ts`, `training.ts` — `TalentSignalCategory`, `TalentRecommendationType`, `TrainingTrackType`, `PositionDevelopmentHint`, `TalentRecommendationDraft` (no engine, no persistence).

**How it fits the unified system:** Unfilled positions + automation keep the engine running; people add judgment. The talent rail is advisory like E-2 email interpretation—provenance, no silent role change, no hidden score gating the product. Training *content* is a future rail; TALENT-1 names types and docs only.

**Scaffolding now:** Type-only; keep aligned with docs or merge into a single source when TALENT-2 adds observation events.

**Intentionally not built:** Scoring, ranking, auto-promotion, permissions, observation ingestion, LMS, UI, workbench refactors for talent.

---

## 12. Packet BRAIN-1 — AI agent brain map + system-wide integration plan

**What shipped:** [`ai-agent-brain-map.md`](./ai-agent-brain-map.md) (where `src/lib/openai/`, `src/lib/assistant/`, `comms/ai`, email `intelligence/`, `SearchChunk` + ingest scripts, media refine, and stubs **are** in the product today; north star; central vs local; governance; build sequence), [`ai-integration-matrix.md`](./ai-integration-matrix.md) (area×surface×gap×next step). **Code:** `src/lib/campaign-engine/ai-brain.ts` (`CampaignBrainTouchpoint`, `BrainRecommendationKind`, `HumanGovernanceBoundary`), `ai-context.ts` (`BrainContextSource`, `BrainContextBundle` placeholder). **No** new API routes or model calls.

**System role of the “brain”:** The **default** **cognitive** **layer** is **already** the **RAG+assistant+embeddings+prompts** stack and **(separately)** **comms** **thread** **summarization**—**not** a **toy** feature. The **heuristic** **email** **workflow** **is** a **second** “brain” **slot** **ready** for **E-3+**. **TALENT-1** **types** **describe** a **third** **advisory** **lane**.

**Scaffolding now:** Re-use **`client`**, **extend** **provenance** before **new** call sites. **Intentionally not built:** **Unified** **orchestrator** class, **auto**-**act** on **recommendations**, **hidden** **scoring** **of** **people**, **bypasses** of **queue-first** or **compliance** **rules**.

---

## 13. Packet ALIGN-1 — Campaign brain alignment + override learning + user-scoped context

**What was defined:** [`campaign-brain-alignment-foundation.md`](./campaign-brain-alignment-foundation.md) (north star, alignment *sources* with repo evidence, **layered** assembly, versioning targets, human governance, build sequence), [`automation-override-and-impact-foundation.md`](./automation-override-and-impact-foundation.md) (override as signal, kinds tied to E-2/comms/talent paths, event shape, impact classes, learning loop without silent governance), [`user-scoped-ai-context-foundation.md`](./user-scoped-ai-context-foundation.md) (whole-brain view vs per-user interaction window, TALENT facets, future RAG masking, risks).

**How it fits the unified system:** FND-1 **recommendation/AI** and **provenance** rails get explicit *alignment* vocabulary (governed inputs) and a formal **override** learning rail that complements (does not replace) `HumanGovernanceBoundary` and queue-first email policy in [`email-workflow-intelligence-AI-HANDOFF.md`](./email-workflow-intelligence-AI-HANDOFF.md). User-scoped context describes how personalization stays explainable and bounded when ROLE-1 seating and future RBAC arrive.

**Scaffolding now:** `src/lib/campaign-engine/alignment.ts` (`CampaignAlignmentLayer`, `AlignmentSourceKind`, `BrainAlignmentVersionHint`), `overrides.ts` (`AutomationOverrideKind`, `OverrideImpactClass`, `AutomationOverrideEventDraft`), `user-context.ts` (`UserScopedContextLayer`, `UserUnderstandingFacet`, `UserScopedContextPlan`).

**Intentionally not built:** RBAC/permissions, automatic promotion or authority changes, hidden scoring, append-only **persistence** for overrides, model auto-tuning, or any new automation that acts on the live campaign without human policy.

---

## 14. Packet ASSIGN-1 — Assignment rail + position inbox + unified open work (foundation)

**What was defined:** [`assignment-rail-foundation.md`](./assignment-rail-foundation.md) (assignment as system-wide concept; user vs position scope; assignment kinds; relation to FND-1, ROLE-1, TALENT-1, ALIGN-1; CM vs position vs “for me” inboxes *as concepts*), [`position-inbox-foundation.md`](./position-inbox-foundation.md) (what a position inbox is, how it differs from workbenches, unifying email workflow / intake / tasks / comms threads with examples for CM, Comms, Volunteer Coordinator), [`unified-open-work-foundation.md`](./unified-open-work-foundation.md) (open work definition, source models, minimal read model, filter dimensions, no giant table).

**How it fits the unified system:** FND-1 **assignment / ownership rail** and “single open work read path” (§6.2) get **named contracts** (`OpenWorkItemRef`, stubs, optional **counts**). ROLE-1 positions get a path to a **read-only** position inbox and Campaign Manager *cross-system* visibility *without* routing automation. Does **not** change queue-first email policy.

**Scaffolding now (superseded in part by UWR-1):** `src/lib/campaign-engine/assignment.ts` (types), `open-work.ts` (counts; **UWR-1** adds real merged queries — see §15).

**Intentionally not built (ASSIGN-1 at the time):** `positionId` on **UWR-1** source rows, `User`↔**position** **assignment** in the **assignment** **sense** on those objects, **auto-routing**, heavy cross joins. **Update:** **SEAT-1** (§17) added **`PositionSeat`** for **org** **staffing** **metadata** only — **not** a Prisma `positionId` on email/intake/task rows, **not** **routing** side effects.

---

## 15. Packet UWR-1 — Unified incoming work read model (code-first, read-only)

**What shipped:** [`unified-incoming-work-read-model.md`](./unified-incoming-work-read-model.md) (north star, **v1** three sources, normalized row, views, out of scope, next candidates), extended [`unified-open-work-foundation.md`](./unified-open-work-foundation.md) contract via `UnifiedOpenWorkItem` in `open-work.ts`. **Code:** `getOpenWorkForUser`, `getOpenWorkForCampaignManager` (unassigned + escalated email, deduped), `getUnassignedOpenWork`, `getEscalatedOpenWork` — `Promise.all` per model, merge in memory, **bounded** `take`/`maxTotal`, **no** `CommunicationThread` in v1 list (counts helper unchanged). **UI:** read-only `UnifiedOpenWorkSection` on `/admin/workbench` (`src/app/admin/(board)/workbench/page.tsx`) — additive block; **links only**.

**How it fits the unified system:** FND-1 “open incoming work” read path (§2, §6.2) is now **concrete** for three high-clarity Prisma types; full matrix coverage remains incremental.

**Intentionally not built:** Master table, migrations, **thread** rows in the merged list (see doc), `positionId` / routing, **“for me”** on the workbench page (the **function** exists for use elsewhere; **CM triage** slice is what the UI shows by default), auto-assignment, filters beyond the query caps.

---

## 16. Packet WB-CORE-1 — Position workbench + position inbox (read layer)

**What shipped:** [`position-workbench-foundation.md`](./position-workbench-foundation.md) (north star, inbox vs workbench, v1 model, which positions, rails, out of scope, next). **Code:** `src/lib/campaign-engine/position-inbox.ts` — `getInboxForPosition`, `getWorkbenchSummaryForPosition`, `getHighPriorityInboxItemsForPosition`, `SUPPORTED` heuristics (CM, comms-lean, field-lean); `open-work.ts` re-exports `getOpenWorkForPosition` = `getInboxForPosition`. **Types:** `personalized-workbench.ts` (guidance slots, placeholder sections; **no** runtime). **UI:** `/admin/workbench/positions`, `/admin/workbench/positions/[positionId]`; link “By position” on main workbench; **read-only**, **links to existing** tools.

**How it fits:** Role- **shaped** visibility on top of UWR-1; **not** a claim that work is truly “owned” by that `PositionId` in the database.

**Intentionally not built:** RBAC, seat table, **routing**, AI ranking, full personalization, non-read actions.

---

## 17. Packet SEAT-1 — Position seating + delegation foundation

**What shipped:** [`position-seating-foundation.md`](./position-seating-foundation.md), [`delegation-and-coverage-foundation.md`](./delegation-and-coverage-foundation.md) (north star, position vs seat vs user, vacancy/roll-up, **states**, rails, out of scope, **CM** / coverage **story**). **Persistence:** `PositionSeat` + `PositionSeatStatus` in Prisma — one row per `positionKey` (matches `PositionId` string), optional `userId`, `ACTING` + optional `actingForPositionKey`, `notes`/`metadataJson` **scaffolding**. **Code:** `src/lib/campaign-engine/seating.ts` — `listPositionSeats`, `getSeatForPosition`, `getSeatsForUser`, `getCoverageSummary`, `getPositionWorkbenchSeatContext`, `getRollupTargetPositionId`, `getVacantSeatsWithUnfilledSubtrees`. **UI:** `/admin/workbench/seats` (coverage table + **optional** **assign** / **status** / **Save** per row — **staffing metadata** only; **revalidates** workbench/position pages). **Position workbench:** `…/workbench/positions/[positionId]` shows **seat** banner + link to **Seats**. `positions.ts` — `isValidPositionId` / `ALL_POSITION_IDS` for actions.

**How it fits:** **Grounds** “who sits here” in **data** for **personas** and **future** user-scoped **inbox** **narrowing**; **does not** replace UWR-1 **assignment** fields, **not** a permissions layer.

**Intentionally not built:** RBAC, **auto**-routing on seat change, **per-seat** **API** **authorization**, **load**-based “high work” in DB, **AI** **staffing** **decisions**, **double**-truth on **open** work.

---

## 18. Packets SKILL-1 + ASSIGN-2 — Agent skill/ingest framework + seat-aware assignment (read)

**What shipped (docs):** [`agent-skill-framework.md`](./agent-skill-framework.md) (skill **domains** table: know / do / recommend-not-decide / evidence / gaps) · [`agent-knowledge-ingest-map.md`](./agent-knowledge-ingest-map.md) (tiers, categories, gaps, **recommended** **ingest** **order**) · [`seat-aware-assignment-foundation.md`](./seat-aware-assignment-foundation.md) (assignment vs seat vs roll-up, **what**’s **safe** **now** vs **waits**).

**What shipped (code, read-only):** `assignment.ts` — `ASSIGN2_PACKET`, `SKILL1_PACKET` (also in `skills.ts`), `SeatAssignmentContext`, `SeatInboxWorkAlignment`, `SeatStatusForAssignment` · `seating.ts` — `getSeatAssignmentContext` · `open-work.ts` — `getOpenWorkForSeat` (= `getInboxForPosition`), `getOpenWorkForSeatOccupant` (=`getOpenWorkForUser` when `PositionSeat` has `userId`), `getSeatInboxWorkAlignment` (slice vs **occupant** **counts**), re-export `getSeatAssignmentContext` · `skills.ts` — `AgentSkillDomain`, `SkillEvidenceKind`, `KnowledgeIngestTier`, `IngestScope` **constants** **only** · **UI:** position workbench **detail** — ASSIGN-2 **block** (alignment **+** **global** **occupant** **open** count) **+** **richer** **inherited** **copy** for **vacant** seats (uses `getSeatAssignmentContext`).

**How it fits:** **Parallel** read paths — **UWR-1** **assignee** **fields** **unchanged**; **seats** provide **narrative** and **mismatch** **signals** only; **RAG/ingest** **plan** **without** **new** **automation**.

**Intentionally not built:** **Any** **mutation** of **assignee** from **this** **packet**; **RBAC**; **model-chosen** **routing**; **hidden** **agent** **memory**; full **RAG** **ingest** of all **list**ed **content** (that is a **separate** **content** program).

---

## 19. Packet FUND-1 — Fundraising desk + donor research + contactability + KPIs (blueprint)

**What shipped (docs):** [`fundraising-desk-foundation.md`](./fundraising-desk-foundation.md) (north star, **target** workbench model, **rails** **ties**, **agent** **posture** **(know** **/ recommend** **/ never** **alone) **, out of scope) · [`contactability-and-calltime-precheck-foundation.md`](./contactability-and-calltime-precheck-foundation.md) (stages, **“good** **number**” **honesty,** governance) · [`donor-research-and-enrichment-foundation.md`](./donor-research-and-enrichment-foundation.md) (OpenFEC as **federal** **public** **track** **(integration** not **claimed) **, **state** as **separate,** **matching** **risk) ** · [`fundraising-kpis-and-goals-foundation.md`](./fundraising-kpis-and-goals-foundation.md) · [`fundraising-agent-ingest-map.md`](./fundraising-agent-ingest-map.md) (T1–T3 **fundraising** **RAG** **inputs) **. **Scaffolding (types** **only):** `src/lib/campaign-engine/fundraising.ts` — `FUND1_PACKET`, `ContactabilityStatus`, `DonorResearchSignal`, `FundraisingKpiKey`, `FundraisingWorkType`, `ProspectPriorityReason` **.** **`skills.ts`:** `AgentSkillDomain.FUNDRAISING_OPERATIONS` **. **

**Intentionally not built:** **Dialer** / **PSTN**; **mass** **SMS** **engine**; **live** **FEC** **/ state** **ingest** **(unless** **pre-existing** **elsewhere) **; **compliance** **as** **auto**-**legal**; **scoring** that **moves** **rows** without **human** / **audit** **. **

---

## 20. Packet COMP-1 — Compliance governance rail + paperwork simplification + compliance ingest (foundation)

**What shipped (docs):** [`compliance-governance-foundation.md`](./compliance-governance-foundation.md) (north star, **domains,** system **ties,** **AI** **posture,** **human** **governance,** build **sequence) **· [`compliance-paperwork-simplification-foundation.md`](./compliance-paperwork-simplification-foundation.md) (inputs, **stages,** **SOS** **/ official **alignment **honesty) **· [`compliance-skill-framework.md`](./compliance-skill-framework.md) · [`compliance-agent-ingest-map.md`](./compliance-agent-ingest-map.md) (T1–T3) **. **

**Scaffolding (types** **only):** `src/lib/campaign-engine/compliance.ts` — `COMP1_PACKET`, `ComplianceDomain`, `ComplianceSignalKind`, `PaperworkPrepStage`, `ComplianceReviewStatus`, `ComplianceKnowledgeTier` **. **`skills.ts`:** comment on **`COMPLIANCE_GOVERNANCE` **+ **cross**-**ref** **. **

**Intentionally not built:** **Compliance** **workbench** **UI**; **filing** **automation**; **bank** **/ vendor** **APIs**; **AR** **SOS** **form** **JSON** in **repo**; **“** **AI**-**certified** **compliant** **”** **badge** **. **

---

## 21. Packets POLICY-1 + COMP-2 + BUDGET-1 — Policy defaults, compliance document upload, spend rail (foundation)

**What shipped (docs):** [`campaign-policy-foundation.md`](./campaign-policy-foundation.md) — **governed** **defaults** (tone, **organizing** **line,** **page** **disclaimer,** **mileage** **0.725,** **reimbursement** **scope) **, **change** / **versioning** **(future) **, **AI** **tie**-**in. [`compliance-document-ingest-foundation.md`](./compliance-document-ingest-foundation.md) — **ingest** **stages,** **human** **governance,** **Submission** **honesty) **. [`budget-and-spend-governance-foundation.md`](./budget-and-spend-governance-foundation.md) · [`budget-agent-ingest-map.md`](./budget-agent-ingest-map.md) — **horizontal** **spend** **rail,** **not** a **silo) **. [`federal-state-coordination-foundation.md`](./federal-state-coordination-foundation.md) — **high**-**risk** **governance,** not **automation) **. **

**Code:** `src/lib/campaign-engine/policy.ts` — **`CAMPAIGN_POLICY_V1` **(v1) **. **`compliance-documents.ts` **—** **type** **labels) **. **`budget.ts` **—** `CostBearingWireKind` **,** **`BudgetEnforcementStage` **. **`skills.ts` **—** `CAMPAIGN_POLICY` **,** `BUDGET_GOVERNANCE` **. **`prisma`:** **`ComplianceDocument` **+** **`ComplianceDocumentType` **(migration`20260509120000_comp2_compliance_document` **) **. **`/admin/compliance-documents` **(upload+list) **+** **`/api/compliance-documents/[id]/file` **(admin) **+** **`compliance-documents-actions.ts` **. **`CampaignPaidForBar` **uses** **policy** **disclaimer** **. **

**Intentionally not built:** **Full** **budget** **workbench;** **bank** / **ad**-**platform** **APIs;** **RAG** **index** **on** **uploads;** **filing** **automation;** **legal** **rules** **engine;** **auto**-**“** **compliant** **”** **badges) **. **

---

## 22. Packet FIN-1 — Financial ledger foundation + submission seams + budget wiring (minimal)

**What shipped (docs):** [`financial-ledger-foundation.md`](./financial-ledger-foundation.md) (north **star,** **governance,** out **of** **scope) **· [`submission-to-ledger-bridge.md`](./submission-to-ledger-bridge.md) (review → **classify** → **extract** → **ledger** → **confirm) **. **

**Code / schema:** Prisma **`FinancialTransaction`**, **`FinancialTransactionType`**, **`FinancialSourceType`**, **`FinancialTransactionStatus` **(migration `20260510120000_fin1_financial_transaction`) **. **`src/lib/campaign-engine/budget.ts` **—** **`DEFAULT_LEDGER_CATEGORY_TO_WIRE`**, **`getBudgetWireForTransaction` **. **`src/lib/campaign-engine/financial-ingest.ts` **—** **`isFinancialSubmission`**, **`extractDraftTransactionsFromSubmission` **(seam **only) **. **Read-only** **admin** **`/admin/financial-transactions` **(list) **. **

**Intentionally not built:** **Finance** **dashboard;** **reporting** **UI;** **bank** / **FEC** / **SOS** **sync** **;** **auto**-**create** **from** **all** **submissions;** **NLP** **amount** **parsing** **on** **free** **text) **. **

---

## 23. Packet BUDGET-2 — Budget structure + budget-vs-actual foundation

**What shipped (docs):** [`budget-structure-foundation.md`](./budget-structure-foundation.md) (north star, core concepts, rails, governance, out of scope). **Updates:** [`budget-and-spend-governance-foundation.md`](./budget-and-spend-governance-foundation.md) (persistence + next packets).

**Schema / code:** Prisma **`BudgetPlan`**, **`BudgetPlanStatus`**, **`BudgetLine`** (migration `20260511120000_budget2_budget_plan_line`). **`src/lib/campaign-engine/budget.ts`** — `BUDGET2_PACKET`, `COST_BEARING_WIRE_OPTIONS`, `isCostBearingWireKindId`. **`src/lib/campaign-engine/budget-queries.ts`** — `listBudgetPlans`, `getBudgetPlanDetail`, `getBudgetActualsByWire`, `getBudgetVarianceByLine` (**CONFIRMED** actuals, category → wire, optional plan date window). **`src/lib/campaign-engine/policy.ts`** — `SpendApprovalTier`, `BudgetApprovalThreshold` / `BudgetApprovalThresholds`, `SpendingPosture`, `CAMPAIGN_POLICY_V1.spendBudget`, `CAMPAIGN_BUDGET_APPROVAL_DEFAULTS_V1`. **Admin:** `/admin/budgets`, `/admin/budgets/[id]` (create plan + line; read variance).

**How it fits:** FIN-1 ledger remains **source** for **actual** dollars; budget is **plan** and **internal control** view. **No** filing, **no** bank, **no** auto authorization.

**Intentionally not built:** Commitments table, forecasting, multi-campaign rollup, **per-line** actual split when multiple lines share a wire, enforcement by status, compliance auto-checks.

---

## 24. Packets FIN-2 + FIELD-1 + YOUTH-1 — Ledger use, field geography, youth pipeline (foundation)

**What shipped (FIN-2) —** [`financial-ledger-foundation.md`](./financial-ledger-foundation.md) (FIN-2 section) · Prisma: `confirmedByUserId` / `confirmedAt`, enum **`CONTRIBUTION`** · `src/lib/campaign-engine/financial-ledger.ts` (`createFinancialTransaction`, `confirmFinancialTransaction`) · `src/app/admin/financial-transaction-actions.ts` · `src/app/admin/(board)/financial-transactions/page.tsx` (minimal create + per-row confirm) · BUDGET-2 **actuals** **exclude** `CONTRIBUTION` **type** in `budget-queries.ts`.

**What shipped (FIELD-1) —** [`field-structure-foundation.md`](./field-structure-foundation.md) · Prisma **`FieldUnit`** / **`FieldAssignment`** (optional `positionSeatId`) · `src/lib/campaign-engine/field.ts` (`listFieldUnits`, `getFieldAssignments`, `getFieldLeadersByCounty` — read-only).

**What shipped (YOUTH-1) —** [`youth-pipeline-foundation.md`](./youth-pipeline-foundation.md) · [`youth-agent-ingest-map.md`](./youth-agent-ingest-map.md) · `src/lib/campaign-engine/youth.ts` (`YouthStage`, `YouthRoleType`, `YouthEngagementSignal` — **types only**).

**Intentionally not built:** **Finance** **dashboard,** import, reconciliation · **GIS,** **districts,** public **`County` ↔ `FieldUnit` sync** · **youth** **LMS,** **auto**-routing, **new** `PositionId` **values,** any **scoring** **engine**. **FND-1** **§8** build sequence is **unchanged** — these packets **widen** **rails,** not **orchestrate** the whole OS.

---

## 25. Packets DATA-1 + COMMS-UNIFY-1 + IDENTITY-1 — Targeting facts, comms surface map, identity story (documentation)

**What shipped (DATA-1) —** [`data-targeting-foundation.md`](./data-targeting-foundation.md) — **county** registration goals and rollups; **optional** `VoterRecord.precinct` **string**; **no** P/T/B universe model in Prisma; **volunteer** **goals** not on **`VolunteerProfile`**.

**What shipped (COMMS-UNIFY-1) —** [`communications-unification-foundation.md`](./communications-unification-foundation.md) + [`message-workbench-analysis.md`](./message-workbench-analysis.md) — **one** **orchestration** **story** (intent / targeting input / execution output) **mapped** to **existing** **threads,** **broadcast,** **Comms** **workbench,** **social,** **inbound** **content,** **E-1,** **earned/press** — **not** a **unified** **DB** **table** **in** **this** **packet**.

**What shipped (IDENTITY-1) —** [`identity-and-voter-link-foundation.md`](./identity-and-voter-link-foundation.md) + [`volunteer-data-gap-analysis.md`](./volunteer-data-gap-analysis.md) — **`VoterRecord`** **vs** **`User`** **link**; **volunteer** **data** **gaps** for **goals/performance** **narrative** **without** **schema** **changes** **here**.

**Intentionally not built in this packet:** New **migrations**; **voter** **modeling** **engine**; **single** **send** **codepath**; **login** **product** for **voters**.

---

## 26. Packets DBMAP-1 + LAUNCH-1 — Full table inventory + launch re-engagement foundation

**What shipped (DBMAP-1):** [`database-table-inventory.md`](./database-table-inventory.md) — all **105** Prisma models with purpose, domain grouping, and launch-relevance notes; `scripts/print-prisma-inventory.mjs` for drift checks on the sorted model list.

**What shipped (LAUNCH-1):** [`launch-reengagement-foundation.md`](./launch-reengagement-foundation.md) and [`launch-segmentation-and-response-foundation.md`](./launch-segmentation-and-response-foundation.md). Types and read-only helpers `countLaunchAudienceByKind` and `listLaunchReadySupporters` in `src/lib/campaign-engine/launch.ts` (no send path, no schema change).

**Intentionally not built:** marketing automation, ML segments, a persisted re-engagement status column, or merging all comms into one send engine.

---

## 27. Packet GEO-1 — County & media geographic mapping + unification foundation

**What shipped (docs only):** [`geographic-county-mapping.md`](./geographic-county-mapping.md) (every `County` / `countyId` / `countySlug` / precinct-string model in `schema.prisma`) · [`county-media-mapping.md`](./county-media-mapping.md) (social, inbound, owned media, comms, press) · [`geographic-unification-foundation.md`](./geographic-unification-foundation.md) (conceptual spine; **no** migration) · [`county-dashboard-foundation.md`](./county-dashboard-foundation.md) (future per-county dashboard by existing tables).

**What was mapped:** FK vs string vs JSON; **`FieldUnit`** / **`FieldAssignment`** vs canonical **`County`**; gaps for **`SocialContentItem`**, **`MediaOutreachItem`**, Tier-2 broadcast; **`VoterRecord.precinct`** as string only.

**Intentionally not built:** new tables, `FieldUnit`→`County` FK, or a unified geography dimension beyond documentation.

---

## 28. Packet GOALS-VERIFY-1 — County registration goals verification + source-of-truth map

**What shipped (docs):** [`county-registration-goals-verification.md`](./county-registration-goals-verification.md) — no original goals **spreadsheet** in-repo; **DB** fields `CountyCampaignStats.registrationGoal` (authoritative) and **`CountyVoterMetrics.countyGoal`** (per-snapshot mirror from recompute); admin write path; voter import **does not** ingest goals from file.

**Code:** `src/lib/campaign-engine/county-goals.ts` — **read-only** `listCountyRegistrationGoals`, `getCountyRegistrationGoalByCountyId` (no schema change).

**Intentionally not built:** import from **xlsx** for goals, volunteer-level goal persistence, or email/export of per-county goal packets in this packet.

---

## 29. Packet REL-1 — Relational Organizing Engine (ROE) foundation

**What shipped (docs only):** [`relational-organizing-foundation.md`](./relational-organizing-foundation.md) — north star, core model (volunteer, relationship, network, Power of 5, POD), system principles, **repo inspection answers** (Part G). [`pod-system-foundation.md`](./pod-system-foundation.md) — POD Leader, Core 5, extended network, reporting, ties to **county / `FieldUnit` / positions**. [`relationship-data-model-foundation.md`](./relationship-data-model-foundation.md) — future **RelationalContact** field sketch (no migration). [`relational-voter-integration.md`](./relational-voter-integration.md) — expected match/registration **flow** (no new matcher). [`relational-kpi-foundation.md`](./relational-kpi-foundation.md) — volunteer KPIs + county roll-up honesty. [`relational-ai-assist-foundation.md`](./relational-ai-assist-foundation.md) — AI scripts/coaching **constraints** (no auto-send, no impersonation).

**How it fits FND-1:** ROE is a **horizontal growth rail**: identity (`User` / `VolunteerProfile`), geography (`County`, FIELD-1), voter file (`VoterRecord`), comms execution (human-sent), and **future** relational rows. It **does not** replace `CommsPlanAudienceSegment` or E-1; it names **volunteer-owned trust networks** as first-class **concept** before schema.

**Shared rails:** New matrix row in [`shared-rails-matrix.md`](./shared-rails-matrix.md) (**Relational organizing REL-1+**).

**Intentionally not built in REL-1:** Prisma models, UI, matching logic, auto-send, REACH-style mobile app, third-party sync.

---

## 30. Packet GAME-1 — Volunteer Progression Engine (VPE) foundation

**What shipped (docs only):** [`volunteer-progression-foundation.md`](./volunteer-progression-foundation.md) — north star, core concepts (XP, levels, achievements, unlocks, momentum), principles, **repo inspection answers**. [`volunteer-leveling-system.md`](./volunteer-leveling-system.md) — six organizer maturity levels (New Volunteer through Regional Leader), unlocks and advancement gates. [`volunteer-xp-model.md`](./volunteer-xp-model.md) — action catalog tied to **REL-1 KPIs**. [`volunteer-unlock-system.md`](./volunteer-unlock-system.md) — tools, capacity, training, leadership powers, visibility. [`volunteer-identity-evolution.md`](./volunteer-identity-evolution.md) — profile narrative stages; ties to `VolunteerProfile`, future `RelationalContact`, positions/seats. [`gamification-ai-assist.md`](./gamification-ai-assist.md) — AI coaching/quests with **no manipulation** constraints.

**How it fits FND-1:** VPE is a **horizontal engagement rail**: identity (`VolunteerProfile`), relational outcomes (REL-1 / future REL-2), geography and accountability (FIELD-1, `FieldAssignment`), formal authority (ROLE-1 / SEAT-1), development posture (TALENT-1), and **advisory** AI (BRAIN-1, REL-AI). It does **not** auto-assign seats or send comms.

**Shared rails:** New matrix row in [`shared-rails-matrix.md`](./shared-rails-matrix.md) (**Volunteer progression GAME-1+**).

**Intentionally not built in GAME-1:** Prisma migrations, XP ledger tables, volunteer-facing UI, automated promotion.

---

## 31. Packet VOL-CORE-1 — Volunteer System Foundation (culture + structure + integration)

**What shipped (docs only):** [`volunteer-philosophy-foundation.md`](./volunteer-philosophy-foundation.md) — core beliefs grounded in [`philosophy/`](./philosophy/README.md), system implications (trust, suggest-don’t-command, empowering onboarding, AI tone), **tight integration** with REL-1 / GAME-1 / ROLE-1 / FIELD-1, **repo inspection** (Parts G & J). [`volunteer-role-system.md`](./volunteer-role-system.md) — County Captain, Power-of-5 Evangelist, Fundraising Leader, Campaign Ambassador, Event Manager mapped to **`PositionId`**. [`volunteer-onboarding-flow.md`](./volunteer-onboarding-flow.md) — entry, path selection, first action, Power-of-5 entry, continued engagement. [`power-of-5-system-integration.md`](./power-of-5-system-integration.md) — Core 5 ↔ REL-1 / GAME-1 / county goals. [`volunteer-county-integration.md`](./volunteer-county-integration.md) — `FieldUnit`, `CountyCampaignStats`, captains. [`volunteer-ai-guidance.md`](./volunteer-ai-guidance.md) — volunteer AI **must** / **must not**.

**How it fits FND-1:** VOL-CORE-1 is the **volunteer existence layer**: how culture becomes **rules** that connect identity (`User` / `VolunteerProfile`), **relational** program (REL-1), **earned capability** (GAME-1), **org accountability** (ROLE-1 / SEAT-1), and **geography** (FIELD-1 / `County`). **Not** a workflow engine; **not** UI.

**Shared rails:** New matrix row in [`shared-rails-matrix.md`](./shared-rails-matrix.md) (**Volunteer system core VOL-CORE-1+**).

**Intentionally not built in VOL-CORE-1:** Prisma migrations, unified volunteer onboarding route, REL-2, XP ledger.

---

## 32. Packet BLUEPRINT-LOCK-1 — System alignment + division maturity map

**What shipped (docs only):** [`system-division-map.md`](./system-division-map.md) — eight Level-3 divisions (CM, Comms, Field/Organizing, Data, Finance, Compliance, Talent, Youth), purpose + success. [`system-maturity-map.md`](./system-maturity-map.md) — **repo-grounded** ratings, ahead/behind, **repo inspection** (strongest/weakest, overbuild, blockers, volunteer UX readiness, next packets pointer). [`system-integration-map.md`](./system-integration-map.md) — connected vs isolated seams (REL/FIELD/goals, GAME/assignment, VOL-CORE, comms/targeting, etc.). [`goals-system-status.md`](./goals-system-status.md) — **`CountyCampaignStats.registrationGoal`** truth: admin + public + recompute paths; **`county-goals.ts` unused** by other modules; **no** volunteer/FieldUnit FK to goals. [`next-build-sequence.md`](./next-build-sequence.md) — balanced **3–5** packet sequence; anti-drift rule for comms.

**How it fits FND-1:** Pauses **feature expansion** narrative; forces **honest** cross-system view before the next build wave. Complements [`PROJECT_MASTER_MAP.md`](./PROJECT_MASTER_MAP.md) (orientation) with **division maturity + integration audit**.

**Intentionally not built in BLUEPRINT-LOCK-1:** code, schema, UI.

---

## 33. Packet DATA-2 — Target vote goal foundation + voter strength / geography strategy map

**What shipped:** [`targeting-data-inventory.md`](./targeting-data-inventory.md) — Prisma inventory for targeting (voter file, county goals, demographics, segments JSON, analytics **not** election results); **repo inspection** §4. [`voter-strength-foundation.md`](./voter-strength-foundation.md) — strength tiers **conceptual**; **cannot** compute “35% solid base” from `VoterRecord` alone. [`county-precinct-strategy-foundation.md`](./county-precinct-strategy-foundation.md) — county vs precinct feasibility; precinct = optional string. [`path-to-45-foundation.md`](./path-to-45-foundation.md) — planning framework toward a **vote-share** goal **without** formulas; **DATA-3** ingest gap. **Code (read-only):** `src/lib/campaign-engine/targeting.ts` — `listTargetingDataSources`, `listCountyTargetingInputSummaries`, `getCountyGoalAndMetrics`.

**How it fits FND-1:** Extends **DATA-1** with **exact** table mapping and **honest** gaps: **no** election-history models; **no** voter strength columns; **no** precinct master. **45%** and multi-candidate narrative stay **external** until structured baselines exist.

**Shared rails:** [`shared-rails-matrix.md`](./shared-rails-matrix.md) row **Data / targeting (DATA-1+ / DATA-2)** updated.

**Intentionally not built in DATA-2:** scoring engine, dashboards, vote-share calculator, new ingest of results.

---

## 34. Packet DATA-3 — Multi-signal voter strength + targeting foundation **and** election results ingest

**What shipped (docs only, two strands under one packet name):**

**A — Multi-signal voter strength + county-first targeting (today’s signals, no vote math):** [`voter-signal-inventory.md`](./voter-signal-inventory.md) — every voter-related signal source vs schema + reliability + **Part F** repo inspection answers. [`voter-strength-model.md`](./voter-strength-model.md) — composite tiers (Strong Base → Unknown / Opposed) **without** numeric scores. [`voter-signal-combination.md`](./voter-signal-combination.md) — how signals combine: precedence, conflicts, missing data. [`geographic-targeting-model.md`](./geographic-targeting-model.md) — county-first prioritization using **`CountyCampaignStats.registrationGoal`**, **`CountyVoterMetrics`**, roll counts, demographics proxies. [`targeting-future-layers.md`](./targeting-future-layers.md) — how election results, precinct normalization, modeled scores, census enrichment, REL-2, and voter-history ingest plug in later (cross-links election-ingest docs).

**B — Election results + targeting intelligence ingest foundation:** [`election-results-foundation.md`](./election-results-foundation.md) — conceptual **`ElectionContest`** / **`CountyElectionResult`** / candidate child (and optional precinct) **contract**; **FK** to **`County`**; soft link to **`VoterRecord.precinct`**; **repo inspection** (no hidden result datasets in repo; DATA-4 = migration + ingest). [`election-data-ingest-strategy.md`](./election-data-ingest-strategy.md) — CSV/XLSX expectations, normalization, FIPS/slug county mapping, precinct QA. [`targeting-signals-foundation.md`](./targeting-signals-foundation.md) — what signals **exist after** ingest (historical vote share, turnout compare, heuristics) **without** per-voter modeling. [`targeting-integration-foundation.md`](./targeting-integration-foundation.md) — joins to **`CountyCampaignStats`**, **`CountyVoterMetrics`**, FIELD, REL-1, comms.

**How it fits FND-1:** **Strand A** grounds **who to talk to** and **where to work** using **real** lists, roll, goals, and engagement tables—**without** pretending structured election history exists per voter. **Strand B** defines **how** county (and later precinct) **results** enter the DB so **path-to-goal** planning can eventually use **stored** baselines—still **without** Prisma migration in DATA-3.

**Shared rails:** [`shared-rails-matrix.md`](./shared-rails-matrix.md) — Data / targeting row lists **full** DATA-3 doc set (multi-signal + election ingest).

**Intentionally not built in DATA-3:** Prisma migrations, ingest jobs, numeric scoring engine, dashboards, per-voter modeled universes in app code.

---

## 35. Packet OFFICIAL-INGEST-1 — SOS / Ethics source mapping + election JSON ingest foundation

**What shipped (docs + types only):** [`official-source-ingest-foundation.md`](./official-source-ingest-foundation.md) — north star, source types, storage modes, provenance, repo inspection. [`sos-ethics-resource-inventory.md`](./sos-ethics-resource-inventory.md) — Financial Disclosure hub resources (PDFs, portal, archived search, training). [`election-results-ingest-foundation.md`](./election-results-ingest-foundation.md) — **observed** Arkansas JSON grains (legacy vs 2026 preferential), mapping challenges. [`official-document-ingest-strategy.md`](./official-document-ingest-strategy.md) — dashboard uploads, AI approval, RAG vs structured boundaries. **`ingest-sources.ts`** — `OfficialSourceKind`, `ProvenanceAuthorityLevel`, `ElectionResultsFileKind`, etc. (**no** crawler, **no** importer).

**How it fits FND-1:** Grounds **compliance** and **targeting** in **official** URLs + **mirror** policy + **real** election JSON—**without** filing automation or legal overclaiming.

**Intentionally not built:** Prisma migrations for results, SOS scrapers, auto RAG on upload, `OfficialResource` table.

---

## 36. Packet INGEST-OPS-1 — SOS For Candidates map + raw election results intake

**What shipped (docs + shared types):** [`sos-for-candidates-ingest-map.md`](./sos-for-candidates-ingest-map.md) — For Candidates hub mapped to ingest treatment + system use. [`official-candidate-resource-inventory.md`](./official-candidate-resource-inventory.md) — combined inventory + **INGEST-OPS** repo inspection answers. [`raw-election-results-intake-map.md`](./raw-election-results-intake-map.md) — folder file list + readiness (**Windows path** snapshot). [`election-results-implementation-plan.md`](./election-results-implementation-plan.md) — minimal implementation + **ELECTION-INGEST-1** / DATA-4 next step. Same **`ingest-sources.ts`** vocabulary.

**How it fits FND-1:** Operational bridge from **SOS/SBEC** hubs and **local JSON** to the next **code** packet—explicit about access limits and **no** giant UI.

**Intentionally not built (INGEST-OPS-1 packet):** Prisma election tables, variant ingest implementation, validation in app UI, compliance link catalog UI. **Follow-on:** **DATA-4 + ELECTION-INGEST-1** adds CLI + schema (see §36a).

---

## 36a. PROTO-1 bundle — DATA-4 + ELECTION-INGEST-1 + GOTV strategic readiness (foundation)

**What shipped (schema + ingest + read helpers + truth + docs):** Prisma models **`ElectionResultSource`**, **`ElectionContestResult`**, **`ElectionCountyResult`**, **`ElectionCandidateResult`**, **`ElectionPrecinctResult`**, **`ElectionPrecinctCandidateResult`** (+ migration `20260513120000_data4_election_ingest_foundation`). **`scripts/ingest-election-results-json.ts`** / **`npm run ingest:election-results`** — variant-aware Arkansas JSON (`legacy_election_info`: `ElectionInfo`+`Turnout`+`ContestData`; `preferential_election_data`: `ElectionData`+`TurnoutData`+`ContestData`); **one JSON file per CLI run** (prefer **`--file`**; default folder allowed only if it contains exactly one `*.json`); default raw folder **`H:\SOSWebsite\campaign information for ingestion\electionResults`**; **`--dry-run`**, **`--replace`**. **`election-results-ingest/import-json.ts`**, **`variants.ts`**. Read-only **`election-results.ts`**: `listElectionResultSources`, `getElectionResultCoverageSummary`, `listCountyElectionResults`, `getCountyElectionResultSummary`. **`truth-snapshot.ts`** — **`electionData`** metric uses ingested rows + county FK coverage; **AUTHORITATIVE** vs **PROVISIONAL** from `ElectionResultSource.isOfficial` + presence of data; warns when mapped county ratio is low. **`targeting.ts`** — documents election tabulation in **`TARGETING_DATA_SOURCES`**. Docs: [`election-results-schema-and-ingest.md`](./election-results-schema-and-ingest.md), [`gotv-strategic-readiness-foundation.md`](./gotv-strategic-readiness-foundation.md) (**planning blueprint only** — statewide phases, precinct coverage honesty, training toward GOTV; **no** product UI).

**Lanes advanced:** **DATA / Targeting** (durable reported-results storage + inventory seam); **ELECTION-INGEST** (provenance + parser variants); **BRAIN-OPS** truth inputs; **GOTV planning foundation** (doc).

**Lanes intentionally not disturbed:** **REL-2** persistence; **volunteer UI**; **GAME/XP**; **auto-routing**; **comms sends**; **compliance filing automation**.

**Why safe as a 2-packet bundle (PROTO-1):** One related **data plane** (schema + cautious ingest + narrow reads + snapshot honesty) plus one **doctrine** doc (GOTV readiness); no sends, no volunteer surfaces, no turnout models, no precinct-normalization claims.

**Unlocks next:** **PRECINCT-1** normalization; **GOTV-1** phased read model; **FIELD-2** county/precinct staffing; **REL-2**; **GOALS-BREAKDOWN-1** (see GOTV doc §7).

**Intentionally not built:** GOTV scheduler/UI; precinct assignment engine; turnout math; voter-level vote history; fake crosswalk between voter `precinct` strings and SOS location keys.

---

## 36b. VOTER-MODEL-1 + INTERACTION-1 — voter signals, provisional tiers, interaction + vote-plan log

**What shipped (schema + narrow helpers + read-only admin + docs):** Prisma **`VoterSignal`**, **`VoterModelClassification`**, **`VoterInteraction`**, **`VoterVotePlan`** (+ migration `20260514120000_voter_model_1_interaction_1_foundation`). **`voter-model.ts`** — `classifyVoterFromSignals()` (**rule output only**; **no** auto-persist). **`voter-model-queries.ts`**, **`voter-interactions.ts`**. Admin **`/admin/voters/[id]/model`**. Docs: [`voter-model-implementation-foundation.md`](./voter-model-implementation-foundation.md), [`modeling-database-implementation-plan.md`](./modeling-database-implementation-plan.md). **`truth-snapshot.ts`** — **`governance.advisoryOnly`** notes when **no** current classifications vs when rows exist (**inferred / not vote totals**).

**Lanes advanced:** **DATA / targeting** (provenance signals); **GOTV planning** (vote-plan seed); **field** (interaction log); **BRAIN-OPS** advisory honesty.

**Lanes intentionally not disturbed:** **REL-2** relational contact table; **canvassing UI**; **automation**; **comms sends**; **black-box scoring**; **auto-classification jobs**.

**Unlocks next:** **REL-2** (persist relational touches into `VoterInteraction` / signals); **PRECINCT-1**; **GOTV-1** product flows; **AREA-MODEL-1** rollups.

---

## 37. Packet BRAIN-OPS-1 — Deterministic truth engine + Campaign Manager Workbench spec

**What shipped (docs + types only):** [`deterministic-brain-foundation.md`](./deterministic-brain-foundation.md) — truth layer north star, what the brain decides / does not decide, order of operations, **truth classes** + **governance states**, canonical raw election path `H:\SOSWebsite\campaign information for ingestion\electionResults`. [`truth-governance-ownership-map.md`](./truth-governance-ownership-map.md) — source-of-truth examples (`CountyCampaignStats.registrationGoal`, `CountyVoterMetrics.countyGoal`, CONFIRMED ledger, seats, compliance AI flag), ownership + AI eligibility, **repo inspection**. [`campaign-manager-workbench-spec.md`](./campaign-manager-workbench-spec.md) — **Command Bar → Strategic Recommendations** bands, nav hierarchy, what must never show as truth. [`division-workbench-alignment.md`](./division-workbench-alignment.md) — eight divisions vs workbenches + maturity. [`discord-integration-foundation.md`](./discord-integration-foundation.md) — L0–L3 integration posture; Discord **not** source of truth. **`truth.ts`** — `TruthClass`, `GovernanceState`, `OwnershipResolutionKind`, `RecommendationEligibility` (**no** resolver implementation).

**How it fits FND-1:** **Architecture-first** bridge between **ALIGN-1 / policy / ledger / goals** and the **CM command center**—every recommendation must trace **deterministic** truth; **no** giant UI build in this packet.

**Intentionally not built:** unified CM truth **panel** UI (full spec), workbench shell refactor, Discord bot, auto-escalation routers.

**Related (visit prep):** [`candidate-county-brief-foundation.md`](./candidate-county-brief-foundation.md) — candidate **T−1 county brief** (summary + unabridged Wikipedia); **BRIEF-*** packets for render, email, workbench.

---

## 38. Packet BRAIN-OPS-2 — Truth Snapshot Engine (read model)

**What shipped (read-only code):** **`truth-snapshot.ts`** — `getTruthSnapshot()` aggregates repo-grounded signals: `County` / `CountyCampaignStats.registrationGoal`, **`electionData`** via **`getElectionResultCoverageSummary()`** (counts of `ElectionResultSource` / contests / county & precinct tabulation rows + county FK coverage — **tabulation present**, not turnout modeling), `ComplianceDocument` counts + `approvedForAiReference`, `getCoverageSummary()` (SEAT-1), `FinancialTransaction` CONFIRMED vs DRAFT via `groupBy`, `getOpenWorkCountsBySource()` (UWR-1 health), **`VoterModelClassification`** `isCurrent` **count** for **`governance.advisoryOnly`** (missing vs present **provisional** tier rows — **not** election truth). Returns `TruthSnapshot` with `truth.*` `TruthMetric` rows (`TruthClassId` from **`truth.ts`**), plus `health` / `governance` (missing election **rows** when none ingested; REL-1 gap; draft ledger; unapproved compliance; advisory copy on Wikipedia + **election tabulation ≠ certification**). **DATA-4** extended the schema consumed here; **BRAIN-OPS-2** remains **read-only**.

**Minimal UI hook:** `/admin/workbench` — collapsible JSON block (debug-style), not a full truth panel.

**How it fits FND-1:** Safe foundation for Campaign Manager dashboard honesty: **truth > completeness**, deterministic labels, no fake authority.

**Intentionally not built:** REL-2 contacts (see **BRAIN-OPS-3** for mirror/stale without relational model); no automated election certification logic.

---

## 39. Packet PROTO-1 — Progressive build protocol + master blueprint expansion

**What shipped (docs only):** [`progressive-build-protocol.md`](./progressive-build-protocol.md) — north star (one level at a time, denser blueprint, tightening guardrails), **packet rules**, **scaling** (1 vs 2 vs 3 vs 5+ packets), **lane levels L0–L5**, **drift check** habit for PRs/packets. [`master-blueprint-expansion-rules.md`](./master-blueprint-expansion-rules.md) — concrete obligations each pass (doctrine, structural map, rails matrix, delivery lanes, packet map, source-of-truth notes, reuse).

**How it fits FND-1:** Makes **PROTO-1 + handoff + PROJECT_MASTER_MAP** the explicit **continuity spine**—prepares disciplined **2-packet bundles** without scope creep.

**Intentionally not built:** automation of blueprint updates; CI enforcement of drift check.

---

## 40. Packet BRAIN-OPS-3 — Truth conflict / staleness layer

**What shipped (read-only code, no schema):** extends **`truth-snapshot.ts`** — **`countyGoalMirror`** (`getLatestVoterFileSnapshot` + per-county compare per GOALS-VERIFY-1): missing metrics row, null `countyGoal`, numeric mismatch. **`health.staleData`** populated with **repo-grounded** rules only: no COMPLETE snapshot, compliance uploads with **zero** AI approval, **draft-only** ledger, **`vacantUnderCampaignManager`**, **`CountyCampaignStats.pipelineError`** non-empty count. **`health.conflicts`** for numeric goal mirror mismatch only. **`health.warningGroups`** (`goals` / `compliance` / `finance` / `seats` / `pipeline` / `other`) plus flat **`warnings`**. Workbench JSON split into **scannable** sub-blocks.

**How it fits FND-1:** Increases **deterministic brain density** without automation or fake timestamps.

**Intentionally not built:** time-based staleness thresholds; full CM truth panel; auto-recompute triggers.

---

## 41. Packets CM-2 + UWR-2 — CM dashboard bands + unified open work expansion (PROTO-1 bundle)

**What shipped (read-only code, no schema):** **`CampaignManagerDashboardBands`** (`src/components/admin/workbench/CampaignManagerDashboardBands.tsx`) on **`/admin/workbench`** — **Truth + health** grid (`snapshot.truth.*`), **grouped warnings**, **governance** lists, **division command grid** (maturity from blueprint + `openWorkCounts` hints + honest gap notes). Collapsible JSON block **unchanged** (secondary). **`truth-snapshot.ts`** — `TruthSnapshot.openWorkCounts` (**`OpenWorkCountBySource`**) exposed for consumers; open-work **note** + volume warning include **UWR-2** sources. **`open-work.ts` (UWR-2)** — `ArkansasFestivalIngest` with **`PENDING_REVIEW`** merged into **`getOpenWorkForCampaignManager`** + counted in **`getOpenWorkCountsBySource`**; **`CommunicationThread`** with **`NEEDS_REPLY`** / **`FOLLOW_UP`** merged into **`getOpenWorkForUser`**, **`getUnassignedOpenWork`**, and CM triage; **`OpenWorkSourceModel.ArkansasFestivalIngest`**; **`UWR2_PACKET`**. **`position-inbox.ts`** — `campaign_manager` source list + heuristic note aligned to UWR-2. Docs: [`campaign-manager-dashboard-bands.md`](./campaign-manager-dashboard-bands.md), [`unified-open-work-expansion-notes.md`](./unified-open-work-expansion-notes.md).

**Lanes advanced:** **BRAIN-OPS** thin **L3** product surface (usable bands); **UWR** read density; **CM orchestration** documentation. **Lanes not disturbed:** E-1/E-2 queue-first and send boundaries, Prisma schema, automation routers, ALIGN-1 persistence, DATA-4 election ingest.

**Intentionally not built:** **`Submission`** in unified list (no triage state); per-festival row URLs; **`ACTIVE`** threads as open work; fundraising/compliance desk automation.

**Why safe as a 2-packet bundle:** One **read-model** extension (**UWR-2**) + one **thin consumer** of existing **`getTruthSnapshot`** (**CM-2**) — matches PROTO-1 §3 **2 related packets** rule; no migrations; no execution side effects.

**Unlocks next:** **CM-3** (actor-scoped band, drill-down links); **UWR-3** (county filter, governed submission queue if status exists); **DATA-4** still independent for election DB truth.

---

*Last updated: Packets FND-1, ROLE-1, TALENT-1, BRAIN-1, ALIGN-1, ASSIGN-1, UWR-1, **CM-2, UWR-2**, WB-CORE-1, SEAT-1, SKILL-1+ASSIGN-2, FUND-1, COMP-1, POLICY-1+COMP-2+BUDGET-1, FIN-1, BUDGET-2, FIN-2, FIELD-1, YOUTH-1, DATA-1, **DATA-2, DATA-3** (multi-signal voter strength + election ingest **docs**), **DATA-4 + ELECTION-INGEST-1** (Prisma tabulation + JSON ingest + **`gotv-strategic-readiness-foundation.md`**), **VOTER-MODEL-1 + INTERACTION-1**, **OFFICIAL-INGEST-1, INGEST-OPS-1**, **BRAIN-OPS-1**, **BRAIN-OPS-2**, **BRAIN-OPS-3**, **PROTO-1**, COMMS-UNIFY-1, IDENTITY-1, **DBMAP-1, LAUNCH-1, GEO-1, GOALS-VERIFY-1, REL-1, GAME-1, VOL-CORE-1, BLUEPRINT-LOCK-1** + **candidate county brief** doc.*
