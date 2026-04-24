# THREAD-HANDOFF-1 — Complete Campaign OS Transition Map (RedDirt)

**Packet:** **THREAD-HANDOFF-1**  
**File:** `docs/THREAD_HANDOFF_MASTER_MAP.md`  
**Stack (ground truth):** Next.js App Router · Prisma · PostgreSQL · optional OpenAI / RAG · monorepo package `reddirt-site` under `RedDirt/`.  
**Quality gate:** `npm run check` (lint + `tsc --noEmit` + build) before significant pushes. Local: `npm run dev:full` (see `RedDirt/README.md`).

**How to use this file:** This is a **single drag-and-drop** artifact for a **new ChatGPT thread, Cursor session, or human hire**. It orients, audits, and routes—**it does not replace** reading `prisma/schema.prisma` and key code when implementing. If anything here conflicts with **code** or **migrations**, **code wins**; update this file after you verify.

**Durable one-page protocol** (preflight, checklists, return formats, division balance, active **build steering**): [`BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md`](./BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md) (**PROTO-2** + **BLUEPRINT-OPS-1** + **DIV-OPS-1** + **DIV-OPS-2** + **BLUEPRINT-EXP-1**). **Unattended / self-build (overnight) rails:** [`AUTO_BUILD_PROTOCOL.md`](./AUTO_BUILD_PROTOCOL.md) (**AUTO-BUILD-1** policy, **AUTO-BUILD-2** nightly **GitHub** **workflow** + **preflight** **artifact**). **Division registry** (balance + **Priority** + **forward path** per division): [`DIVISION_MASTER_REGISTRY.md`](./DIVISION_MASTER_REGISTRY.md) — **required** before the next packet; **check** parity, **CRITICAL** gaps, **Build steering** / **next-stage** **unlocks** vs [`PROJECT_MASTER_MAP.md`](./PROJECT_MASTER_MAP.md) **Blueprint Progress Ledger** + **Future-state blueprint**.

---

## 0. Operating Protocol: ChatGPT ↔ Cursor Build Loop

This section is the **canonical build doctrine** for **PROTO-2** (permanent handoff) and **BLUEPRINT-OPS-1** (self-constructing blueprint + audit). Section [4](#4-workflow-protocol-user-chatgpt-cursor) remains a **short** operational summary; this section is the **full** reference.

### 0.1 ChatGPT ↔ Cursor loop

1. The **user** gives **ChatGPT** Cursor’s result (structured return, file list, notes).
2. **ChatGPT** writes the next **tight Cursor script** (scope, acceptance, explicit out of scope).
3. The **user** pastes that script into **Cursor**.
4. **Cursor** implements, audits, and returns **structured** results (see [0.2](#02-cursor-return-format)).
5. **ChatGPT** summarizes progress, updates **blueprint** direction, and writes the **next** script.
6. **No** asking the user to re-explain **known** context that already lives in the maps or repo.
7. **User** side comments **without** Cursor results are treated as **background / off-record** unless the user **explicitly** requests a Cursor script or a doc/code change from them.

### 0.2 Cursor return format

Every Cursor return should include:

- **IMPLEMENTED** — What was done (and what was explicitly *not* done).
- **FILES** — Paths touched; migrations named if applicable.
- **BUILD PROGRESS UPDATE** — Packets, rails, and behavior delta vs before.
- **BLUEPRINT PROGRESS UPDATE** — What is now real in code vs docs-only; next safe packet.
- **BUILD STEERING DECISION** (DIV-OPS-2) — **TARGET DIVISION**; **REASON**; **NON-TARGET DIVISIONS** (and why not). **Mandatory** every pass; see [`BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md`](./BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md) and **§0.9** below.
- **DIVISION STATUS UPDATE** (DIV-OPS-1) — For each **relevant** division: **level (L0–L5)**; **what changed**; **imbalance / risk**.
- **DRIFT CHECK** — Stayed on rails? Any overreach or scope creep?
- **LANE LEVEL UPDATE** — Which lanes moved **L0–L5** (use the lane table in §0.5).
- **WHAT IS STILL MISSING** — Honest gaps; dependencies before automation.
- **NEXT RECOMMENDED PACKET** — Single default packet when possible.
- **CHECKS** — What was run (`tsc`, migrate, lint) or “docs-only, no code checks.”

### 0.3 ChatGPT return format

Every ChatGPT pass should include:

- **What** the next Cursor script is building.
- **Why** it matters (campaign/engineering).
- **Current blueprint** progress (which lanes, which maturity).
- The **Cursor script** (ready to paste).
- **No** pause for open-ended “what do you want?” unless **blocked** by missing repo **facts** or **unsafe** ambiguity that cannot be resolved from the repo or user’s stated constraint.

### 0.4 Build philosophy

- **Bottom-up, no shortcuts, no fake completion** — Durable foundations before clever automation.
- **Build durable foundations before automation.**
- **Automation** never outruns **approval**, **auditability**, or **governance** state in the product.
- **AI** can draft, summarize, classify, and recommend; **AI is not** the final authority on truth, compliance, or execution.
- **User approval** remains the default for **outbound email**, **public messaging**, **voter classification**, **escalation**, **compliance-sensitive** actions, and **financial** actions—until the blueprint **explicitly** authorizes otherwise.
- **Source-of-truth** distinction (store everywhere it matters):
  - **Database / code** truth.
  - **Operational** truth (what actually happened in the field or ops).
  - **Advisory AI** truth (suggestions, scores, draft copy — always labeled).
  - **Narrative / reference** truth (docs, training, public story — not a substitute for data).
- **Discord** is referred to in user-facing copy as the **AJAX Organizing Hub** (see internal Discord integration docs for wiring).
- **Email** should **route to the queue by default** until **policy** allows no-approval sending.

### 0.5 Lane maturity (L0–L5) — PROTO-2 + BLUEPRINT-OPS-1

On each pass, the blueprint should record **lane maturity** using this scale (align packet notes with it):

| Level | Meaning |
|-------|---------|
| **L0** | Concept only. |
| **L1** | Docs / spec. |
| **L2** | Persistence / seams (schema, types, read helpers, admin seams). |
| **L3** | Operator UI / workflows (a human completes a real job in-product). |
| **L4** | Automation / queues (policy-governed, auditable). |
| **L5** | Optimization / intelligence (downstream of stable rails). |

**Blueprint expansion rule (each pass):** Record what is **now real in code**; what remains **docs-only**; the **next safe** packet; **dependencies** before automation; and **lane** maturity **L0–L5** per the table above.

### 0.6 Packet scaling rule

- **Default:** **one** packet per pass.
- **Two** packets: allowed only when **same lane** and **low risk** (e.g. thin consumer + read-model doc).
- **Three** packets: only when **tightly coupled** and explicitly justified.
- **Five or more:** only for **docs-only** or **reference / indexing** work—not for hiding large behavior change.
- **Never** hide large behavior changes inside **“cleanup.”**

### 0.6a INGEST-OPS-2 — Election + brain backlog check

**Every** regular build pass should **account** for **ingest** **status** (see full rule in [`BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md`](./BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md) **INGEST-OPS-2**):

1. Is **election** JSON ingest **complete** (for the **intended** DB) or **documented** as **skipped**?  
2. If **not** complete, does **this** packet **advance** it (ingest, dry-run, **fix**, or **named** **blocker**)?  
3. If **complete**, does **this** packet take **one** **safe** **brain/source** file **group** (ingest, mapping, or **queue** **update**)? If **no**, **why**?  
4. **Do** **not** **force** data work into **unrelated** **high-risk** passes — but **report** the **line**.

**Source of truth:** [`INGEST_STATUS_AND_BACKLOG.md`](./INGEST_STATUS_AND_BACKLOG.md) · generated [`INGEST_INVENTORY_GENERATED.md`](./INGEST_INVENTORY_GENERATED.md) via `npm run ingest:inventory` from `RedDirt/`.

### 0.7 Current latest build state (Apr 2026)

- **REL-2 (relational contact foundation)** is **implemented** as **L2** — relational **persistence** and **admin** seam (`RelationalContact`, `VoterInteraction` / `VoterSignal` links, `relational-contacts.ts`, `relational-matching.ts`, admin pages, truth snapshot advisory counts). **`npx prisma generate`** and **`npx tsc --noEmit`** have passed when last run; **migration file exists** and **must** be **applied per environment** when the database is available (`npx prisma migrate deploy` or dev equivalent).
- **REL-3 (volunteer relational surface)** is **partially** **implemented** — organizer **`/relational`**, **rollups** / **dedupe** **signals**, **`recordRelationalTouch`**; **county**-scale **cross-volunteer** **rollups** and **governed** **merge** **workflow** remain **forward** **path** (see **Division forward path** in [`DIVISION_MASTER_REGISTRY.md`](./DIVISION_MASTER_REGISTRY.md)). **GOTV-1** read model remains a **separate** **CRITICAL** **track** (same map).
- **Email workflow** remains **queue-first**, **approval-first**; no change to that doctrine in this pass.

### 0.8 Division balance system (DIV-OPS-1)

- **Divisions** (top-level campaign OS areas) are listed and leveled in [`DIVISION_MASTER_REGISTRY.md`](./DIVISION_MASTER_REGISTRY.md). They must be **reviewed** on **every** pass as part of the **division status** return — not only the lane you edited.
- **ChatGPT** may **redirect** the next build to a **lagging** division if **imbalance** is unsafe (e.g. automation in one area while a **foundational** division is still **L1**) — **document the rationale** if you intentionally **skew**.
- **Cursor** must **not** assume the “obvious” next packet without **checking** division **gaps** in the **registry** + [`PROJECT_MASTER_MAP.md`](./PROJECT_MASTER_MAP.md) **Blueprint Progress Ledger** (they **must** stay **aligned**).
- **Balance rule:** no division should hit **L4+** while another **critical** division is stuck at **L1** without **explicit** justification; **foundational** divisions should be at **L2** before **dependent** **automation** elsewhere. Full doctrine: [`BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md`](./BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md) **Division tracking & balance (DIV-OPS-1)**.

### 0.9 Build steering system (DIV-OPS-2)

- **ChatGPT** selects **direction** using **imbalance** + **Priority level** in [`DIVISION_MASTER_REGISTRY.md`](./DIVISION_MASTER_REGISTRY.md) (e.g. **CRITICAL** = Volunteer / Field, GOTV); **Cursor** is expected to **execute within** the **script’s** **target** division **unless** the script explicitly authorizes a pivot.  
- **Cursor** must **not** **silently** redirect a build to an **easier** or **familiar** lane (e.g. more **Comms** or **Workbench** polish while **GOTV** or **volunteer** lags) without stating it in the **Build steering decision**.  
- If **Cursor** detects a **better** **alternative** than the script’s target: **propose** it **explicitly** in **BUILD STEERING DECISION** (REASON + NON-TARGET) — do **not** **assume** the redirect; the **user** / **ChatGPT** confirms next pass.  
- **Enforcement** (declarations, L3+ justification): [`BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md`](./BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md) **Build steering doctrine (DIV-OPS-2)**.

### 0.10 Blueprint forward vision (BLUEPRINT-EXP-1)

- **Every** **thread** (ChatGPT and Cursor) should weigh **not only** **current** **maturity** (**L0–L5**, **imbalance**) but the **next** **documented** **stage** for the **relevant** **division(s)** in [`DIVISION_MASTER_REGISTRY.md`](./DIVISION_MASTER_REGISTRY.md) **Division forward path**.  
- **ChatGPT** may **choose** the **next** **Cursor** **script** / **packet** to **unlock** a **named** **horizon** (e.g. **GOTV** read model, **comms** **triage** **depth**, **workbench** **panels**) **even** when **pure** **lane** **imbalance** would **suggest** a **different** **lane** — **if** the **unlock** is **stated** in the **script** and **registry** (no **blind** **builds**; see [`BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md`](./BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md) **Blueprint Expansion Doctrine (BLUEPRINT-EXP-1)** and [`shared-rails-matrix.md`](./shared-rails-matrix.md) **Blueprint must lead**).  
- **Cursor** should **name** **which** **next** **stage** **moved** in **BUILD PROGRESS** / **DIVISION STATUS** when work **materially** **advances** a **forward-path** **bullet**.  

### 0.11 Controlled self-build / overnight mode (AUTO-BUILD-1)

- **When:** A **user** (or **ChatGPT** **script** ) authorizes **Cursor** to run **unattended** (e.g. **overnight**) with **low**-**risk** **scope**.  
- **Not:** **Autonomous** **campaign** **control**. Self-build is **not** a license to **send**, **publish**, **mutate** **money**/**compliance**, or **add** **migrations** without **human** **review** (unless a **script** **explicitly** assigns **that** **migration** **this** **cycle**).  
- **Must read (each cycle before coding):** [`THREAD_HANDOFF_MASTER_MAP.md`](./THREAD_HANDOFF_MASTER_MAP.md) (this file, **at least** **§0** + **0.11**), [`BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md`](./BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md), [`DIVISION_MASTER_REGISTRY.md`](./DIVISION_MASTER_REGISTRY.md). **Choose** only the **next** **approved** **packet** from the **blueprint** / [**Approved Self-Build Queue**](./AUTO_BUILD_PROTOCOL.md#3-approved-self-build-queue) in [`AUTO_BUILD_PROTOCOL.md`](./AUTO_BUILD_PROTOCOL.md).  
- **Must do:** **Declare** **Build steering decision**; **update** **blueprint** **docs** when **material**; **run** **checks** (e.g. `tsc` for **touched** **code**); **stop** after **one** **packet**; **produce** a **handoff** **report** (packet, **target** **division**, **files**, **checks**, **risks**, **human** **approval** still **needed**, **next** **packet**).  
- **Hard stop** (escalate to **human** **before** **continuing**): **auth**/**security**; **schema** **migration** (unless **assigned** this cycle); any **outbound** **action**; **conflicting** **docs**; **`tsc`** **fails** after **reasonable** **fix**; **scope** **exceeds** **one** **primary** **division** + **doc** **sync** — see [`AUTO_BUILD_PROTOCOL.md`](./AUTO_BUILD_PROTOCOL.md) **§6**.  
- **AUTO-BUILD-2 (nightly runner):** [`.github/workflows/nightly-self-build.yml`](../.github/workflows/nightly-self-build.yml) runs on **schedule** ( **~2:30 AM** **America/Chicago** **during** **CDT** **via** **07:30 UTC** **cron** — **see** **workflow** **for** **DST**); **preflight** + **`tsc`**, **handoff** **upload**; **no** **deploy** / **migrate** / **push** / **send** / **classify** / **score** / **production** **writes** — not **autonomous** **ops**.  

---

## 1. EXECUTIVE ORIENTATION

**What RedDirt is**  
`RedDirt/` is the **“Red Dirt Democrats”** campaign codebase: a **public site** (voter narrative, forms, county storytelling, “Ask” assistant patterns) **plus** a **large admin workbench** for comms, social monitoring, content, events, workflow intake, and **growing foundation rails** (unified open work, positions, seating, policy, budget, ledger, field units, voter/election/relational data).

**What the Kelly Grappe campaign system is**  
The public-facing and operator-facing system for **Kelly Grappe for Arkansas Secretary of State** (e.g. paid-for disclaimers, policy defaults in `CAMPAIGN_POLICY_V1`, ingested internal staffing/role **background** docs in `docs/background/` for search—**not** voter promise pages by default). The **program** in code is: **one mental model** for statewide work with **minimal traditional staff**—the **software** is the force-multiplier, not a brochure.

**Why this is not “just a website” or “just a CRM”**  
- **Not only marketing:** there are real **Prisma models**, **comms execution paths**, **voter file ETL**, **ledger/budget** surfaces, and **operational** queues.  
- **Not a full commercial CRM:** there is **no** Salesforce-shaped universe; “CRM” is **emerging** from `User` + work objects + `Communication*` + `EmailWorkflowItem` + (optional) `VoterRecord` + **`RelationalContact` (REL-2)**.  
- **The goal** is a **full AI-*assisted* campaign operating system**: deterministic **truth** and **governance** first, then recommendations; **queue-first** where outbound is sensitive; **humans** retain execution authority on the paths the packets define.

**Statewide + minimal staff**  
Campaign Manager and orchestration docs (`campaign-manager-orchestration-map.md`, UWR) assume **one operator can hold the triage model** while the repo **aggregates** open work and **deep-links** to specialized tools. Scaling is meant to be **seat-based** and **assignment-based** on **shared objects**, not duplicate department apps.

**Bottom-up, people-powered organizing (philosophy → build)**  
Public and internal tone aim **calm**, direct, human—**meet people where they are** (county pages, local proof, field rails, volunteer intake). The **build** tries not to **collapse** that into a single national template. See `docs/philosophy/`, `docs/narrative/`, `docs/brand/`.

**AI as digital campaign manager / assistant, never unchecked authority**  
- **Assistance:** RAG, assistant route, comms thread hints, E-2A **deterministic** interpretation (not LLM in that path), form classification.  
- **Not autonomous sends:** email workflow is **queue-first**; E-1/E-2 invariants are **non-negotiable** in design (see `email-workflow-intelligence-AI-HANDOFF.md`).  
- **Brain posture:** `truth.ts` + `getTruthSnapshot()` + CM bands—**recommendation is downstream** of resolved truth; AI does **not** own a truth tier.

---

## 2. CAMPAIGN PHILOSOPHY AND TONE (BUILD-ALIGNED)

- **Calm tone** — no manufactured panic in copy; product paths avoid **fake urgency** as a default tactic.  
- **People-first** — organizing is about **real relationships** and trust; **relational** and **field** docs center named humans, not only abstract metrics.  
- **Bottom-up** — **community is the strategy**; county and local proof matter.  
- **“We are here to help people organize where they are”** — public IA + field rails reflect **local** entry, not a single national funnel.  
- **Volunteers are trusted to lead** — VOL-CORE / REL-1 doctrine: **alignment over control**; the OS **supports** without replacing judgment on the ground.  
- **No chaos, no default attack posture** — narrative and agent guardrails discourage toxic engagement patterns.  
- **No AI manipulation** — gamification/AI assist docs (GAME-1, `gamification-ai-assist.md`) require **no manipulation** as a principle; comms and volunteer AI **must not** auto-send or apply **pressure** tactics without explicit product+policy.  

If copy work is needed, **read** `docs/philosophy/README.md` and `docs/brand/README.md`—this section is a **summary**, not a substitute.

---

## 3. CORE BUILD PHILOSOPHY (FND-1 + PROTO-1 + MATRIX)

| Principle | Meaning in-repo |
|-----------|-----------------|
| **Foundation first** | Name **rails** (incoming, identity, assignment, policy, geography, truth) before thick specialty UI. |
| **Rails before specialty features** | Workbenches are **execution surfaces** on shared models; avoid parallel queues. |
| **Deterministic truth before recommendations** | `truth.ts` classes; `getTruthSnapshot()`; CM bands—**no** “smart dashboard” that invents authority. |
| **Source-of-truth before dashboard** | e.g. `CountyCampaignStats.registrationGoal` vs `CountyVoterMetrics.countyGoal` (mirror)—see §12 and `county-registration-goals-verification.md`. |
| **Read models before automation** | UWR, `truth-snapshot`, `open-work`, `seating` reads—**before** large automated runners. |
| **Humans govern sensitive decisions** | Send, spend, compliance trust, high-risk routing—**policy + review** first. |
| **Queue-first for comms / email (where sensitive)** | `EmailWorkflowItem` is **review-first**; do not merge triage and **send** semantics without a product decision (`communications-unification-foundation.md`). |
| **Provenance everywhere** | `metadataJson` patterns, E-2 interpretation provenance, compliance doc flags. |
| **No fake precision** | Precinct = **string** on `VoterRecord`; election ingest = **tabulation storage**, not certification; tiers = **provisional** unless human-confirmed. |
| **No black-box scoring** | `voter-model.ts` **suggests** classification; **no** auto-persist to `VoterModelClassification` in core helpers. |
| **No automation without rules** | Cron/webhooks exist in places; new automation needs **packet + policy** alignment. |

---

## 4. WORKFLOW PROTOCOL: USER, CHATGPT, CURSOR

**Canonical doctrine:** the full **PROTO-2** loop, return formats, packet scaling, and lane **L0–L5** table are in [**§0**](#0-operating-protocol-chatgpt--cursor-build-loop) and in [`BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md`](./BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md). This section is a **short** retained summary for readers who start at §4.

**The loop (how this project is meant to be extended):**

1. **User** runs a **scoped** task in **Cursor** (or pastes a PR / diff / file list back into ChatGPT).  
2. **ChatGPT** reads outputs, **reconciles** with `PROJECT_MASTER_MAP.md`, `workbench-build-map.md`, and **existing** `schema.prisma`—**does not** assume greenfield.  
3. **ChatGPT** updates **lane levels** and **drift** mentally (and in the **next** packet / doc edit): what advanced, what must **not** be disturbed.  
4. **ChatGPT** identifies **dependencies** (e.g. PRECINCT-1 before precinct GOTV product).  
5. **ChatGPT** writes the **next Cursor script** (scope, acceptance, **explicit out of scope**).  
6. **Cursor** implements; **inspects** `grep` / routes / inventory **before** adding models.  
7. **Every pass** deepens the **blueprint**: `unified-campaign-engine-foundation.md` §, `shared-rails-matrix.md` row, `PROJECT_MASTER_MAP.md`, and **this file** when continuity shifts.  
8. **Every pass** must **label**: docs-only · code (no schema) · **schema/migration** · UI.  
9. **Every packet** states **lanes advanced** and **lanes explicitly not touched**.

**After every Cursor result, ChatGPT should return (user expectation):**

1. **What changed** (files, behavior, **delivery mode**).  
2. **Lane level update** (which rails moved L*→L*).  
3. **Drift check** (stayed on rails? any overreach?).  
4. **Next Cursor script** (or “pause—verify X first”).  

**User preference:** When the user asks for a **tight Cursor script only**, provide **no extra** narrative.

---

## 5. PACKET SCALING PROTOCOL (PROTO-1)

**Rules (from `progressive-build-protocol.md`):**  
- **Default: one packet** at a time—single outcome, small review surface.  
- **2 related packets** when one is read-model/doctrine and the other a **thin consumer**, or when two **docs** formalize one protocol—**same** rails, **no** scope creep mid-flight.  
- **3** only **within one lane family** and usually **no migration**; include a **drift checklist** in the PR.  
- **5+** only after **repeated** discipline; split PRs or document **why** bundling reduces risk.  
- **No unrelated bundle sprawl.**  
- **Safe bundle** = shared **source-of-truth** or dependency, **no competing governance** assumptions.

**Lane maturity (L0–L5):** Official scale in PROTO-1 §4:

| Level | Meaning |
|-------|---------|
| **L0** | Not started |
| **L1** | Doctrine / foundation (docs, types) |
| **L2** | Read model / scaffolding (queries, aggregates; no heavy UI / no automation side effects) |
| **L3** | Usable product surface (operator completes a job on one path) |
| **L4** | Integrated with adjacent systems (2+ domains consume the same object/read model) |
| **L5** | Governed automation (explicit policy, audit, rollback—not default for campaign core) |

**Rule:** Do not skip levels without an **explicit** exception and a plan to backfill.

---

## 6. DETERMINISTIC BRAIN DOCTRINE (BRAIN-OPS-1/2/3)

**Order of operations (conceptual—see `deterministic-brain-foundation.md`):**  
1. **Truth** (authoritative field vs mirror vs inferred)  
2. **Policy** (`CAMPAIGN_POLICY_V1`, queue-first, spend posture)  
3. **Governance** (compliance, review flags, AI doc eligibility)  
4. **Ownership** (assignee, seat—**metadata**, not full RBAC)  
5. **Workbench surfacing** (CM bands, JSON, division grid)  
6. **Recommendations** (AI/heuristics—**tagged as advisory**)

**Truth classes** (from `src/lib/campaign-engine/truth.ts` — `TruthClass`):

- **AUTHORITATIVE** — Governed primary field (e.g. `CountyCampaignStats.registrationGoal`).  
- **MIRRORED** — Denormalized copy; must not override primary (e.g. `CountyVoterMetrics.countyGoal` vs registration goal on latest snapshot).  
- **INFERRED** — Rule/heuristic output; must be labeled.  
- **PROVISIONAL** — Draft, pending, unconfirmed.  
- **STALE** — Out of date vs expected sync.  
- **UNAPPROVED_FOR_AI** — e.g. compliance uploads not cleared for RAG/assistant reference.  

**“Reference only” (narrative, not a separate `TruthClass` enum):** Ingested **Wikipedia** county text, handbooks, advisory chunks—**not** SOS official truth; truth snapshot and campaign docs call this out.

**Governance states** (from `truth.ts` — `GovernanceState`):

- **ALLOWED**  
- **ADVISORY_ONLY**  
- **REVIEW_REQUIRED**  
- **COMPLIANCE_REVIEW_REQUIRED**  
- **BLOCKED**  

**What exists in code:**  
- `getTruthSnapshot()` in `src/lib/campaign-engine/truth-snapshot.ts` — **repo-grounded** aggregates, **warningGroups**, `governance.advisoryOnly`, county-goal **mirror** check, election coverage hooks, open-work **counts**, voter-model and **relational (REL-2) advisory** copy when implemented.  
- **Conflict/staleness** — structured `health` fields (missingData, staleData, conflicts, warnings).  
- **CM-2** — `CampaignManagerDashboardBands` on `/admin/workbench` (thin read-only **bands** + collapsible JSON).  

**What is still missing (honest):**  
- **No** full “truth **resolver**” engine in code—`truth.ts` is **types**; many surfaces are **advisory** strings.  
- **No** time-based “staleness” heuristics beyond **field-honest** flags (per BRAIN-OPS philosophy).  
- **Actor-scoped** CM hub (**CM-3**) not shipped.  
- **Discord** is **not** ingested as truth (see §21).  

**AI is never an authority tier** — eligibility is framed in docs + `RecommendationEligibility` in `truth.ts` (types).

---

## 7. CAMPAIGN STRUCTURE / DIVISIONS (LEVEL-3)

Maturity is **evidence-based**; full tables: `system-division-map.md`, `system-maturity-map.md`. **Summarized:**

| Division | Purpose | Maturity (Apr 2026) | Built (high level) | Missing | Likely next packet |
|----------|---------|----------------------|--------------------|---------|---------------------|
| **Campaign Manager / Orchestration** | One hub for “what’s open?” + honest coverage | **Partial** (thin L3) | `/admin/workbench`, CM-2 bands, UWR-2, truth JSON | DB unified index, `Submission` queue, **CM-3** actor scope | **CM-3**, **UWR-3** |
| **Communications** | Plan, send, review, 1:1 and broadcast, social | **Strong** | Comms workbench, threads, broadcast, E-1 queue + E-2A/B | One metadata story end-to-end (COMMS-UNIFY target) | Comms↔E drill-down, glossary |
| **Field / Organizing** | Counties, events, volunteers, **relational** | **Partial–Mid** | County pages, events/festivals/tasks, forms, `FieldUnit`/`FieldAssignment`, **REL-2** `RelationalContact` + admin list | `FieldUnit`↔`County` hard link, **REL-3** volunteer UI, full ROE desk | **REL-3+**, **GEO-2 / FIELD-2** |
| **Data / Research** | Voter file, metrics, **honest** targeting narrative | **Partial** | `VoterRecord`, metrics, import, `targeting.ts`, **VoterSignal**/classification/interaction/vote plan | “Universe” warehouse; **PRECINCT-1** crosswalk | **PRECINCT-1**, honest reporting pass |
| **Finance / Fundraising** | Ledger, budget, future desk | **Early–Partial** | FIN-1/2, BUDGET-2, `fundraising.ts` **types** | FUND-2 **desk** route, donor lifecycle | **FUND-2** |
| **Compliance** | Governance, paperwork gate | **Early–Partial** | COMP-2 uploads, `policy.ts`, types | Rules engine, filing automation | RAG on uploads only with governance |
| **Talent / Training** | Advisory development | **Conceptual + types** | `talent.ts`/`training.ts` | Observation log, LMS, UI | TALENT-2 when scoped |
| **Youth Pipeline** | Programs, routing | **Conceptual** | `youth.ts` types | Program UI, routing | YOUTH+ when scoped |

**Note:** `system-maturity-map.md` may **lag** the latest code on **REL-2**—verify `schema.prisma` and `relational-contact-implementation-foundation.md` if a row still says “no RelationalContact.”

---

## 8. WORKBENCH HIERARCHY AND ROLE STRUCTURE

**Conceptual stack (from CM + division docs):**

- **Campaign Manager Workbench** — `/admin/workbench`: **hub**, truth bands, unified open work, deep links. **Not** every department’s full product.  
- **Division workbenches** — Comms cluster (`…/workbench/comms/…`), social, email queue, field-adjacent routes—see `workbench-build-map.md` **table**.  
- **Functional lead workbenches** — Position workbench `…/workbench/positions`, `…/positions/[positionId]` (read **lens** + inbox heuristics).  
- **County / regional** — Public + admin `…/admin/counties`, county campaign stats—**not** a full “county command” product everywhere.  
- **Personalized volunteer workbench** — **Future**; `personalized-workbench.ts` is **types/placeholder** (WB-CORE-1).  
- **Network / relational layer** — **REL-2:** `RelationalContact` (owner `User`, optional `VoterRecord`), admin `…/relational-contacts`—**not** the public volunteer home.

**Roles ≠ progression (GAME) ≠ org seat**  
- **ROLE-1** — `PositionId` tree in `positions.ts` (code constants).  
- **SEAT-1** — `PositionSeat` = **who occupies** a position key; **metadata**, not full RBAC.  
- **GAME-1** — **Docs** for XP/levels; **no** XP ledger in Prisma.  
- **If a seat is vacant** — `seating.ts` + UI banners: **responsibility rolls up** in narrative; **not** an automatic router in code.

---

## 9. CURRENT LANE STATUS TABLE (L0–L5 + WHAT EXISTS + GAPS + NEXT)

**Legend:** Levels are **judgment calls** from `PROJECT_MASTER_MAP`, `workbench-build-map`, `shared-rails-matrix`, and `schema.prisma`. Where uncertain, marked **(verify)**.

| Lane | Level | What exists | What is missing | Next packet (typical) |
|------|-------|------------|-----------------|------------------------|
| **BRAIN-OPS** | **L2** (→ thin **L3** via CM) | `truth.ts`, `truth-snapshot.ts`, CM bands | Full resolver UI per spec | CM-3, deeper drill-downs |
| **PROTO / Build system** | **L1** | PROTO-1, master expansion rules, this file | Habitual drift sections in every PR | Keep updating artifacts |
| **Campaign Manager workbench** | **L2–L3** | Hub, bands, UWR, JSON | Actor-scoped hub, “for me” | **CM-3** |
| **UWR / Unified open work** | **L2** | Merged list + `openWorkCounts` | County filter, `Submission` in merge | **UWR-3** |
| **DATA / Targeting** | **L2** | `targeting.ts`, data docs, county metrics | Universe model, P/B/T depth honest | **AREA-MODEL-1** (future) |
| **Election ingest** | **L2** | Prisma models, CLI, `election-results.ts` | Not certification; no turnout **math** product | Ingest coverage + parser edge cases |
| **Voter model** | **L2** | Signals, classification, **rule helper read-only** | Auto-classify jobs, canvass UI | Policy for any batch classifier |
| **Relational organizing** | **L2** (post–**REL-2**) | `RelationalContact`, helpers, admin list/detail, touch seam | Volunteer-facing UI, rollups, dedupe | **REL-3+** |
| **Volunteer core (VOL-CORE)** | **L1** | Rich docs, forms→`User` | Unified journey, home | **VOL-CORE-2** |
| **Game / Progression (GAME)** | **L1** | Docs, XP model narrative | Schema, UI, **GAME-2** | **GAME-2** (after value mapping) |
| **Field / Geography** | **L2** | `FieldUnit`/`FieldAssignment`, `field.ts` | County↔field FK/mapping | **FIELD-2** / **GEO-2** |
| **Goals** | **L2** | Authoritative + mirror doc, `county-goals.ts` | Volunteer/field breakdown in schema | VOL-GOAL-1 (if approved) |
| **GOTV** | **L1–L2** | `VoterVotePlan`, planning docs, election ingest | Precinct product, schedulers | **GOTV-1**, **PRECINCT-1** first |
| **Communications (umbrella)** | **L3–L4** | Broad route coverage | Unification story complete | COMMS-UNIFY follow-through |
| **Email workflow (E-1/2)** | **L3** | Queue, interpretation, provenance | E-3 policy hook (optional) | E-3 logging stub when ready |
| **Social / Media** | **L3** | Social workbench, monitoring | Cross-domain metadata | Tighter links to comms |
| **Message creation** | **L2–L3** | Drafts, variants, comms workbench | Single DTO “intent” (target) | COMMS product decisions |
| **Finance / Ledger** | **L2–L3** | FIN-1/2, admin CRUD+confirm | Bank sync, filing | Not in scope of core packets |
| **Budget** | **L2–L3** | BUDGET-2, variance | Commitments table | BUDGET+ if scoped |
| **Fundraising** | **L1** | FUND-1 types | Desk route, donor persistence | **FUND-2** |
| **Compliance** | **L2** | COMP-2, policy | Engine, filing | Counsel-gated |
| **Official ingest** | **L1** | `ingest-sources.ts`, many docs | Live SOS pipelines | **OFFICIAL-INGEST-2** |
| **Candidate briefs** | **L1** | `candidate-county-brief-foundation.md` | Render/email delivery | BRIEF-* packets |
| **Discord** | **L1** | Foundation doc | Webhooks, slash, ingest | **DISCORD-1** |
| **Youth** | **L1** | YOUTH-1, types | Program UI | YOUTH+ |
| **Talent / Training** | **L1** | TALENT-1, types | Observation log, UI | TALENT-2 |

---

## 10. PACKET HISTORY / BUILD AUDIT (CONDENSED)

*Each line: name → **what changed** → **docs / code / schema / UI**—abbreviated. Full detail: `PROJECT_MASTER_MAP` §7, `unified-campaign-engine-foundation.md`.*

- **E-1** — `EmailWorkflowItem` + admin queue, queue-first. **C+S+U**  
- **E-2A** — Deterministic interpretation, `metadataJson` provenance, ENRICHED. **C**  
- **E-2B** — Triage writeback, respects operators, workbench provenance panel. **C+U**  
- **SYS-1** — Public vs admin system maps. **D**  
- **CM-1** — Orchestration + incoming matrix. **D**  
- **FND-1** — Unified engine + rails matrix + `campaign-engine` README. **D+S types**  
- **ROLE-1** — Position tree, job docs—**no** Prisma Position table. **D+code**  
- **TALENT-1** — Talent/training **docs** + types. **D+S**  
- **BRAIN-1 / ALIGN-1** — AI touchpoint map; alignment/override **types** (no persisted override log). **D+S**  
- **ASSIGN-1** — Assignment rail docs. **D**  
- **UWR-1/2** — Merged open work + festival + threads in CM. **C**  
- **WB-CORE-1** — Position workbench routes, read layer. **U**  
- **SEAT-1** — `PositionSeat` + seats UI. **S+U**  
- **SKILL-1 + ASSIGN-2** — Skills + seat-aware read. **D+S+C**  
- **FUND-1** — Fundraising **blueprint** + types, no desk route. **D+S**  
- **COMP-1/2** — Rail types; `ComplianceDocument` + upload UI. **D+S+U**  
- **POLICY-1** — `CAMPAIGN_POLICY_V1`. **C+S**  
- **FIN-1/2, BUDGET-2** — Ledger, confirm, budget plans/lines, variance UI. **S+U**  
- **FIELD-1** — `FieldUnit`/`FieldAssignment`, `field.ts`. **S+C**  
- **YOUTH-1** — Docs + `youth.ts` types. **D+S**  
- **DATA-1, COMMS-UNIFY-1, IDENTITY-1** — Targeting, comms map, identity docs. **D**  
- **DBMAP-1 / LAUNCH-1** — Prisma inventory script; launch read helpers. **D+C**  
- **GEO-1** — County/geo mapping **docs** (no migration). **D**  
- **GOALS-VERIFY-1** — Registration goal SoT + `county-goals.ts`. **D+C**  
- **MASTER-MAP-1** — `PROJECT_MASTER_MAP.md` continuity. **D**  
- **REL-1** — ROE **docs** (no Prisma in REL-1). **D**  
- **GAME-1, VOL-CORE-1** — Progression + volunteer system **docs**. **D**  
- **BLUEPRINT-LOCK-1** — Division/maturity/integration maps. **D**  
- **DATA-2/3, OFFICIAL-INGEST-1, INGEST-OPS-1, INGEST-OPS-2** — Targeting + official ingest **strategies** (various); **INGEST-OPS-2** = **election+brain** **backlog** + `ingest:inventory` + [`INGEST_STATUS_AND_BACKLOG.md`](./INGEST_STATUS_AND_BACKLOG.md). **D (+ some types)**  
- **BRAIN-OPS-1/2/3** — `truth.ts`, `truth-snapshot`, CM-2 consumer. **C+U**  
- **CM-2 / UWR-2** — Dashboard bands + expanded open work. **C+U**  
- **DATA-4 + ELECTION-INGEST-1** — Election tabulation Prisma + CLI + `election-results.ts`. **S+C**  
- **DATA-5** — (Sketch / area vote potential in modeling plan—**not** a full shipped product; verify `modeling-database-implementation-plan.md`.) **D**  
- **VOTER-MODEL-1 + INTERACTION-1** — Voter signal/classification/interaction/vote plan + admin read page + helpers. **S+C+U**  
- **REL-2** — `RelationalContact`, optional `relationalContactId` on interaction/signal, helpers, admin `…/relational-contacts`, truth advisory. **S+C+U**  
- **Candidate county brief / County Wikipedia** — Brief foundation + `npm run ingest:county-wikipedia` reference ingest (RAG path governance separate). **D+scripts**  

---

## 11. CURRENT REAL CAPABILITIES IN CODE (DISTINCT FROM DOCS)

**Authoritative for “what runs”:** `src/app/admin/**`, `prisma/schema.prisma`, `src/lib/**`.

**Work / orchestration**  
- Email workflow queue `…/workbench/email-queue` + item detail: create, **Run interpretation (E-2A)**, provenance (E-2B).  
- `getOpenWorkForCampaignManager` and related (UWR) + `UnifiedOpenWorkSection` on main workbench.  
- CM-2: `CampaignManagerDashboardBands` + `getTruthSnapshot` JSON block.  
- Position workbenches: `…/workbench/positions`, `[positionId]`; seat page `…/workbench/seats`.  

**Truth / policy / finance**  
- `truth-snapshot.ts` (BRAIN-OPS-2/3).  
- Compliance: `…/compliance-documents` upload.  
- Financial: `…/financial-transactions` (create, confirm).  
- Budget: `…/budgets`, `…/budgets/[id]` variance.  

**Data / elections / voters**  
- `npm run ingest:election-results` + Prisma election result tables + `election-results.ts`.  
- Voter: import, `VoterRecord`, metrics pipeline; **voter model page** `…/admin/voters/[id]/model`.  
- **Relational (REL-2):** `…/admin/relational-contacts`, `[id]`, `relational-contacts.ts`, `relational-matching.ts`—if migration **applied** in your DB.  

**Geography / county**  
- `county-goals.ts` read helpers.  
- County Wikipedia: ingest scripts + `SearchChunk` (operational RAG = environment-dependent).  
- `ingest-sources.ts` — scaffolding/types for official source strategy.  
- `launch.ts` — read-only list/count helpers.  
- `field.ts` — field unit/assignment **reads**.  

**Comms / social (large surface)**  
- Comms workbench routes (plans, drafts, sends, media, broadcasts).  
- Social workbench, conversation monitoring.  

**If something is not in `workbench-build-map` + grep, assume it is not shipped.**

**Model count:** See **`database-table-inventory.md`** (currently **~116** models—verify; `PROJECT_MASTER_MAP` §9 may show an older number until refreshed).

---

## 12. CURRENT SOURCE-OF-TRUTH NOTES (EXACT POSTURE)

- **`CountyCampaignStats.registrationGoal`** = **authoritative** county registration **goal** (admin path).  
- **`CountyVoterMetrics.countyGoal`** = **per-snapshot mirror** (recompute); compare via GOALS-VERIFY / truth snapshot.  
- **Raw election JSON on disk** = **provisional** until ingested.  
- **`ElectionResultSource` + related rows** = in-app **tabulation storage**; **not** SOS certification.  
- **`VoterModelClassification`** = **inferred / provisional** unless human-confirmed; never “vote in the bank.”  
- **`VoterInteraction` with explicit `supportLevel`** = stronger **human-recorded** signal than nothing—still not a **guaranteed** vote.  
- **`FinancialTransaction` CONFIRMED** = ledger **actuals** for BUDGET-2 spend rollups; **DRAFT** = not operational truth.  
- **`ComplianceDocument.approvedForAiReference`** = gate for **treating** upload as safe AI knowledge (RAG wiring is separate).  
- **Wikipedia / ingested reference** = **reference only**, CC BY-SA, not official.  
- **Discord** = coordination; **not** system of record (see §21).  
- **AI recommendations** = **advisory** unless policy+product says otherwise.  

---

## 13. DATA / TARGETING / “PATH TO 45” (45%)

**45% and path planning** are **framing** in DATA-2 docs (`path-to-45-foundation.md` etc.): a **planning** lens, not a claim that the repo computes a magic **win number**. The system is supposed to **combine** (when present): election **tabulation** ingest, **voter** file rows, **signals** and **interactions** (human-entered), county **demographics** / metrics, **registration** trends, and **field** capacity—**without invented math** in product UI.

**Built:** Voter file + metrics, election ingest **schema** + CLI, **VoterSignal** + provisional classification + interaction log, `targeting.ts` inventory, county pages with honest **limits** (precinct = string).  
**Missing:** **PRECINCT-1** crosswalk; “universe” warehouse as a first-class product; **AREA-MODEL-1** / community effectiveness as **governed** read models. Do **not** present modeled estimates as **SOS** facts.

---

## 14. VOTER RELATIONSHIP / INFLUENCE ENGINE

**In schema (VOTER-MODEL-1 + INTERACTION-1 + REL-2):**  
- **Signals** — `VoterSignal` (provenance row).  
- **Classifications** — `VoterModelClassification` (current tier; override audit fields).  
- **Interactions** — `VoterInteraction` (optional support, registration check flags, **optional `relationalContactId`**).  
- **Vote plan** — `VoterVotePlan` seed.  
- **Relational** — `RelationalContact` (owner, optional `VoterRecord`, Power-of-5 fields).  

**Aspirational conversation loop (from doctrine docs):** look up / encourage **registration** check (official **links**, not a fake SOS), **log interaction** when real work happens, **assess** support when humans choose to record it, follow-up, invite to **Power of 5** / **volunteer** / **events**—**vote plan** as staff/product allows.

**Emphasis**  
- **Influence, not fake votes** — counts in snapshots are **operational** or **modeled** with class labels, not ballot box.  
- **No “committed voter” without a defensible record** of what was actually **entered** in product (interaction/signal/relational touch semantics—**policy**, not a hidden algorithm).  
- **Confidence + provenance** on modeled rows (`ModelConfidence`, `metadataJson`).

---

## 15. VOLUNTEER / RELATIONAL / GAME SYSTEM

- **VOL-CORE-1** — **Philosophy** and role/onboarding **docs**; **binds** REL/GAME/ROLE/FIELD in narrative. **Mostly** docs.  
- **Power of 5** — `power-of-5-system-integration.md`; **REL-2** stores `isCoreFive` + slot—**not** a volunteer product yet.  
- **PODs** — `pod-system-foundation.md` (doctrine).  
- **GAME-1** — **Docs**; **XP ledger** and volunteer progression **UI** not in Prisma. **GAME-2** would add real progression **schema** and governance.  
- **5,000 volunteers by August (or similar scale targets):** *Not verified in a single locked doc line in this audit—treat as **campaign planning narrative** and **verify** against current strategy docs if you cite it in product copy.*  
- **Volunteer workbench** — **Not** a complete volunteer home; public forms and admin paths exist; **REL-3+ / VOL-CORE-2** are the usual names for a thicker shell.

---

## 16. FIELD / GOTV VISION (DOCTRINE + GAPS)

**Vision (from GOTV + field docs):** statewide events; multi-phase **push** (2-week, 96-hour, 48-hour, same-day); **precinct** coverage where possible; sign holders; **vote plan** lifecycle.  

**In code today:** `VoterVotePlan`, interactions, field units, events/tasks/festivals, election ingest for **context**—**not** a full GOTV **runner** or precinct operations product.

**Blockers / next:** **PRECINCT-1** (normalize / crosswalk `VoterRecord.precinct` vs ingest keys); **GOTV-1** read model + more docs; **FIELD-2** for geography cohesion.

---

## 17. COMMUNICATIONS UMBRELLA (STRONG LANE)

**Covers** internal/operator comms and external: earned media workflows, **social** workbench, **email**, SMS threads (Tier-1 style), **Tier-2** broadcast, **message creation** (drafts, variants) under workbench.  

**Maturity:** **Among the strongest** in the repo (see `workbench-build-map` route table, `system-maturity-map`).  

**Posture:** **Queue-first** for sensitive; **E-1/E-2** separate from **comms send execution** on `CommunicationSend`—**do not conflate** without explicit product design (`communications-unification-foundation.md`).

**Future:** Tighter **targeting** and **field** integration by **metadata** and deep links, not a second send engine.

---

## 18. FINANCE / FUNDRAISING / BUDGET

- **Ledger (FIN-1/2):** `FinancialTransaction`, **DRAFT** vs **CONFIRMED**; contribution type; admin paths.  
- **Budget (BUDGET-2):** `BudgetPlan` / `BudgetLine` vs **CONFIRMED** **spend** actuals; contributions excluded from spend in rollup pattern.  
- **Fundraising desk (FUND-1):** **Types + docs**; **no** full desk route; donor modeling **future**; OpenFEC / state donor **ingest** **future**; **call time** and contactability = **FUND-1** narrative.  
- **Every cost-bearing wire** should eventually map to **budget** wire (doctrine in budget docs)—**not** all wired in operator UI for every row type.

---

## 19. COMPLIANCE / OFFICIAL INGEST

- **Compliance** = **governance rail** (COMP-1) + **uploads** (COMP-2) + `policy.ts`—**not** a lawyer bot.  
- **Official SOS / ethics** = mapped in **ingest** and resource docs; **`ingest-sources.ts`** = scaffolding.  
- **No legal overclaiming** in UI or agent—**disclaimers** in policy.  
- **Paperwork simplification** = vision in compliance docs, not full product.  
- **Federal/state coordination** = doc posture for counsel review on cross-jurisdiction work.

---

## 20. CANDIDATE BRIEF / COUNTY KNOWLEDGE

- **Wikipedia** county ingest: **advisory** local context, **RAG**-able with governance; not authoritative (`county-wikipedia-reference-ingest.md` etc.).  
- **Candidate county brief** (`candidate-county-brief-foundation.md`): **T−1** style summary (metrics + **labeled** youth/HS **estimates** with guardrails) + unabridged section—**not** a shipped email/workbench product in full.  
- **Renderer / CM delivery** = future **BRIEF-*** packet scope.

---

## 21. DISCORD INTEGRATION

- **Volunteers** may use **Discord** for coordination.  
- In **foundations** (`discord-integration-foundation.md`), Discord is **not** a source of truth: **coordination/delivery** layer.  
- **First** viable integration: **outbound** alerts / webhooks.  
- **Later:** slash commands, guarded **ingest** to queues—**all** with review posture.  
- **Never** treat Discord as **authoritative** for goals, voter ID, or legal status.

---

## 22. MASTER BLUEPRINT BUILD RULES (ALIGNED WITH MASTER-BLUEPRINT-EXPANSION-RULES)

- Every **packet** updates **`PROJECT_MASTER_MAP.md`** and usually **`unified-campaign-engine-foundation.md`**, **`shared-rails-matrix.md`**, **`workbench-build-map.md`** as touched.  
- State **lane level** and **unlocks**; **drift check**; protect **deterministic** truth.  
- **Cursor** must **inspect** before building; **extend** `open-work`, `seating`, `truth-snapshot`, `budget-queries` over duplicating.  
- **This file (`THREAD_HANDOFF_MASTER_MAP.md`)** should be **refreshed** on major **lane** or **continuity** changes (THREAD-HANDOFF-1 is the packet name for this articulation).  

---

## 23. GUARDRAILS / DO-NOT-BUILD LIST

- **No fake math** or **black-box** campaign “scores” in product without packet + SoT.  
- **No auto-send** from email workflow or AI surfaces without **explicit** future packet + policy.  
- **No legal certification** or SOS replacement claims from **AI** or **uploads**.  
- **No hidden reassignment** of ownership / seats / `assignedToUserId`.  
- **No volunteer shaming** or manipulative “rage” funnels.  
- **No unsupported** “this voter is with us” **without** an honest data path (interaction/signal/relational—**human-governed**).  
- **No Discord** as **truth**; **no Wikipedia** as **official** roll data.  
- **No modeled estimate** in **UI** as **indistinguishable** from measured fact.  
- **No automation** at **L5**-style “machine acts” on core paths **before** L3/L4 **foundations** and **policy** exist.  
- **No duplicate** work queues—**grep** first.  

---

## 24. RECOMMENDED NEXT SEQUENCE (ORDER VARIES BY CAMPAIGN PRIORITY)

**Default stack from `PROJECT_MASTER_MAP` + matrix (Apr 2026):**

1. **PRECINCT-1** — crosswalk / normalization (enables serious GOTV + precinct **honesty**).  
2. **GOTV-1** — phased **read** model + **docs** (no scheduler in first slice).  
3. **UWR-3** — county filter; governed **Submission** when status/`href` exist.  
4. **CM-3** — actor-scoped hub / drill-downs.  
5. **GEO-2 or FIELD-2** — `FieldUnit`↔`County` strategy.  
6. **GOALS-*** / **VOL-GOAL-1** — county → volunteer decomposition (**if** approved.  
7. **REL-3+** — **after REL-2** in DB: volunteer relational UI, rollups, dedupe.  
8. **FUND-2** — desk + persistence (**PII** review).  
9. **ALIGN-2 / OVR-1** — override log on a real touchpoint.  

**Also on deck from doctrine:** **AREA-MODEL-1** (read models for geography layers), **GAME-2** (XP with REL/FIELD value mapping), **VOL-CORE-2** (volunteer home shell), **DISCORD-1**, **OFFICIAL-INGEST-2**, **E-3** logging stub.  

**Safe 2-packet bundles (typical):** (BRAIN-OPS extension + workbench **thin** consumer) **or** (PROTO rules + one map update) **or** (two **docs** in one lane) **or** (REL-2 was example: **schema+helpers+admin** in one **migration-gated** drop—treat as **one lane family**). **Unsafe:** comms+finance+field schema in one go without SoT.

**Note:** If **REL-2** migration is **not applied** in an environment, **RelationalContact** “capabilities” are **dormant** there.

---

## 25. NEW THREAD QUICKSTART CHECKLIST (DO THIS FIRST)

1. **Read** `docs/THREAD_HANDOFF_MASTER_MAP.md` (this file, including **§0.10**).  
2. **Read** `docs/PROJECT_MASTER_MAP.md` (continuity + packet list + **Future-state** under **Blueprint** + §8 capabilities).  
3. **Read** `docs/DIVISION_MASTER_REGISTRY.md` — **summary table** + **Division forward path** (BLUEPRINT-EXP-1).  
4. **Read** `docs/progressive-build-protocol.md` (PROTO-1) + `docs/master-blueprint-expansion-rules.md`.  
5. **Read** `docs/deterministic-brain-foundation.md` + `docs/truth-governance-ownership-map.md`.  
6. **Read** `docs/campaign-manager-workbench-spec.md` (CM bar spec) at least skim.  
7. **Read** `docs/modeling-database-implementation-plan.md` (data sketch).  
8. **Inspect** `prisma/schema.prisma` (source of model truth).  
9. **Inspect** `src/lib/campaign-engine/README.md` and list **`src/lib/campaign-engine/*.ts`**.  
10. **Skim** `docs/workbench-build-map.md` (routes that **exist**).  
11. **For email workflow:** `docs/email-workflow-intelligence-AI-HANDOFF.md` (E-1/E-2 invariants).  
12. **Ask the user** for the **latest Cursor result** or active branch/PR before writing the **next** packet.  
13. **Grep** before new tables: `database-table-inventory.md` + `schema.prisma`.  

**Philosophy/brand (voice):** `docs/philosophy/README.md`, `docs/narrative/README.md`, `docs/brand/README.md`

---

## APPENDIX — COMPACT YAML-LIKE SNAPSHOT (MACHINE-READABLE)

*Informal structure for quick parse by assistants—**not** a build config file.*

```yaml
current_lanes:
  - lane: BRAIN-OPS
    level: L2
    status: "truth.ts + getTruthSnapshot + CM bands; no full resolver"
    next_packet: "CM-3; deeper truth drilldowns (read-only first)"
  - lane: UWR
    level: L2
    status: "merged open work; festival+threads+email+task in CM"
    next_packet: "UWR-3; county filter; governed Submission if status exists"
  - lane: DATA_TARGETING
    level: L2
    status: "voter file, metrics, targeting.ts, signals/classification/interactions"
    next_packet: "PRECINCT-1; honest universe reporting"
  - lane: ELECTION_INGEST
    level: L2
    status: "Prisma tabulation + CLI + election-results.ts"
    next_packet: "coverage %; parser variants; not certification"
  - lane: VOTER_MODEL
    level: L2
    status: "schema + read helpers; classifyVoterFromSignals read-only; admin model page"
    next_packet: "policy for any auto-classify job (if ever)"
  - lane: RELATIONAL_ORG
    level: L2
    status: "RelationalContact + admin relational-contacts + matching helpers (after migration apply)"
    next_packet: "REL-3+ volunteer UI; rollups; dedupe"
  - lane: VOLUNTEER_CORE
    level: L1
    status: "docs+forms+VolunteerProfile"
    next_packet: "VOL-CORE-2 shell"
  - lane: GAME
    level: L1
    status: "docs only"
    next_packet: "GAME-2 (schema + value mapping)"
  - lane: FIELD_GEO
    level: L2
    status: "FieldUnit/Assignment; field.ts; counties"
    next_packet: "FIELD-2/GEO-2 County↔FieldUnit"
  - lane: GOTV
    level: L1_L2
    status: "VoterVotePlan; planning docs; not runner"
    next_packet: "GOTV-1 read model; PRECINCT-1 prerequisite for ops depth"
  - lane: COMMS
    level: L3_L4
    status: "broad workbench+threads+broadcast+social"
    next_packet: "COMMS-UNIFY metadata story"
  - lane: EMAIL_WORKFLOW
    level: L3
    status: "E-1 queue + E-2A/B deterministic interpretation"
    next_packet: "E-3 policy logging stub; deep links to comms failures"
  - lane: FINANCE_BUDGET
    level: L2_L3
    status: "FIN-1/2; BUDGET-2"
    next_packet: "FUND-2; commitments (if scoped)"
  - lane: COMPLIANCE
    level: L2
    status: "uploads + types"
    next_packet: "RAG on uploads when governance allows"
  - lane: OFFICIAL_INGEST
    level: L1
    status: "ingest-sources + docs"
    next_packet: "OFFICIAL-INGEST-2"
  - lane: DISCORD
    level: L1
    status: "docs"
    next_packet: "DISCORD-1 webhooks"
  - lane: YOUTH
    level: L1
    status: "types+docs"
    next_packet: "first real YOUTH program UI when approved"
  - lane: TALENT
    level: L1
    status: "types+docs"
    next_packet: "TALENT-2 observation log"

key_truth_sources:
  - "CountyCampaignStats.registrationGoal (authoritative goal)"
  - "CountyVoterMetrics.countyGoal (mirror per snapshot)"
  - "Ingested ElectionResult* rows (in-app tabulation, not certification)"
  - "VoterModelClassification = provisional unless human confirmed"
  - "FinancialTransaction CONFIRMED = budget actuals (spend); DRAFT = not truth"
  - "ComplianceDocument.approvedForAiReference = AI knowledge gate (RAG index separate)"

active_guardrails:
  - "queue_first_email_workflow"
  - "no_blind_auto_send"
  - "no_ai_as_truth_tier"
  - "provenance_in_metadataJson"
  - "comms_triage_separate_from_comms_send"
  - "grep_before_new_queues"
  - "wikipedia_and_discord_not_authoritative"
  - "relational_counts_not_votes (REL-2 truth advisory)"

next_recommended_packets:
  - "PRECINCT-1"
  - "GOTV-1"
  - "UWR-3"
  - "CM-3"
  - "REL-3+ (if REL-2 migration applied in target env)"
  - "FUND-2"
  - "DISCORD-1 (after webhook policy)"
  - "OFFICIAL-INGEST-2 (when source scope defined)"
  - "GAME-2 (after XP value mapping to REL/FIELD reality)"
  - "VOL-CORE-2 (volunteer home; narrow scope first)"
```

---

*THREAD-HANDOFF-1 — `docs/THREAD_HANDOFF_MASTER_MAP.md`. **Single-file** transition map for a **new** ChatGPT / Cursor / human session. **Last updated: 2026-04-23** — **REL-2** in schema + docs; `system-maturity-map` may need a **manual** refresh for **REL-2** row. **Re-verify** model counts in `database-table-inventory.md` and `prisma` after every major migration.*
