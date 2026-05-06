# Email AI intelligence upgrade — closeout 1.0

**Packet:** **EMAIL-AI-INTELLIGENCE-UPGRADE-CLOSEOUT-1.0**  
**Lane:** `RedDirt/` only · **Division:** Comms / Email Workflow Intelligence  
**Purpose:** Single place to record **what shipped** in the stacked AI upgrade, **how it fits architecturally**, **what operators may trust**, **what still needs humans**, **no-send rules**, **quality-eval posture**, and **honest gaps**. **Not** a legal warranty or a claim of hosted production verification.

**Primary progress bar:** [`campaign-email-command-center-progress-ledger.md`](./campaign-email-command-center-progress-ledger.md)  
**Handoff for new threads:** [`email-workflow-intelligence-AI-HANDOFF.md`](./email-workflow-intelligence-AI-HANDOFF.md)

---

## Packets completed (this stack)

| Packet | Role |
|--------|------|
| **EMAIL-AI-INTELLIGENCE-ARCHITECTURE-AUDIT-1.0** | Code-path inventory: OpenAI, Campaign Voice, SearchChunk vs email surfaces ([`email-ai-intelligence-architecture-audit.md`](./email-ai-intelligence-architecture-audit.md)). |
| **EMAIL-AI-BRAIN-REGISTRY-1.0** | Central doctrine + role strings in **`ai-brain-registry.ts`**; wired into Message Studio draft AI and queue-facing paths ([`email-ai-brain-registry.md`](./email-ai-brain-registry.md)). |
| **EMAIL-AI-SOURCE-GROUNDING-LEDGER-1.0** | Deterministic source ledger + structured JSON on draft AI; Campaign Voice evidence + Editorial grounding summary ([`email-ai-source-grounding-ledger.md`](./email-ai-source-grounding-ledger.md)). |
| **EMAIL-AI-TASK-INTELLIGENCE-1.0** | Queue item recommendations → **`metadataJson.emailTaskIntelligence`**; Daily / Readiness counts ([`email-ai-task-intelligence-1-0.md`](./email-ai-task-intelligence-1-0.md)). |
| **EMAIL-AI-PROFILE-INTELLIGENCE-2.0** | Evidence-backed profile intelligence + review UX; **no** auto-approve ([`email-ai-profile-intelligence-2-0.md`](./email-ai-profile-intelligence-2-0.md)). |
| **EMAIL-AI-AUDIENCE-STRATEGIST-1.0** | Audience Studio + Message Studio strategist summaries; explicit drafts only ([`email-ai-audience-strategist-1-0.md`](./email-ai-audience-strategist-1-0.md)). |
| **EMAIL-AI-DRAFT-CRITIC-1.0** | Scorecard + red flags + revision plan; optional OpenAI merge; Editorial panel + optional **`lastDraftCritiqueJson`** on linked server draft ([`email-ai-draft-critic-1-0.md`](./email-ai-draft-critic-1-0.md)). |
| **EMAIL-AI-CAMPAIGN-MEMORY-READINESS-1.0** | Honest **`SearchChunk`** stats for “memory” posture; Message Studio + **`/readiness`** panels ([`email-ai-campaign-memory-readiness.md`](./email-ai-campaign-memory-readiness.md)). |
| **EMAIL-AI-QUALITY-EVALUATION-HARNESS-1.0** | **`npm run email:ai:eval`** (default **static-only**), fixtures + rubric reports ([`email-ai-quality-evaluation-harness-1-0.md`](./email-ai-quality-evaluation-harness-1-0.md)). |
| **EMAIL-AI-INTELLIGENCE-UPGRADE-CLOSEOUT-1.0** | This document — **docs-only**. |

**Still separate / not “closed” by AI alone:** **EMAIL-AI-INTELLIGENCE-1.0** (queue advisory **`metadataJson.emailAiAnalysis`**) remains the **original** operator-triggered queue path; all newer packets **layer** on governance and Message Studio depth without changing **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`**.

---

## AI architecture summary

- **Surfaces:** Queue detail (legacy advisory + task intelligence + profile panels), Message Studio (Campaign Voice, source readiness, grounding, audience strategist, draft critic, campaign memory), Audience Studio (strategist), Readiness (memory panel + hosted DB assistant elsewhere).
- **Execution model:** Server actions behind **`requireAdminAction`** (or equivalent gates); OpenAI calls are **optional** and gated on **`OPENAI_API_KEY`** where applicable.
- **Persistence:** Queue metadata JSON for analyses; **`MessageStudioDraft` / `MessageStudioDraftRevision`** for shared drafts and optional critique snapshots; profile facts only after **human approve** on suggestions; **no** auto-send, **no** auto CRM merge, **no** auto audience activation.
- **Deterministic spine:** Brain registry + source grounding + task/profile heuristics provide **structured** outputs that UI can render without trusting prose alone.

---

## AI brain registry

- **Source of truth:** `RedDirt/src/lib/email-command-center/ai-brain-registry.ts` (and companion doc [`email-ai-brain-registry.md`](./email-ai-brain-registry.md)).
- **Intent:** One place for **role**, **tone**, and **must-not** strings consumed by Message Studio draft AI and aligned queue features so prompts do not drift silently across files.

---

## Source grounding

- **Library:** `ai-source-grounding.ts` — ledger lines, unsupported-review posture, merge with model “limitations” fields.
- **Behavior:** AI outputs carry **evidence buckets** tied to known repo / voice context — **not** external fact-checking and **not** permission to invent citations.

---

## Task intelligence

- **Library:** `ai-task-intelligence.ts` + queue UI section.
- **Behavior:** Structured recommendations and next-step hints stored on the workflow item — **no** automatic `CampaignTask` rows, **no** calendar writes, **no** sends.

---

## Profile intelligence

- **Library:** `ai-profile-intelligence.ts` + profile review surfaces.
- **Behavior:** Groups/filters pending evidence; deterministic previews — **approve** still creates **`EmailContactProfileFact`** only through explicit operator actions.

---

## Audience strategist

- **Library:** `ai-audience-strategist.ts` + Audience Studio panel + Message Studio `?audienceDefinitionId=` card.
- **Behavior:** Strategy copy and draft audience definitions are **advisory**; SendGrid list sync and sends remain **separate**, gated packets.

---

## Draft critic

- **Library:** `ai-draft-critic.ts`, `message-studio-draft-critic-ai.ts`, actions + **`MessageStudioDraftCriticPanel`**.
- **Behavior:** Scorecard + flags + revision plan; operator may append to editorial notes or save metadata on server draft — **no** auto body replace, **no** send.

---

## Campaign memory readiness

- **Library:** `ai-campaign-memory-readiness.ts` — bounded Prisma / SQL stats over **`SearchChunk`** (counts, coverage honesty).
- **Behavior:** Tells operators whether **indexed memory** is statistically plausible — **does not** ingest mail, **does not** claim RAG quality beyond DB reality.

---

## Quality eval status

- **Command:** `npm run email:ai:eval` → **`scripts/email-ai-quality-eval.mjs`** (default **`--static-only`**: **no** OpenAI bill, **no** network requirement for rubric pass).
- **Artifacts:** `data/email-ai-eval-fixtures.json`, `data/email-ai-quality-eval-report.json`, optional regenerated **`docs/email-ai-quality-eval-report.md`**.
- **Optional:** Run the script **without** `--static-only` with **`OPENAI_API_KEY`** set only when an operator explicitly wants adjudication — not CI-default.

---

## What AI can do now

- Draft and revise **email copy** under Campaign Voice + brain registry constraints (optional OpenAI).
- Explain **source readiness** gaps and attach **grounding ledgers** to advisory JSON.
- Recommend **queue next steps** and store them in **`metadataJson.emailTaskIntelligence`**.
- Propose **profile** and **audience** insights with **evidence-first** UI; create audience definition drafts when operator drives the action.
- **Critique** drafts with a structured scorecard and revision plan; persist critique metadata when linked to server drafts.
- Report **SearchChunk** / embedding coverage for “campaign memory” readiness.
- Run **static quality eval** over synthetic fixtures for regression discipline.

---

## What AI cannot do

- Send Gmail or SendGrid mail; activate automation workers; auto-approve queue items.
- Merge duplicate people into **`User`** / **`VolunteerProfile`** without explicit human workflows outside this contract.
- Run **hosted** DB verification or migrations; prove **Kelly-Grappe-App** connectivity.
- Replace **counsel** on compliance, fundraising disclaimers, or third-party claims.
- Guarantee deliverability, suppression correctness, or consent on a live file without operator verification on the **target** database.

---

## Human approval rules (summary)

- **Queue:** Status changes and any future send bridges remain **human-owned**; AI writes **advisory** metadata unless a future packet explicitly changes that (none in this stack).
- **Profiles:** Suggestions → operator **approve** → facts.
- **Audiences:** Definitions / previews require explicit operator creation and review; no auto “go live” to ESP.
- **Message Studio shared drafts:** Review queue workflow statuses are **operator** transitions; AI does not move **Approved for send governance** on its own.
- **Send execution:** Final send classes remain behind **`EMAIL-SEND-EXECUTION-1.0`** doctrine and hosted gates — AI outputs are inputs only.

---

## No-send rules (summary)

- **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`** remains **`false`** for queue-origin sends unless a future governed packet changes it by explicit product decision.
- Message Studio, Send Packet Builder, Automation shell, Analytics drilldowns, and AI panels are **no-send** surfaces: copy/export and metadata only unless **`EMAIL-SEND-EXECUTION-1.0`** (and org policy) governs actual mail.
- **`npm run email:no-send-scan`** remains the **heuristic** guardrail for accidental send callsites; WARN on legacy integration files is a **known baseline**, not automatic OK for new ECC paths.

---

## Remaining gaps (honest)

1. **Hosted Kelly-Grappe-App / Supabase** — `DATABASE_URL` / `DIRECT_URL` proof chain still operator-owned; local green does not lift deployment % claims.
2. **Optional retrieval / RAG depth** — SearchChunk stats are **readiness**, not full retrieval productization; ledger leaves headroom (~97%) for explicit future packets.
3. **Governed segment export + ESP audience sync execution** — strategist and previews exist; **list execution** and **broadcast proof** remain future / gated work.
4. **Import graph + cross-source merge** — profile graph AI improves triage but does not complete multi-source truth automation.
5. **Operator-proven live mail** — code may be present for **`EMAIL-SEND-EXECUTION-1.0`**; **proof** of hosted test/broadcast is outside this AI closeout.
6. **`email:ai:eval` OpenAI adjudication** — optional only; static rubric is the default safe path for CI and laptops without keys.

---

## Next operational plan

1. Keep **`npm run email:ai:eval`** in **static-only** mode on PRs / local checks; use OpenAI adjudication only on demand with budget owner approval.
2. After **hosted DB gate**, re-run **`email:contact-import:gate`**, **`email:no-send-scan`**, and **`email:ai:eval`** on the same machine profile operators use for sends.
3. Prioritize **steering packets** from [`campaign-email-command-center-progress-ledger.md`](./campaign-email-command-center-progress-ledger.md) “Next (named)” — hosted verification first, then execution proof, then automation activation if ever approved.
4. Treat this closeout as the **AI layer narrative**; route-level truth stays in [`email-command-center-route-inventory.md`](./email-command-center-route-inventory.md) and [`email-command-center-launch-hardening.md`](./email-command-center-launch-hardening.md).

---

*Last updated: **EMAIL-AI-INTELLIGENCE-UPGRADE-CLOSEOUT-1.0** — AI upgrade stack documentation closed; code shipped in prior packets; **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`** unchanged.*
