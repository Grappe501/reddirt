# System Readiness Report — Pass 1 + Pass 2A regrade + Pass 3 manual alignment + Pass 3C + Pass 3D + **Pass 3E** + **Pass 3F** (docs)

**Date:** 2026-04-27 (Pass 1 scan; **Pass 2A** deepens evidence, still **no** runtime E2E tests; **Pass 3** is **markdown-only** **strategy** **+** **readiness** **modeling** **docs** **—** **no** app changes).  
**Lane:** `H:\SOSWebsite\RedDirt`  
**Maturity scale:** 0 = not started · 1 = concept only · 2 = documented · 3 = prototype · 4 = integrated demo · 5 = production candidate · 6 = production ready  

**Key artifacts:** `SYSTEM_CROSS_WIRING_REPORT.md`, `inventories/*` (Pass 2A), `prisma/schema.prisma`, `src/lib/forms/handlers.ts`, `src/lib/campaign-engine/open-work.ts`, `docs/audits/DASHBOARD_HIERARCHY_COMPLETION_AUDIT.md`, `netlify.toml`, `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md`, `SIMULATION_AND_FORECASTING_SYSTEM_PLAN.md`, `FUNDRAISING_AND_VOLUNTEER_ACCELERATION_PLAN.md`, `PAID_MEDIA_AND_LONG_TERM_INFRASTRUCTURE_PLAN.md`, `ENDORSEMENT_AND_NATIONAL_ATTENTION_PROGRAM.md`, `PRECINCT_PATH_TO_VICTORY_AND_CANVASSING_PLAN.md`, `YOUTH_CAMPUS_AND_STUDENT_ORGANIZING_PLAN.md`, `NAACP_AND_COMMUNITY_BRANCH_RELATIONSHIP_PLAN.md`, `FOCUS_CATEGORY_ORGANIZING_PLAN.md`, `WEEKLY_TRAVEL_AND_EVENT_PROJECTION_SYSTEM.md`, `COUNTY_PARTY_AND_RURAL_ORGANIZING_PLAN.md`, `COUNTY_PARTY_MEETING_TOUR_SYSTEM.md`, completion reports Pass 3B/3C/3D/3E/3F — **manual only**; no new 0–6 app grades in those passes. **Paid** media vendor / compliance / telemetry readiness = TBD until Steve + treasurer + counsel set SOPs (`MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` §18). **Pass 3D–3E (manuals):** Endorsement and precinct 3D docs do not add new product **surfaces**. **Pass 3E** (youth, NAACP, EHC/focus, travel) is **SOP and planning** only. **Pass 3F** (county party, rural, meeting tour) is **SOP and planning** only — **no** `CountyParty` model; **meeting** **dates** and **chairs** are **not** in the **repo** as **verified** **truth** **by** **default.** **No** new 0–6 app grades. **NAACP** mapping may be **incomplete** — **do not** publish invented branch **lists**. **“Active** **campus**” requires **field** **truth** (youth plan). **Precinct** *modeling* still constrained when strategic counties lack data (`MANUAL_INFORMATION_REQUESTS` §20). **Festival** ingest may not cover all statewide events (`WEEKLY_TRAVEL_AND_EVENT_PROJECTION_SYSTEM.md` §20).

**Public product naming:** use **Guided Campaign System**, **Campaign Companion**, **Workbench**, **Pathway Guide**, **Field Intelligence** — not “AI” in public-facing product copy. Internal `WorkflowIntake.metadata` may include classification data — do **not** export raw keys to public UI.

---

## Pass 2A regrade (major systems)

| System | 0–6 | Reality check (Pass 2A) | Danger to call “production ready” (6) without |
|--------|-----|--------------------------|-----------------------------------------------|
| **Public site** | **5** | 44+ `(site)` pages; full nav, policy, program pages | If claiming **factual** electorally sensitive stats, need **sourcing** + **compliance** |
| **OIS state** | **4** | `StateOrganizingIntelligenceView` + builders | Some **demo/seed** tiles — **verify** data source per panel before public “live” |
| **Region dashboards (×8)** | **4** | Static + `[slug]` placeholder | **Taxonomy** alignment with `arkansas-campaign-regions` vs registry (documented risk) |
| **County — public command** | **5** | `County` + `getCountyPageSnapshot` pattern | **Copy** and **elected** rosters per county **accuracy** (human) |
| **Pope v2 (OIS sample)** | **4** | Full shell; not cloned statewide | Reusing pattern **per county** needs **data** parity |
| **OIS county stub** | **2** | `organizing-intelligence/counties/[slug]` | — |
| **City/precinct OIS** | **0–1** | **Docs only** for routes | — |
| **Personal `/dashboard`** | **2** | **Placeholder** page, no product auth | **Auth**, **PII** policy, `User` scoping |
| **Leader `/dashboard/leader`** | **2** | **Placeholder** | P5 + roster rules |
| **P5 public onboarding** | **4** | `onboarding/power-of-5` live | **Not** end-to-end P5 with full graph in Prisma (see P5 plan) |
| **P5 data model in DB** | **2–3** | Relational/team concepts split across `VolunteerProfile`, field, plans; **not** a single P5 ERD in product | P5-**packet** work |
| **Workbench** | **5** | `open-work` merges intakes, email workflow, tasks, threads, festivals | **Runbooks** for assignees, **key** rotation for **ADMIN** |
| **WorkflowIntake spine** | **5** | `POST /api/forms` → `Submission` + `WorkflowIntake` **proven in code** | **Triage SOPs**, **PII** in `Submission.content` (must treat as **sensitive**) |
| **Tasks** | **4–5** | `CampaignTask` in open-work + `admin/tasks` | Full **automation** from every intake = **out of scope** (human triage) |
| **Comms (plans, drafts, sends, broadcasts)** | **5** | Mature Prisma + UI paths | **Legal** for finance-related comms, **opt-in** for SMS per env |
| **Narrative distribution (admin UI)** | **3–4** | `/admin/narrative-distribution` + components; **type** in `narrative-distribution` | **Telemetry** on “what shipped” not guaranteed everywhere |
| **Message engine** (`lib/message-engine/`) | **3–4** | dashboard intelligence + recs | **MCE** plan convergence — do not claim one **button** = full compliance |
| **Social workbench** | **4** | Deep models + workbench; links to intakes in places | **False positives** in monitoring — policy |
| **Orchestrator** | **4** | `InboundContentItem` pipeline per doc | **Outbound** per doc **deferred** |
| **Voter import / VoterRecord** | **4** | **Staff** surfaces | **6** = **DPA** + access matrix + **training** + **audit** |
| **Voter model UI** | **4** | `voters/[id]/model` | **Same** as voter file for **6** |
| **Relational contacts** | **4** | REL-2 in Prisma + admin | **Consent** and **visibility** rules in **manual** |
| **GOTV admin page** | **2–3** | Route `admin/.../gotv` **exists** — **depth** not fully audited in Pass 2A | **Verify** with Steve before treating as “command” |
| **Events / calendar** | **4–5** | `CampaignEvent`, workbench calendar, community suggestions | **Sync** and **legal** for events (venues, **tax**) |
| **Finance** | **4** | `FinancialTransaction` with **DRAFT/CONFIRMED** | **6** = treasurer/counsel alignment |
| **Compliance docs** | **4** | Upload + `approvedForAiReference` | **6** = **what** may feed **RAG** / author tools |
| **Owned media** | **4** | Batches, grid, `OwnedMediaAsset` | Privacy scan scripts exist — run policy |
| **Relational** (`/relational/*`) | **3** | Separate product shell; auth pattern **verify** in Pass 3 | **Role** matrix |
| **Search / RAG** | **3–4** | `api/search`, ingest | **6** = content review for what’s **in** index for **public** |
| **Author-studio APIs** | **3** | **Internal**; model-backed | **Not** a volunteer **Guided** surface |
| **Deployment / Netlify** | **5** | `netlify.toml`: migrate in build, Node 20, 6GB heap, Next plugin; `DATABASE_URL` at build | **6** = **secrets** in Netlify, **backups** |
| **Admin auth** | **3–4** | Cookie `ADMIN_SECRET` **pattern** (do not document value) | **6** = **MFA** / SSO — **TBD** for production campaign |

---

## Executive summary (unchanged from Pass 1, refined)

- **Real:** public site, county engine, OIS (state/region) with care on **seeded** panels, **Pope** v2 as sample, **form → DB → Workbench** path, **broad** admin, **orchestrator** for inbound content, **voter/relational** **staff** tools.  
- **Prototype / demo risk:** OIS/NDE/message “intelligence” **strips** that read like live operations without checking **data provenance** per build.  
- **Placeholder:** member dashboards, OIS **admin** hub, OIS **nested** county, city/precinct, parts of **GOTV** (pending verification).  
- **Documented only:** full **Pathway** automation, full **MCE+NDE** one spine, full **P5** graph in DB, **ED command** C2.  
- **Next:** `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` (§1–**25**) · **Manual Pass 4** (role playbooks, training, dashboard attachment — `MANUAL_PASS_3F_COMPLETION_REPORT` **27**-role order).  
- **Pass 3 (documentation only):** Strategic **reality** bands using Steve’s 2026-04-27 baseline, Workbench + KPI governance language, and simulation/forecast *readiness* language without claiming certainty; ties OIS/NDE/GOTV/ED gaps to human approval and lowest-qualified approver. **No** new 0–6 maturity grades for app systems in this pass — the Pass 2A table remains the technical source of truth.  
- **Pass 3B–3F (markdown):** Pass 3B–3D as above, plus 3E youth/campus, NAACP, EHC/focus, weekly travel, and 3F county party + rural + meeting tour (no invented **meeting** **dates,** **chairs,** or **NAACP** **/ **campus** **facts;** no assumed civic-group support).

**Earlier Pass 1 sections** (known routes, docs, etc.) **remain** valid; add **`SYSTEM_CROSS_WIRING_REPORT.md`** as the **engineering** companion. **`CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md`** is the **strategic/operating** companion.

**Pass 3 (complete, markdown):** `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md` · `SIMULATION_AND_FORECASTING_SYSTEM_PLAN.md` · `MANUAL_PASS_3_COMPLETION_REPORT.md`. **Pass 3B–3F** add the standalone chapters in this folder (see `MANUAL_TABLE_OF_CONTENTS` appendix).
