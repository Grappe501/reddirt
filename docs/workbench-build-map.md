# Workbench build map (RedDirt)

Concise planning doc: what workbenches exist, what to reuse, what to build next, and where we risk one-off debt.

**Cross-references (Packet SYS-1+ / CM-1+ / FND-1+ / ROLE-1 / WB-CORE-1 / SEAT-1 / SKILL-1+ASSIGN-2 / FUND-1 / COMP-1 / POLICY-1+COMP-2+BUDGET-1 / FIN-1 / BUDGET-2 / REL-1 / GAME-1 / VOL-CORE-1):** [`relational-organizing-foundation.md`](./relational-organizing-foundation.md) (ROE bundle) · [`volunteer-progression-foundation.md`](./volunteer-progression-foundation.md) (VPE / gamification bundle) · [`volunteer-philosophy-foundation.md`](./volunteer-philosophy-foundation.md) (volunteer system core bundle) · [`email-workflow-intelligence-AI-HANDOFF.md`](./email-workflow-intelligence-AI-HANDOFF.md) (email queue intel) · [`public-site-system-map.md`](./public-site-system-map.md) (public routes, forms, APIs) · [`system-domain-flow-map.md`](./system-domain-flow-map.md) (domain ↔ workbench, missing rails) · [`campaign-manager-orchestration-map.md`](./campaign-manager-orchestration-map.md) (orchestration layer, subordinate workbenches) · [`incoming-work-matrix.md`](./incoming-work-matrix.md) (matrix of all incoming sources) · [`unified-campaign-engine-foundation.md`](./unified-campaign-engine-foundation.md) · [`shared-rails-matrix.md`](./shared-rails-matrix.md) · **ROLE-1:** [`position-system-foundation.md`](./position-system-foundation.md) · [`workbench-job-definitions.md`](./workbench-job-definitions.md) · [`position-hierarchy-map.md`](./position-hierarchy-map.md) · `src/lib/campaign-engine/positions.ts` · **WB-CORE-1:** [`position-workbench-foundation.md`](./position-workbench-foundation.md) · `src/lib/campaign-engine/position-inbox.ts` · **SEAT-1:** [`position-seating-foundation.md`](./position-seating-foundation.md) · [`delegation-and-coverage-foundation.md`](./delegation-and-coverage-foundation.md) · `src/lib/campaign-engine/seating.ts` · `prisma/schema.prisma` (`PositionSeat`) · **ASSIGN-2+SKILL-1:** [`seat-aware-assignment-foundation.md`](./seat-aware-assignment-foundation.md) · [`agent-skill-framework.md`](./agent-skill-framework.md) · [`agent-knowledge-ingest-map.md`](./agent-knowledge-ingest-map.md) · `open-work.ts` (seat-aware helpers) · `skills.ts` · **FUND-1:** [`fundraising-desk-foundation.md`](./fundraising-desk-foundation.md) + linked FUND-1 `docs` · `src/lib/campaign-engine/fundraising.ts` (no route in repo yet) · **COMP-1 (compliance rail):** [`compliance-governance-foundation.md`](./compliance-governance-foundation.md) + linked `compliance-*.md` · `src/lib/campaign-engine/compliance.ts` (no compliance workbench route in repo yet) · **BUDGET-2:** [`budget-structure-foundation.md`](./budget-structure-foundation.md) · `budget-queries.ts` · `…/admin/budgets`

---

## 1. Current workbench / admin surface inventory

| Surface | Route / area | Purpose (one line) |
|--------|----------------|-------------------|
| Main workbench hub | `src/app/admin/(board)/workbench/page.tsx` | County + comms rail, calendar/orchestration lanes, thread rail, cards; **CM-2** **`CampaignManagerDashboardBands`** (truth / warnings / governance / division grid) + collapsible BRAIN-OPS JSON + **UWR-2** unified open work. |
| Position workbenches (WB-CORE-1) | `…/workbench/positions`, `…/workbench/positions/[positionId]` | Read-only role lens: UWR-1 inbox slice (where heuristics exist) + org context + deep links; **SEAT-1** seat banner when `PositionSeat` / vacant; no RBAC. |
| **Position seats / coverage (SEAT-1)** | `…/workbench/seats` | `PositionSeat` staffing metadata: filled/vacant/acting/shadow; **optional** save per row; links to position workbench; not permissions or routing. |
| **Position workbench (ASSIGN-2)** | `…/workbench/positions/[positionId]` (same page) | **Read-only** **slice** vs **seat** **occupant** alignment (counts, global open for occupant); no auto-rebind. |
| **Fundraising desk (FUND-1+)** | *planned* `…/workbench/fundraising` (not in build) | Blueprint only in [`fundraising-desk-foundation.md`](./fundraising-desk-foundation.md): prospects, call lists, contactability, research, **KPIs;** `fundraising.ts` **types;** no dialer. |
| **Relational organizing / ROE desk (REL-1+)** | *planned* `…/workbench/relational` or volunteer-area expansion (not in build) | [`relational-organizing-foundation.md`](./relational-organizing-foundation.md) + POD/relationship/KPI/AI/voter docs — Power of 5, PODs, future **`RelationalContact`**; **no** route or schema in REL-1. |
| **Compliance governance rail (COMP-1)** | *no* dedicated route — overlay | [`compliance-governance-foundation.md`](./compliance-governance-foundation.md) + `compliance.ts`: horizontal **policy** + future paperwork prep; not a full compliance workbench. |
| **Compliance document intake (COMP-2, minimal)** | `…/compliance-documents` | [`compliance-document-ingest-foundation.md`](./compliance-document-ingest-foundation.md) + Prisma `ComplianceDocument` + `saveOwnedMediaFile`; `approvedForAiReference` (off by default). Not RAG yet. |
| **Campaign policy (POLICY-1) + spend rail (BUDGET-1 + BUDGET-2)** | `policy.ts` + `budget.ts` + Prisma `BudgetPlan`/`BudgetLine` | [`campaign-policy-foundation.md`](./campaign-policy-foundation.md), [`budget-and-spend-governance-foundation.md`](./budget-and-spend-governance-foundation.md), [`budget-structure-foundation.md`](./budget-structure-foundation.md) — light admin budgets, not a full finance desk. |
| **Financial ledger (FIN-1)** | `…/financial-transactions` | Read-only list of `FinancialTransaction`; [`financial-ledger-foundation.md`](./financial-ledger-foundation.md) — not a finance dashboard, not bank. |
| **Budget plans (BUDGET-2)** | `…/budgets`, `…/budgets/[id]` | Planned vs **CONFIRMED** actuals by cost wire; create plan + lines; [`budget-structure-foundation.md`](./budget-structure-foundation.md). |
| Email workflow queue | `…/workbench/email-queue`, `…/email-queue/[id]` | Queue-first email workflow items + interpretation (E-1/E-2). |
| Comms workbench entry | `…/workbench/comms/page.tsx` | Plans / comms hub. |
| Communication plans | `…/workbench/comms/plans/*` | Plan list, plan detail, segments. |
| Broadcasts | `…/workbench/comms/broadcasts/*` | Tier-2 broadcast flows. |
| Comms media | `…/workbench/comms/media/*` | Media tied to comms. |
| Social workbench | `…/workbench/social/page.tsx` | `SocialContentItem` + conversation monitoring UI. |
| Community events / festivals | `…/workbench/festivals/page.tsx` | Festival ingest and promotion rail. |
| Workbench calendar | `…/workbench/calendar/page.tsx` | Calendar ops. |
| Tasks | `src/app/admin/(board)/tasks/page.tsx` | Campaign tasks. |
| Events HQ | `…/events/*`, `…/workbench/…/calendar` | Event CRUD + calendar HQ links. |
| Inbox (admin) | `…/inbox/*` | Admin inbox (distinct from comms thread list). |
| Media monitor | `…/media-monitor/page.tsx` | Press / mentions. |
| Orchestrator | `…/orchestrator/page.tsx` | Orchestration entry. |
| Review queue | `…/review-queue/page.tsx` | Content/review. |
| Owned media / DAM | `…/owned-media/*` | Library, batches, grid. |
| Distribution | `…/distribution/page.tsx` | Distribution. |
| Content / editorial | `content`, `editorial`, `stories`, `blog`, `homepage` | Content ops. |
| Settings / platforms | `settings/*`, `platforms` | Config. |
| Other | `asks`, `volunteers/intake`, `voter-import`, `voters/[id]/model` (read-only voter model), `insights` (placeholder) | Specialized tools. |

**Layout / auth shell:** `src/app/admin/(board)/layout.tsx` → `requireAdminPage` + `AdminBoardShell`. **Actions:** `requireAdminAction` in `src/app/admin/owned-media-auth.ts` (used across server actions). **Actor attribution:** `getAdminActorUserId` in `src/lib/admin/actor.ts` where a `User` is needed.

---

## 2. Shared framework already present (standardize here)

- **Admin board shell + nav:** `src/components/admin/AdminBoardShell` + workbench back-links (`Link` to `/admin/workbench` pattern in multiple pages).
- **Auth:** `requireAdminPage` (layouts), `requireAdminAction` (mutations) — do not add parallel schemes.
- **List/detail + server actions:** FormData + `useTransition` + `router.refresh()` (e.g. `CreateSocialItemForm`, `RunEmailWorkflowInterpretationButton`).
- **Data layer:** DTO + mapper + query files under `src/lib/<domain>/` (e.g. `src/lib/email-workflow/dto.ts`, `queries.ts`, `mappers.ts`); comms workbench has parallel patterns.
- **Styling recipe:** `font-heading` section titles, `border-deep-soil/10` cards, `text-[10px] uppercase` labels — used on workbench + email queue.
- **Queue / run actions:** Reusable **pill** for status (`WorkbenchPill`) and **provenance panel** for interpretation metadata (`EmailWorkflowInterpretationProvenancePanel`) — E-2B extracted for repeat use.
- **Prisma + JSON provenance:** `metadataJson` namespaced keys (e.g. `emailWorkflowInterpretation`) for machine-owned audit without overwriting operator text blindly.

---

## 3. Recommended next workbench sequence (leverage-ordered)

1. **Election results ingest (DATA-4 / ELECTION-INGEST-1):** operator CLI `npm run ingest:election-results -- --file <path>` — **one election per run**; **no** workbench UI in this packet; truth snapshot reflects DB coverage.
2. **Email workflow queue (continued):** list filters, badges for `ENRICHED` / triage, optional assignment — builds on E-1/E-2; highest ROI for comms operators already linked to `CommunicationThread` / plan / send.
3. **Comms plan execution health:** already has sends/outcomes; surface failures + queue drill-down from `CommunicationPlan` into email workflow or thread — reuses DTOs in `src/lib/comms-workbench/`.
4. **Conversation / opportunity → workflow:** tighten routing from `ConversationOpportunity` / monitoring into `WorkflowIntake` and optional `EmailWorkflowItem` creation (policy later, not auto-send).
5. **Main workbench triage cards:** **CM-2** aligns **truth snapshot** bands with **`getOpenWorkCountsBySource` (UWR-2)** — avoid inventing parallel “health” metrics; extend snapshot + open-work read model first.
6. **Review queue + owned media:** where approvals meet outbound comms, reuse the same `WorkbenchPill` + “run action” + provenance pattern.

---

## 4. Shared scaffolding opportunities (justified, not a design system)

- **Queue filter toolbar** — repeated filter patterns (`searchParams` / chips on `workbench/page.tsx`); extract when a second queue (email list) gets filters.
- **Status chip** — `WorkbenchPill` (E-2B); use for any new queue status.
- **Provenance / audit block** — `EmailWorkflowInterpretationProvenancePanel` pattern: label/value rows + `<details>` for raw JSON.
- **“Run” server action** — `Run*Button` with optional force checkboxes; same shape as social + email interpretation.
- **List/detail DTOs** — keep explicit operator shapes in `dto.ts` + one `get*Detail` query with controlled `include`.

**Stub later (not now):** assignment panel, global cross-campaign queue (explicitly out of scope for email intel).

---

## 5. Risks, coupling, bottlenecks

- **One-off page sections** with copy-pasted `h2`/`h3` strings — drifts in semantics (“Operator context” vs “Row fields”); **mitigation:** small shared `WorkbenchSection` wrapper (optional) if 3+ pages adopt the same structure.
- **Prisma `include` explosion** on detail queries — N+1 or fat rows; **mitigation:** bounded `select`, separate “light list” vs “detail” queries (email workflow interpretation already does this).
- **Metadata JSON** without version keys — **mitigation:** version fields on provenance blocks (`version: 1` already in email workflow).
- **Parallel “queues”** (comms pending, email workflow, review queue) without a **single index page** of counts — risk of operator confusion; consider a small `/admin/workbench` card row that links to each (incremental).
- **Enum default vs “operator set”** — triage fields use per-field default checks (E-2B); document defaults when adding new enums.

---

## 6. Fast path: “build on rails” for the next few packets

1. **E-2+ email:** list filters + `ENRICHED` badge on list page; optional “create from thread” (single path).
2. **Comms + email:** one drill-down from failed send / plan to “open email workflow item” (link by id only).
3. **Policy (E-3) stubs:** implement `policyRoutingHookE3` with read-only rules + logging to `metadataJson` (no side effects).
4. **Shared section shell:** extract `WorkbenchSection` only if **three** workbench pages need identical chrome.

---

## 7. Packet CM-1 — Campaign Manager orchestration (blueprint)

**What shipped:** **Docs only** (plus a **one-line source comment** on `workbench/page.tsx` pointing to the orchestration map—no UI change). Artifacts: [`campaign-manager-orchestration-map.md`](./campaign-manager-orchestration-map.md) (Campaign Manager as **command/orchestration** layer; **`/admin/workbench`** as de facto hub today; subordinate workbenches; **unified incoming work** problem; roles narrative; build sequence) and [`incoming-work-matrix.md`](./incoming-work-matrix.md) (triggers → models → visibility → gaps).

**Fragmentation (learned):** `Submission` vs `WorkflowIntake`, email work split **Comms** vs **`EmailWorkflowItem`**, **orchestrator** page vs main **workbench**—all documented; **no** unified work index in the DB in CM-1.

**Intentionally not built:** New `/admin/campaign-manager` page, permissions, **incoming work** table, automation that alters live behavior.

---

## 8. Packet FND-1 — Unified campaign engine foundation + shared rail scaffolding

**What shipped (documentation + optional typed seam, no workbench or behavior):**

- [`docs/unified-campaign-engine-foundation.md`](./unified-campaign-engine-foundation.md) — **Canonical** foundation: **north star** (unified **operating system**, not admin island pages), **8 core layers** + repo evidence, **10 shared rails**, **canonical domain objects** (incl. gaps like abstract “incoming work”), how **existing** routes are **evidence** not **target topology**, what to **standardize** early vs **not**, **post-FND-1** packet sequence, **fastest path** to a real unified engine.
- [`docs/shared-rails-matrix.md`](./shared-rails-matrix.md) — **Matrix:** purpose, evidence, gap, first step, dependent domains, **risk if delayed** per rail.
- `src/lib/campaign-engine/README.md` and `vocabulary.ts` — `CampaignEngineRail` string constants; **no** runtime, **no** imports required.

**Build direction (learned):** Future workbenches must **plug into** **incoming / identity / assignment / comms** **rails**; the Campaign Manager **orchestrates** **above** the same **objects**. **Not** a force-fit of every product into a single `Work` table on day one.

**Intentionally not built in FND-1:** `UnifiedWorkItem` DB, RBAC, automation, redesign of workbenches, merging email workflow and Comms send semantics.

---

## 9. Packet ROLE-1 — Position system + workbench job definitions

**What shipped (documentation + `positions.ts` tree; no RBAC, no new admin UI):**

- [`docs/position-system-foundation.md`](./position-system-foundation.md) — Hierarchical **position** as architectural object: roll-up, workbench + incoming/assignment + automation hooks, scaling narrative.
- [`docs/workbench-job-definitions.md`](./workbench-job-definitions.md) — Operational job definitions for CM, executive layer, comms, field, data, operations, and intern/volunteer; routes reference **this** inventory table.
- [`docs/position-hierarchy-map.md`](./position-hierarchy-map.md) — Org **tree** and up/down/sideways flow.
- `src/lib/campaign-engine/positions.ts` — `PositionId` + `POSITION_TREE` + `getChildPositions` (placeholder; must match docs or be replaced by a single source of truth later).

**How it fits FND-1 + CM-1:** Positions are **seats** on the same **shared rails**; **Campaign Manager** remains orchestrator. Workbenches in §1 are **evidence** of what each position **operates**—**not** the org chart itself.

**Intentionally not built (in ROLE-1 / still true for routes):** position-scoped **API** or **route** **RBAC**, auto-routing, personalized workbench **generation** from code alone. *Update (SEAT-1):* optional **`User`↔`positionKey` on** `PositionSeat` **for staffing visibility**; **not** a permission system — see `…/workbench/seats` and [`position-seating-foundation.md`](./position-seating-foundation.md).

---

*Last updated: Packets ROLE-1, SEAT-1 (seating table + admin coverage; `positions.ts` still ROLE-1 seam); **BUDGET-2** (`…/budgets`); **CM-2** (dashboard bands on main workbench) + **UWR-2** (festival + actionable threads in `open-work.ts`).*

---

## 10. Packets DBMAP-1 + LAUNCH-1 — Full Prisma inventory + launch re-engagement foundation

**What shipped (DBMAP-1):** [`database-table-inventory.md`](./database-table-inventory.md) — **105** Prisma models in one **alphabetical** inventory (purpose, domain, relations, active/legacy heuristic, launch relevance). `scripts/print-prisma-inventory.mjs` regenerates the sorted model list for drift checks.

**What shipped (LAUNCH-1):** [`launch-reengagement-foundation.md`](./launch-reengagement-foundation.md) and [`launch-segmentation-and-response-foundation.md`](./launch-segmentation-and-response-foundation.md) — honest **~100+** supporter re-engagement story on **existing** rails (no automation engine). `src/lib/campaign-engine/launch.ts` — **types** + **read-only** `countLaunchAudienceByKind` / `listLaunchReadySupporters` (planning only; **not** consent to send).

**Intentionally not built:** marketing automation, ML segmentation, new “launch status” columns, or merging all comms send paths.

*Last updated: Packets DBMAP-1, LAUNCH-1.*

---

## 11. Packet GEO-1 — County / media geographic mapping (docs only)

**What shipped:** [`geographic-county-mapping.md`](./geographic-county-mapping.md) (all models with `County` FK, `countySlug` / `countyFips`, `User.county`, `VoterRecord.precinct` string, `FieldUnit` / `FieldAssignment` vs `County`) · [`county-media-mapping.md`](./county-media-mapping.md) (which media/comms models are direct vs inferred vs JSON) · [`geographic-unification-foundation.md`](./geographic-unification-foundation.md) (spine, **no** schema) · [`county-dashboard-foundation.md`](./county-dashboard-foundation.md) (future county dashboard = join existing tables).

**Fragmentation called out:** **`FieldUnit`** is not FK-linked to **`County`**; comms workbench and social often need **joins** to `CampaignEvent` / `WorkflowIntake` for county; **Tier-2** broadcast uses **JSON** for audience. **`MediaOutreachItem`** has no county column.

**Intentionally not built:** new migrations, a single `CountyDashboard` view, or auto-linking `FieldUnit` names to FIPS.

*Last updated: Packet GEO-1.*

---

## 12. Packet REL-1 — Relational Organizing Engine (ROE) foundation

**What shipped:** **Documentation only** — [`relational-organizing-foundation.md`](./relational-organizing-foundation.md) (north star, core model, principles, repo inspection answers), [`pod-system-foundation.md`](./pod-system-foundation.md), [`relationship-data-model-foundation.md`](./relationship-data-model-foundation.md), [`relational-voter-integration.md`](./relational-voter-integration.md), [`relational-kpi-foundation.md`](./relational-kpi-foundation.md), [`relational-ai-assist-foundation.md`](./relational-ai-assist-foundation.md). **Shared rails:** new row in [`shared-rails-matrix.md`](./shared-rails-matrix.md).

**Workbench impact:** §1 adds a **planned** relational desk row; no new admin URL in REL-1.

**Intentionally not built:** Prisma `RelationalContact` (or equivalent), volunteer network UI, voter match automation, REACH-style integrations.

*Last updated: Packet REL-1.*

---

## 13. Packet GAME-1 — Volunteer Progression Engine (VPE) foundation

**What shipped:** **Documentation only** — [`volunteer-progression-foundation.md`](./volunteer-progression-foundation.md) (north star, concepts, principles, repo inspection), [`volunteer-leveling-system.md`](./volunteer-leveling-system.md), [`volunteer-xp-model.md`](./volunteer-xp-model.md), [`volunteer-unlock-system.md`](./volunteer-unlock-system.md), [`volunteer-identity-evolution.md`](./volunteer-identity-evolution.md), [`gamification-ai-assist.md`](./gamification-ai-assist.md). **Shared rails:** new row in [`shared-rails-matrix.md`](./shared-rails-matrix.md).

**Workbench impact:** No new admin URL; future **GAME-2+** may add read-only **progress audit** for ops or a volunteer-facing area tied to REL-2.

**Intentionally not built:** XP ledger, `VolunteerProfile` progression fields, unlock enforcement in code, volunteer UI.

*Last updated: Packet GAME-1.*

---

## 14. Packet VOL-CORE-1 — Volunteer System Foundation (culture + structure + integration)

**What shipped:** **Documentation only** — [`volunteer-philosophy-foundation.md`](./volunteer-philosophy-foundation.md) (beliefs, system rules, REL-1/GAME-1 integration spine, repo inspection), [`volunteer-role-system.md`](./volunteer-role-system.md), [`volunteer-onboarding-flow.md`](./volunteer-onboarding-flow.md), [`power-of-5-system-integration.md`](./power-of-5-system-integration.md), [`volunteer-county-integration.md`](./volunteer-county-integration.md), [`volunteer-ai-guidance.md`](./volunteer-ai-guidance.md). **Shared rails:** new row in [`shared-rails-matrix.md`](./shared-rails-matrix.md).

**Workbench impact:** No new routes; defines how **movement roles** map to **`PositionId`** for future staffing UIs and volunteer-facing shells.

**Intentionally not built:** onboarding wizard, volunteer home, REL-2, new position keys for fundraising volunteer lead.

*Last updated: Packet VOL-CORE-1.*

---

## 15. Packet DATA-4 + ELECTION-INGEST-1 — election results ingest (operator CLI)

**What shipped:** Prisma election tabulation models + **`npm run ingest:election-results -- --file …`** (one JSON per run); read helpers **`election-results.ts`**; **`truth-snapshot`** **`electionData`** uses ingested rows. Docs: [`election-results-schema-and-ingest.md`](./election-results-schema-and-ingest.md), [`gotv-strategic-readiness-foundation.md`](./gotv-strategic-readiness-foundation.md).

**Workbench impact:** **No** new admin route — operators run CLI; CM-2 bands pick up snapshot **honesty** only.

**Intentionally not built:** GOTV UI, precinct assignment, turnout math.

*Last updated: DATA-4 + ELECTION-INGEST-1.*

---

## 16. Packet VOTER-MODEL-1 + INTERACTION-1 — voter modeling + interaction log (foundation)

**What shipped:** Prisma **`VoterSignal`**, **`VoterModelClassification`**, **`VoterInteraction`**, **`VoterVotePlan`**; helpers under `src/lib/campaign-engine/voter-*.ts`; read-only **`/admin/voters/[id]/model`**. **`classifyVoterFromSignals`** returns a suggestion only — **no** cron, **no** auto-persist.

**Workbench impact:** Narrow **admin** detail route; **not** voter search, **not** canvassing.

**Intentionally not built:** REL-2 relational table, Power-of-5 UI, GOTV runner, area rollups.

*Last updated: VOTER-MODEL-1 + INTERACTION-1.*
