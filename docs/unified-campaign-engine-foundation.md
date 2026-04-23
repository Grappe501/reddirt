# Unified campaign engine — foundation (RedDirt)

**Packet FND-1.** **Canonical** architecture doc for a **fresh** unified campaign operating system: not “the admin app we have,” but the **target shape** the codebase should **grow into**. Existing routes and workbenches are **evidence and migration inputs**, not the final topology.

**Cross-ref:** [`shared-rails-matrix.md`](./shared-rails-matrix.md) · [`ai-agent-brain-map.md`](./ai-agent-brain-map.md) · [`ai-integration-matrix.md`](./ai-integration-matrix.md) · [`campaign-brain-alignment-foundation.md`](./campaign-brain-alignment-foundation.md) · [`automation-override-and-impact-foundation.md`](./automation-override-and-impact-foundation.md) · [`user-scoped-ai-context-foundation.md`](./user-scoped-ai-context-foundation.md) · [`position-system-foundation.md`](./position-system-foundation.md) · [`workbench-job-definitions.md`](./workbench-job-definitions.md) · [`assignment-rail-foundation.md`](./assignment-rail-foundation.md) · [`position-inbox-foundation.md`](./position-inbox-foundation.md) · [`position-workbench-foundation.md`](./position-workbench-foundation.md) · [`unified-open-work-foundation.md`](./unified-open-work-foundation.md) · [`unified-incoming-work-read-model.md`](./unified-incoming-work-read-model.md) · [`talent-intelligence-foundation.md`](./talent-intelligence-foundation.md) · [`campaign-manager-orchestration-map.md`](./campaign-manager-orchestration-map.md) · [`incoming-work-matrix.md`](./incoming-work-matrix.md) · [`system-domain-flow-map.md`](./system-domain-flow-map.md) · `src/lib/campaign-engine/README.md`

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

*Last updated: Packets FND-1, ROLE-1, TALENT-1, BRAIN-1, ALIGN-1, ASSIGN-1, UWR-1, WB-CORE-1, SEAT-1, SKILL-1+ASSIGN-2, FUND-1, COMP-1, POLICY-1+COMP-2+BUDGET-1, FIN-1, BUDGET-2.*
