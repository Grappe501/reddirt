# Step 6 — Engineering roadmap audit and Cursor build handoff

**Workspace:** `H:\SOSWebsite`  
**Lane:** `RedDirt/` only (this document)  
**Date:** 2026-04-27  
**Purpose:** Move from **manual completion** (through **Pass 5L**) to **sequenced engineering**. This file is a **roadmap and handoff** — it is **not** a commitment that every item is already implemented, and it **does not** raise **0–6** product grades (see `campaign-system-manual/SYSTEM_READINESS_REPORT.md`).

**Related protocol:** `CURSOR_CODEX_COORDINATION_PROTOCOL.md` (Codex = technical lead / review; Cursor = foreground implementer; Steve = decisions). **New-thread stack:** `RedDirt/docs/NEW_THREAD_START_HERE.md`, `RedDirt/README.md`.

---

## 1. Current status (ground truth for engineering)

| Topic | Status |
|--------|--------|
| **Manual** | **Complete through Pass 5L** (`ANYONE_CAN_ONBOARD_...`, `PHONE_BANK_...`, `CAMPAIGN_TOOL_STACK_...`, `THEORY_STACK_...`, `LEARNING_CULTURE_...`, `MANUAL_TO_DEVELOPMENT_...`, `MANUAL_PASS_5L_...` in `campaign-system-manual/`). |
| **First engineering priority** | **5H Ask Kelly first-release** per `campaign-system-manual/ASK_KELLY_LAUNCH_PRIORITY_AND_FIRST_RELEASE_SCOPE.md` — **not** reordered by later passes (5I–5L are parallel or post-5H in doctrine). |
| **0–6 readiness** | **Unchanged** by documentation. Maturity in `SYSTEM_READINESS_REPORT.md` is the technical baseline until **code + owner sign-off** prove otherwise. |
| **Operational spine** | **`POST /api/forms` → `Submission` → `WorkflowIntake`** (when DB configured) and **`CampaignTask`** + Workbench open-work merge — see `campaign-system-manual/workflows/TASK_QUEUE_AND_APPROVALS.md` and `SYSTEM_CROSS_WIRING_REPORT.md`. |
| **Governance** | **`playbooks/APPROVAL_AUTHORITY_MATRIX.md`**, **`playbooks/ESCALATION_PATHS.md`**, **`MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md`** (§1–49). Unresolved **§** items **block** policy-complete launches, not necessarily every code spike. |
| **Build gate (repo)** | From `RedDirt/`: `npm run check` (lint + `tsc` + `next build`) before substantive merges — `RedDirt/README.md`. |

**Existing code touchpoints (verified paths, not feature-complete for 5H):**

- **Public forms:** `src/app/api/forms/route.ts` → `src/lib/forms/handlers.ts` (`Submission`, `WorkflowIntake` creation, optional classify).
- **Open work (read model):** `src/lib/campaign-engine/open-work.ts` → admin Workbench (`/admin/workbench`, `/admin/tasks`, comms plan entry with `intakeId` / `taskId` per `TASK_QUEUE_AND_APPROVALS.md`).
- **“Ask Kelly” / guide UI (public):** `src/components/campaign-guide/AskKellyLayout.tsx` → `CampaignGuideDock` (journeys) in `(site)` layout — **not** the full 5H packet/suggestion/approval product by itself.
- **Assistant API (RAG-style):** `src/app/api/assistant/route.ts` — OpenAI + search chunks; must stay **governed** for any public or beta “guided help” (rate limits, no VFR, no “AI” product naming in public copy per manual).

**Prisma anchors:** `Submission`, `WorkflowIntake` (`prisma/schema.prisma`), `CampaignTask` — extend only when design requires; **migrations** are a **separate, explicit** step (not part of this roadmap document’s creation).

---

## 2. Recommended build sequence (nine phases)

**Order** matches campaign manual sequencing unless code discovery forces a **smaller** safe slice first. **Phase 1** is the only phase with a **Cursor build script** at the end of this document.

| Phase | Theme |
|-------|--------|
| **1** | Ask Kelly first-release **foundation** (public/beta surface, suggestion intake, packet queue behavior, fallbacks, naming) |
| **2** | Candidate **website review wizard** (page-by-page, packets, impact) |
| **3** | **Beta** volunteer onboarding + **suggestion box** + routing |
| **4** | **Workbench** morning brief / daily approval / **task** forecast (5I/5J) |
| **5** | **Claim landing** + **escalation** timers (5K advance tasks) |
| **6** | **Anyone-can-onboard** flow (5L) |
| **7** | **Phone/text banking** workflow (5L + **MI §**49) |
| **8** | **Retention** dashboard (aggregates, no shame) |
| **9** | Candidate **strategy refinement** “console” (sliders, **hard walls**) |

---

## 3. Phase details (template per phase)

For **each** phase below: **goal**, **user story**, **manual sources**, **code to inspect**, **likely new work**, **data/API/UI**, **RACI**, **safety**, **tests**, **acceptance**, **risks**, **ready vs needs Steve/Kelly decision**.

### Phase 1 — Ask Kelly first-release foundation

- **Goal:** A **production-grade** public/beta “Ask Kelly” / **Campaign Companion** experience: guided help, **structured** feedback, **admin triage** path, **plain** language, **no** internal jargon or **0–6** in public faces, **no** public “[product]” naming per `SYSTEM_READINESS_REPORT.md` / `ASK_KELLY_LAUNCH_...` / `CAMPAIGN_COMPANION_PUBLIC_SIMPLE_VIEW_RULES.md`.
- **User story:** As a voter or beta tester, I can open **Ask Kelly**, ask questions or file **suggestions** with required fields, and see **calm** copy when content is missing — without seeing stack traces, internal IDs, or voter/donor rows. As staff, I can see new items in a **queue** tied to `WorkflowIntake` or a governed parallel.
- **Manual sources:** `ASK_KELLY_LAUNCH_PRIORITY_AND_FIRST_RELEASE_SCOPE.md`, `ASK_KELLY_PRODUCTION_GRADE_AGENT_FOUNDATION_CHECKLIST.md`, `ASK_KELLY_SUGGESTION_BOX_AND_FEEDBACK_INTAKE_RULES.md`, `ASK_KELLY_BETA_FEEDBACK_TO_APPROVAL_FEED_WORKFLOW.md`, `CANDIDATE_TO_ADMIN_UPDATE_PACKET_SYSTEM.md` (queue shapes), `CAMPAIGN_COMPANION_PUBLIC_SIMPLE_VIEW_RULES.md`, `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` **§**45.
- **Inspect:** `src/app/(site)/layout.tsx` (where `AskKellyLayout` is mounted), `src/components/campaign-guide/CampaignGuideDock.tsx`, `src/app/api/assistant/route.ts`, `src/lib/assistant/*`, `src/lib/openai/search.ts`, `src/app/api/forms/route.ts`, `src/lib/forms/{handlers.ts,schemas.ts}`, `prisma` `Submission` / `WorkflowIntake`, `src/app/admin/(board)/workbench/*`, `src/app/admin/(board)/review-queue/page.tsx` (if used for triage).
- **Likely new / changed files:** New **route(s)** for suggestion submission **or** extend `formSubmissionSchema` with a **dedicated** `formType` for suggestions; admin list/filter for **source** = Ask Kelly; optional **server actions** for status transitions; public components for **modal/drawer** and **accessibility** (5H checklist). Prefer **small** diffs: reuse `WorkflowIntake.metadata` for categories until a dedicated model is approved.
- **Data model needs:** **May** only need `Submission` + `WorkflowIntake` with **strict** `metadata` contract (formType, category, pathname, **no** PII in public logs). **Dedicated** `SuggestionFeedback` model = **decision** (Steve + MCE) if long-term query/reporting needs exceed JSON.
- **API needs:** `POST` path with validation, rate limit, idempotency consideration; **no** VFR in response; **GET** for staff lists **auth-gated** (`ADMIN_SECRET` / future auth).
- **UI needs:** Public **simple** view; **beta** and **candidate** **modes** may be **query / cookie / magic-link** — align with 5E/5F role separation in manuals.
- **Permissions / RACI:** Triage **owner** per **MI §**45 and `APPROVAL_AUTHORITY_MATRIX` — MCE+ for outbound comms, not auto-publish.
- **Safety / privacy:** No PII in **unauth** **RAG** context for public; redact; **DPA**-aligned logging — `ASK_KELLY_PRODUCTION_...` §3.
- **Test plan:** `npm run check`; **manual** smoke: form submit → DB row → workbench link; no internal strings on public; rate limit 429; DB-off 503 for forms.
- **Acceptance criteria:** Checklist in `ASK_KELLY_PRODUCTION_GRADE_AGENT_FOUNDATION_CHECKLIST.md` **satisfied** for a **defined** **launch** **level** (e.g. internal demo vs beta); success criteria in `ASK_KELLY_LAUNCH_...` §6.
- **Risks / blockers:** OpenAI key off in prod, **or** RAG too broad; **mitigation:** feature flag, static fallbacks, human escalation. **Owner** for triage unset → **ops** **risk**.
- **Build now?** **Yes** for **scaffolding and wiring** to existing intake — **with** MCE+ naming/triage **owner** (can be “interim” in writing). **No** for **“full production launch”** until **§**45 items resolved.

### Phase 2 — Candidate website review wizard

- **Goal:** **Page-by-page** review, **progress** checklist, **candidate edits** → **admin** **packets** with **impact** triage; **no** auto-publish on high-impact — `CANDIDATE_WEBSITE_REVIEW_WIZARD_AND_APPROVAL_WORKFLOW.md`, `WEBSITE_EDIT_IMPACT_ANALYSIS_AND_DOWNSTREAM_DEPENDENCY_RULES.md` (5G/5H cross-links).
- **User story:** As candidate, I see **one** page at a time, can **propose** edits, and submit a **packet**; I never bypass **LQA** on A-class lines.
- **Manual sources:** 5G files above, `CANDIDATE_EDITING_RIGHTS_AND_NO_APPROVAL_EXCEPTIONS_POLICY.md`, `CANDIDATE_TO_ADMIN_...`, `CANDIDATE_WEBSITE_EDITING_ONBOARDING_EMAIL.md`.
- **Inspect:** `src/app/admin/(board)/pages/*`, public `(site)` content routes, any **static** page keys in `src/content` or similar; `Submission` / `WorkflowIntake` for packet-shaped payloads.
- **Likely new work:** Wizard routes under **auth**; packet JSON schema; **link** to **Workbench** **review** queue; impact **tags** (high/medium/low) possibly in `metadata` first.
- **Data model / API / UI / RACI / safety / tests / risks:** Same **pattern** as Phase 1 but **higher** **sensitivity** — **LQA+** **MCE+** for ship-facing lines. **Migrations** may be required if packets need **first-class** tables — plan in a **dedicated** ticket with counsel/MCE.
- **Build now?** **Partial** — UX + **packet** **shape** can start; **go-live** needs **RACI** and **editing** **rights** **policy** **locked**.

### Phase 3 — Beta volunteer onboarding + suggestion box (depth)

- **Goal:** **Invite**, **role** **explainer**, **feedback** **categories**, **specificity** **scoring** **(design)**, **statuses**, routing to approvers — `BETA_VOLUNTEER_*` (manuals), `ASK_KELLY_SUGGESTION_...`, `ASK_KELLY_BETA_FEEDBACK_...`, `SEGMENTED_MESSAGE_...` §**22** (not GOTV from chat).
- **Inspect:** `src/app/onboarding/*`, forms handlers for volunteer types, any **beta** flags in env.
- **Build now?** **Yes** in **parallel** to Phase 1 **after** **core** **intake** path exists; **comms** **copy** for invites needs **MCE+owner** (MI §**45**).

### Phase 4 — Workbench morning brief / daily approval / task forecast (5I/5J)

- **Goal:** **Cards** and **brief** **sections** for **today** / **week** / **month**; “**approve the day**” **(internal)**; **forecast** **horizon**; **human**-**follow**-**up** lines in every brief.
- **Manual sources:** `WORKBENCH_MORNING_BRIEF_...`, `DASHBOARD_OBJECTIVE_...`, `WORKBENCH_DAILY_BRIEF_TEMPLATE_LIBRARY.md`, `DAILY_APPROVAL_...`, `TASK_FLOW_...`, `HUMAN_INTERACTION_...`. **5H** not **reordered.**
- **Inspect:** `src/app/admin/(board)/page.tsx` (dashboard home), workbench, `open-work.ts`, `CampaignTask` queries, any **KPI** components.
- **Data:** Aggregates only in general brief; **no** **voter** **row** in **line** item — manual and **3H** rules.
- **Build now?** **Staff**-**facing** can progress **in parallel** with Phase 1 **if** capacity; not a **substitute** for 5H public path.

### Phase 5 — Claim landing + escalation timers (5K)

- **Goal:** **Advance** **asks**, **claim** **URL** or **task** **view**, **decline** **/ ** **adjust** **/ ** **help**; **escalation** **before** **crisis**; **no** **shame** **nudges** — `ADVANCE_TASK_BUY_IN_AND_ESCALATION_LADDER_SYSTEM.md`, `playbooks/ESCALATION_PATHS.md`, **MI §**48.
- **Inspect:** `CampaignTask` UI, assignment fields, `WorkflowAction` if used, email/notification patterns (if any).
- **Data:** May use **dueAt**, **status**, **metadata** on tasks; **SLA** fields **not** in schema yet — `TASK_QUEUE_...` “missing” **SLA** line.
- **Build now?** **Partial** — **UI** and **state** on **existing** `CampaignTask` first; **timer** **policy** = **MI** **§**48.

### Phase 6 — Anyone-can-onboard flow (5L)

- **Goal:** **Invite** / **welcome** / **help** **onboard** **/ ** **place** in **P5** (not **sensitive** **access**) — `ANYONE_CAN_ONBOARD_...`, **MI §**49 (placement, **P20** **frame**).
- **Inspect:** `src/app/onboarding/power-of-5` (per cross-wiring), forms, P5 **narrative** **components** in admin, `VolunteerProfile` paths in `handlers.ts`.
- **Build now?** **Needs** **MI §**49 **(who** **places** **whom,** **P20** **allowed** **or** **holding** **only)**.

### Phase 7 — Phone/text banking workflow (5L)

- **Goal:** **Audience** + **script** **approval**; **training** **gate**; **result** **codes**; **no** **unmanaged** **bulk** **SMS** — `PHONE_BANK_...`, `SEGMENTED_MESSAGE_...`, **MI §**49.
- **Inspect:** Comms workbench, broadcast paths, `ContactPreference`, any SMS integrations (env/docs).
- **Build now?** **No** **end**-**to**-**end** **without** **vendor** + **opt**-**in** **/ ** **compliance** (MI §**49**). **Design** and **Task** + **LQA** **SOP** can proceed in parallel.

### Phase 8 — Retention dashboard

- **Goal:** **Aggregate** **engagement** **signals**; **health** **statuses** (internal); **thanks** **triggers** — `VOLUNTEER_RETENTION_...`, `THANK_YOU_...`, **no** **peer** **shame** **rankings** (5C). **5I** **brief** ties.
- **Inspect:** `VolunteerProfile`, tasks, any **activity** **tables**; admin dashboards.
- **Build now?** **KPI** **targets** = **MI** **§**48/owner — **no** **invented** **goals** in code comments.

### Phase 9 — Candidate strategy refinement console (5K/4B)

- **Goal:** **Engine** **menu** **(review)**, **sliders** as **B**-**touched** **(not** $ **/ ** **GOTV** / **VFR** **/ ** **legal) — `CANDIDATE_STRATEGY_REFINEMENT_...`, `CAMPAIGN_ENGINE_...`, `INTERACTIVE_STRATEGY_...`, **4B** **/ ** `APPROVAL_AUTHORITY_MATRIX`.
- **Inspect:** `src/lib/campaign-engine/budget*`, **sim** **/ ** **message**-**engine** **(internal)**; any **4B** **UI** in admin.
- **Build now?** **No** **$**-**affecting** **or** **GOTV** **claims** from **UI** **alone** — **MCE+** + **RACI**; **4B** “Lock” = **not** in chat per manuals.

---

## 4. “Do not build yet” flags (explicit)

Do **not** implement production features for these **until** **decisions** / **RACI** / **vendors** exist (manual + **MI**):

| Item | Why blocked |
|------|-------------|
| **Phone** / **text** **banking** **vendor** + **dialer** + **P2P** **tooling** | **MI §**49; **compliance** (TCPA-class), **unmanaged** **bulk** **SMS** forbidden. |
| **Opt**-**in** / **DNC** / **SMS** **compliance** **regime** | **Counsel** + **MCE**; **per** `PHONE_BANK_...` **hard** **walls** |
| **Voter** **file** **row** **in** **chat**, **VFR** **in** **public** or **unauth** **RAG** | `SYSTEM_READINESS_REPORT` + **5F/5H**; **LQA** + **R2+** only |
| **Donor** **/ ** **treasury**-**class** **data** in **suggestion** or **ingest** | **3H**, **R2+** |
| **First**-**person** **Kelly** **“** **I** **”** **/ ** **unapproved** **A**-**knowledge** | `ASK_KELLY_CANDIDATE_VOICE_...`, **A–D** **/ ** `CONTINUOUS_...` |
| **Voice** / **TTS** / **IVR** | **5F/5H** **not** **in** v1; **MI §**43 |
| **Strategy** **sliders** **affecting** **money** / **legal** / **GOTV** / **VFR** | **4B** + **5K** **hard** **walls**; **MCE+** only |
| **Arkansas** **history** **KB** (full **DB** **in** **repo**) | **5G** **post**-**launch** **roadmap** |
| **Live** “**omniscient**” **CM** **intelligence** **/ ** **every**-**signal** **brief** **without** **human** **filter** | **5E/5F** **/ ** `CAMPAIGN_COMPANION_OMNISCIENT_...` — **orchestration** **not** **bypass** |

---

## 5. First engineering packet — Phase 1 only (Cursor build script)

**Intent:** **Smallest** **safe** slice for **5H** first-release **foundation**: **structural** **suggestion** (or **beta** **feedback**) **→** `Submission` + `WorkflowIntake` + **admin** **triage** **list** **+** **public** **resilience** **(no** **leaks)**, without broad refactors, **without** new migrations **unless** you discover **schema** is **unavoidable** — if so, **stop** and **document** in a **separate** **PR** with **title** **and** **risk** (user rule: no migrations in **this** handoff file’s creation; **coding** team **may** propose **migrations** **with** **review**).

### 5.1 Pre-flight (read-only)

1. `campaign-system-manual/ASK_KELLY_LAUNCH_PRIORITY_AND_FIRST_RELEASE_SCOPE.md` §**1**–**6**  
2. `campaign-system-manual/ASK_KELLY_PRODUCTION_GRADE_AGENT_FOUNDATION_CHECKLIST.md`  
3. `campaign-system-manual/ASK_KELLY_SUGGESTION_BOX_AND_FEEDBACK_INTAKE_RULES.md`  
4. `SYSTEM_CROSS_WIRING_REPORT.md` §1–2, `workflows/TASK_QUEUE_AND_APPROVALS.md`  
5. `src/app/api/forms/route.ts`, `src/lib/forms/schemas.ts`, `src/lib/forms/handlers.ts`  
6. `src/lib/campaign-engine/open-work.ts` (intake **href** pattern)  
7. `playbooks/APPROVAL_AUTHORITY_MATRIX.md` (who approves what)

### 5.2 Build tasks (suggested order)

1. **Schema (optional):** If **only** adding a **formType** to **Zod** and **passing** through to **`Submission.type`** and **`WorkflowIntake.source`**, **no** **migration** may be required — **confirm** in **existing** `formSubmissionSchema` extensibility.  
2. **Public UI:** Suggestion (or “guided feedback”) **form** in **`CampaignGuideDock`** or a **dedicated** **(site)** **route** — **required** **fields** per `ASK_KELLY_SUGGESTION_...`; **no** **“[product]”** in **public** **strings** (use **Ask Kelly** / **guidance** / **suggestion**).  
3. **Server:** `POST` **/ ** **api** path **(either** **extend** `POST /api/forms` **or** **new** `POST /api/ask-kelly/feedback` **)** with **shared** **rate** **limit** and **Zod** **validation**; **write** `Submission` + **`createWorkflowIntakeForSubmission`** (or **parallel** **helper**) with **`metadata`** `{ askKelly: true, category, specificity, pagePath, … }` **(names** **stable** for **ops)**.  
4. **Admin:** Filter or sub-page under **`/admin`** **Workbench** to show **intakes** where **`metadata.askKelly`** (or `source` **/ ** `Submission.type`) — **R2/CM** only.  
5. **Fallbacks:** When **RAG/assistant** **unavailable** or **empty** **chunks** — static **“** we’ll **get** **back** **”** and **suggestion** path **(per** `CAMPAIGN_COMPANION_PUBLIC_SIMPLE_VIEW_RULES` **+** 5F).  
6. **No** new **N** **/ ** **O** **dependencies** in **this** **packet** without **steve** / **RACI**.

### 5.3 Commands (from `RedDirt/`)

```bash
cd RedDirt
npm run check
```

Optional local dev (if DB + env ready):

```bash
npm run dev:full
```

### 5.4 Completion report format (Cursor → Steve)

Paste after Phase 1 slice:

- **Active lane:** `RedDirt/`  
- **Branch / PR:** (if any)  
- **Files changed:** (list)  
- **Commands run + results:** (`npm run check` **exit** **0** or **not**)  
- **What** **was** **not** **done** (out of scope)  
- **WorkflowIntake:** **yes** / **no** and **metadata** **keys** used  
- **Admin** **triage** **URL** and **RACI** **owner** **(named)**  
- **Public** **copy** **review:** **no** **internal** **paths/ids** in **error** / **empty** **states**  
- **Migrations:** **none** / **(link** **if** **any)**  
- **Blockers** for **Phase** **2** (wizard)  

---

## 6. Final output for Steve

| Question | Answer |
|----------|--------|
| **What** **remains** | **Phases** **1–9** **above**; **governance** **items** in **`MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` §**1–**49**; **0–6** **unchanged** **until** **proven** **in** **product**. |
| **What** **to** **build** **first** | **Phase** **1** — **5H** **first**-**release** **foundation** **(suggestion** + **intake** + **triage** + **public** **safety) ** per **`ASK_KELLY_LAUNCH_...` **and** **§**5 **script** in **this** **file**. |
| **What** **decisions** **are** **blocking** | **Triage** **owner** **(MI** **§**45) **, ** **first** **coding** **packet** **sign**-**off** **(MI** **§**49) **, ** **beta** **access** **rules, ** **phone/text** **vendor+** **compliance** **(later** **phases) **, **P20** / **placement** **(Phase** **6) **, **KPI** **targets** **(retention) **, **$**-**/ ****legal-**class **/ ****GOTV** **from** **any** **UI** **(Phase** **9) **. |
| **What** **to** **paste** **back** **into** **ChatGPT** | **This** **file** (`RedDirt/docs/STEP_6_ENGINEERING_ROADMAP_AND_CURSOR_HANDOFF.md`) **+** **`ASK_KELLY_LAUNCH_PRIORITY_...` **+ **`MANUAL_TO_DEVELOPMENT_...` **+ **`MANUAL_INFORMATION_REQUESTS_...` **(or** **relevant** **§**s) **+ ** **`SYSTEM_READINESS_REPORT.md` **(current** **0–6) **. |
| **Can** **engineering** **begin** **immediately?** | **Yes** **on** **Phase** **1** **scaffolding** **(code** in **`RedDirt/`)** **;** **public**-**facing** **“** **ready** **”** and **triage** **cadence** **require** **named** **owner** + **MCE+** per **checklist,** not **just** code. **Do** **not** **pre**-**empt** **§**45 **/ ** **§**49 **without** **Steve.** |

---

**Document owner:** Step 6 handoff (audit + roadmap, **2026-04-27**). **Next** **update:** after **Phase** **1** **completes** or **0–6** **evidence** **changes** in **`SYSTEM_READINESS_REPORT` **.

---

## 7. Instruction to Steve (copy-paste)

Created `RedDirt/docs/STEP_6_ENGINEERING_ROADMAP_AND_CURSOR_HANDOFF.md`. **Paste** **that** **file** **back** **into** **ChatGPT** **before** **we** **start** **coding.**

(End of file.)
