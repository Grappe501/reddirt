# Manual Pass 5F — completion report (Live intelligence, candidate voice, continuous learning, voice)

**Active lane:** `H:\SOSWebsite\RedDirt` (markdown path: `RedDirt/campaign-system-manual`)  
**Work type:** Markdown / manual only  
**Date:** 2026-04-28  
**Confirmation:** No application code, Prisma, DB, auth, migrations, or dependencies. No change to 0–6 grades in `SYSTEM_READINESS_REPORT.md` without product proof.

---

## Files read (context, per pass script)

- `CAMPAIGN_COMPANION_OMNISCIENT_AGENT_ARCHITECTURE.md` · `CAMPAIGN_COMPANION_ELECTION_QUESTIONS_POLICY.md` · `ELECTION_CONFIDENCE_TRANSPARENCY_AND_GET_UNDER_THE_HOOD_DOCTRINE.md` · `KELLY_PUBLIC_TRUST_TALKING_POINTS_AND_FAQ.md` · `WEBSITE_CLEANUP_MOTION_AND_LIVE_PLATFORM_PLAN.md`  
- `WORKBENCH_OPERATOR_RUNBOOK.md` · `STRATEGY_TO_TASK_EXECUTION_RUNBOOK.md` · `GUIDED_REPORT_BUILDER_AND_ASSISTED_QUERY_SYSTEM.md` · `USER_FRIENDLY_WORKBENCH_UX_REQUIREMENTS.md`  
- `PROGRESSIVE_ONBOARDING_AND_UNLOCK_SYSTEM.md` · `ROLE_BASED_UNLOCK_LADDERS.md` · `CANDIDATE_DASHBOARD_AND_DECISION_RUNBOOK.md` · `SEGMENTED_MESSAGE_AND_DISTRIBUTION_SOP.md`  
- `SYSTEM_READINESS_REPORT.md` · `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` · `MANUAL_TABLE_OF_CONTENTS.md` · `MANUAL_BUILD_PLAN.md` · `WORKFLOW_INDEX.md`  
- `playbooks/APPROVAL_AUTHORITY_MATRIX.md` · `playbooks/ESCALATION_PATHS.md` · `playbooks/ROLE_READINESS_MATRIX.md` · `playbooks/DASHBOARD_ATTACHMENT_RULES.md` · `playbooks/ROLE_KPI_INDEX.md`

---

## Files created (Pass 5F)

| File | Role |
|------|------|
| `CAMPAIGN_COMPANION_LIVE_INTELLIGENCE_AND_COMMAND_INTERFACE.md` | Internal CM/leadership live-intelligence and command-briefing doctrine; authorized prompts; data sources; “never leak”; summary vs report vs draft vs approved |
| `ASK_KELLY_CANDIDATE_VOICE_AND_POSITION_SYSTEM.md` | Ask Kelly / Campaign Companion: speaks-as-Kelly A–D levels; non-SOS issues; anti-fabrication; GOP as listening (not pandering) |
| `CANDIDATE_REFINEMENT_INTAKE_AND_QUESTION_BANK.md` | Refinement workflow; prioritization; 25 categories with questions, risk, review, and public-surface (A / bridge / defer) |
| `CONTINUOUS_CAMPAIGN_KNOWLEDGE_INGESTION_AND_REFINEMENT_ENGINE.md` | Signal → knowledge pipeline; states; feedback loops; “no creepy personalization” |
| `ASK_KELLY_VOICE_INTERFACE_AND_SPOKEN_AGENT_PLAN.md` | Voice/TTS/IVR future doctrine; safety and impersonation; spoken examples; accessibility |
| `CAMPAIGN_COMPANION_PUBLIC_SIMPLE_VIEW_RULES.md` | Public “simple” UI: what not to show; public vs staff patterns; missing-content and error handling |
| `MANUAL_PASS_5F_COMPLETION_REPORT.md` | This file |

---

## Files updated (Pass 5F)

- `MANUAL_BUILD_PLAN.md` — Pass 5F (complete) + recommended next  
- `MANUAL_TABLE_OF_CONTENTS.md` — Pass 5F in version, lifecycle, Part XVII, Message/Workbench block, Part X/XII/XVI where needed, last updated  
- `SYSTEM_READINESS_REPORT.md` — Pass 5F as design-only; 0–6 unchanged  
- `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` — purpose line + **§**43 + “when” footer + last updated  
- `WORKFLOW_INDEX.md` — Pass 5F pointer + last updated  
- `SEGMENTED_MESSAGE_AND_DISTRIBUTION_SOP.md` — new lanes for 5F (candidate voice, refinement)  
- `CAMPAIGN_COMPANION_OMNISCIENT_AGENT_ARCHITECTURE.md` — 5E vs 5F cross-links  
- `CAMPAIGN_COMPANION_ELECTION_QUESTIONS_POLICY.md` — election Q&A as subset of broader voice doctrine (5F)

---

## Product honesty

**Pass 5F is a manual and design layer.** It does **not** mean the system currently has: live omniscient campaign intelligence in product, a complete candidate-voice memory, voice synthesis, social or email ingest at scale, or real-time public CM dashboard answer capabilities. It defines the **architecture, governance, and SOPs** that should exist **before** engineering builds those capabilities. No public “AI” product language; public surfaces stay **Ask Kelly** / **Campaign Companion** and human-first framing.

---

## How Pass 5F extends Pass 5E

- **5E** defines Layer A (system read-context) and Layer B (human filter), modes (voter / volunteer / insider), and cross-party + website/live signal **rules** at a high level.  
- **5F** adds: **(1)** CM-facing **live intelligence and command** question catalog and safe answer shapes, **(2)** **Ask Kelly** **candidate voice** and **A–D** position levels, **(3)** a **refinement** question **bank** and **workflow** from public question to approved knowledge, **(4)** a **continuous ingestion and knowledge-state** model, **(5)** **voice/IVR** **future** doctrine, and **(6)** **public** **simple** **view** rules so voters never see internal system failure modes.

---

## What remains manual / design only

- All 5F files are **governance and specification**; they are **not** app routes, RAG stores, IVR, or a shipped Ask Kelly.  
- **MCE/NDE,** **LQA,** **treasurer,** **counsel,** and **`APPROVAL_AUTHORITY_MATRIX`** remain the human gates; no automated approval or send.

---

## What would be needed for engineering (out of scope of this pass)

- Role-aware answer service with **RACI**-enforced data views, auditable **provenance,** and **redaction** defaults.  
- Ingestion pipelines (social, email, press) with **retention,** **consent,** and **DPA** alignment — **not** raw firehose to a public model.  
- **Optional** voice/TTS/IVR product slice with **§**43 **consent** and **disclosure** SOPs.  
- **Workbench** and **`WorkflowIntake` / `CampaignTask`** integration for “draft task” and **4B** Preview/Propose — **not** Lock in chat.

---

## Steve / candidate decisions needed (see MI §**43**)

- Candidate voice **approval** boundaries; whether **first-person** “I” is allowed in which **channels** and **A/B** states.  
- **Non**-SOS **issue** priority (which topics need **A**-class first).  
- **GOP** / **cross**-**party** **attendance** and **messaging** **guardrails** (listening **without** pandering).  
- **Who** may run **“who** is **doing** **what**”** rollups and **at** what **RACI** depth.  
- **Voice** / **TTS** / **synthetic** **audio** **authorization** and **public** **disclosure** rules.  
- **Refinement** **cadence** (how often the candidate **reviews** the **D**-**queue) **.  

---

## Recommended next (owner)

- **Engineering** packet: **Campaign** **Companion** **knowledge** **ingest** (sanitized) **+** **role**-**aware** **answer** service **within** LQA and **`APPROVAL_AUTHORITY_MATRIX`**, **or**  
- **Manual** **Pass** **5B** (MCE/NDE chapter depth) per `MANUAL_BUILD_PLAN.md`.

---

**Last updated:** 2026-04-28 (Pass 5F)
