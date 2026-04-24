# Deterministic brain foundation (BRAIN-OPS-1) (RedDirt)

**Packet BRAIN-OPS-1 (Part A).** Defines the **deterministic campaign brain** (truth engine): the **rule-governed layer** that resolves what the system may treat as **fact**, **mirror**, **inference**, or **forbidden**—**before** any recommendation, dashboard metric, or AI output is shown as “truth.”

**Cross-ref:** [`truth-governance-ownership-map.md`](./truth-governance-ownership-map.md) · [`campaign-manager-workbench-spec.md`](./campaign-manager-workbench-spec.md) · [`division-workbench-alignment.md`](./division-workbench-alignment.md) · [`discord-integration-foundation.md`](./discord-integration-foundation.md) · `src/lib/campaign-engine/truth.ts` · [`unified-campaign-engine-foundation.md`](./unified-campaign-engine-foundation.md) · [`campaign-brain-alignment-foundation.md`](./campaign-brain-alignment-foundation.md)

**Disclaimer:** The brain is **software governance**, not legal advice. It does **not** certify compliance or replace human judgment on political or legal questions.

---

## 1. North star

The **deterministic brain** is the campaign’s **truth layer**: it decides, for each signal and action path:

| Question | Brain role |
|----------|------------|
| **What is authoritative?** | Which table/field or governed default wins when two sources disagree |
| **What is inferred?** | Labels derived by rules/heuristics with explicit non-authoritative status |
| **What is provisional?** | Drafts, imports pending review, unconfirmed ledger rows |
| **What is allowed?** | Policy + governance state (send, assign, spend tier, AI reference) |
| **Who owns it?** | Seat occupant, assignee, position default, or explicit vacant roll-up |
| **Does it require review?** | `CountyContentReviewStatus`, compliance doc AI flag, email workflow review states, etc. |

**Nothing** becomes a **command-center “truth”** or **auto-action** without passing this layer’s **ordering** and **classification**. **AI** outputs are **never** an authority tier—they are **eligible or ineligible** recommendations given resolved truth.

---

## 2. What the brain decides

| Domain | Deterministic resolution (examples) |
|--------|-------------------------------------|
| **Source-of-truth** | e.g. `CountyCampaignStats.registrationGoal` vs `CountyVoterMetrics.countyGoal` (mirror); `FinancialTransaction` **CONFIRMED** vs draft for BUDGET-2 actuals; **ingested** election rows vs raw JSON on disk |
| **Policy** | `policy.ts` / `CAMPAIGN_POLICY_V1` defaults; spend approval tier; queue-first comms rules documented in foundations |
| **Governance / compliance posture** | `ComplianceDocument.approvedForAiReference`; compliance doc types; **no** filing automation claims |
| **Assignment / ownership** | `assignedToUserId` on queues; **seat** occupancy via `PositionSeat` + `seating.ts` read models |
| **Seat roll-up** | Vacant vs filled seat; position workbench banner; ASSIGN-2 **alignment** reads (advisory counts) |
| **County / geography** | Canonical `County.id` / `slug` / `fips`; voter row county from file; `User.county` string **not** FK—must not silently equal `County` |
| **Budget / approval posture** | Planned vs **CONFIRMED** actuals wire mapping (`budget-queries.ts`); **CONTRIBUTION** excluded from spend actuals |
| **AI eligibility** | RAG chunks vs **approved** compliance docs; assistant may **summarize** vs **cite as law** boundaries per [`email-workflow-intelligence-AI-HANDOFF.md`](./email-workflow-intelligence-AI-HANDOFF.md) |

---

## 3. What the brain does not decide

- **Final human political decisions** (strategy, message tone, who to endorse)—operators decide; the brain **constrains** what the **system** may assert.
- **Silent legal/compliance certification**—no automatic “filed” or “compliant” from PDF upload or AI summary.
- **Freeform AI invention of workflow**—no new queue types or assignment rules from model text; **packets + schema** own workflow.
- **Hidden reassignment**—no background change to `assignedToUserId` or seat occupancy without an explicit, auditable action (future routers must log).
- **Authority escalation**—AI or scripts cannot grant spend approval, publish sends, or mark compliance approved without **explicit** human/system rules encoded in product.

---

## 4. Order of operations

**Conceptual pipeline** (each step may short-circuit to “blocked” or “advisory only”):

1. **Source truth resolution** — pick authoritative fields; label mirrors, inferred, stale.
2. **Policy resolution** — apply `CAMPAIGN_POLICY_V1` and touchpoint rules (comms, ledger, budgets).
3. **Governance check** — review flags, compliance posture, AI document eligibility.
4. **Ownership resolution** — seat occupant → assignee → vacant roll-up → escalation path (documented, not auto-escalate in BRAIN-OPS-1).
5. **Workbench surfacing** — only **classified** signals feed Command Bar / Truth Panel / grids (see [`campaign-manager-workbench-spec.md`](./campaign-manager-workbench-spec.md)).
6. **Recommendation generation** — AI/heuristics receive **resolved truth + eligibility**; output tagged **recommendation**, never **fact**.

---

## 5. Truth classes

Aligned with `truth.ts` (`TruthClass`):

| Class | Meaning |
|-------|---------|
| **AUTHORITATIVE** | Governed primary field/table for that domain (e.g. registration goal on `CountyCampaignStats`). |
| **MIRRORED** | Copied/denormalized for performance; must not override primary if they disagree (e.g. `countyGoal` on metrics snapshot). |
| **INFERRED** | Rule-based derivation; must be labeled in UI/docs (e.g. heuristic inbox priority). |
| **PROVISIONAL** | Draft / pending review / unconfirmed import. |
| **STALE** | Known out-of-date vs expected sync (e.g. pipeline error or old snapshot). |
| **UNAPPROVED_FOR_AI** | Exists in DB or RAG index but **must not** be quoted as operational truth in assistant without human approval (`approvedForAiReference === false` for compliance uploads). |

---

## 6. Governance states

Aligned with `truth.ts` (`GovernanceState`):

| State | Meaning |
|-------|---------|
| **ALLOWED** | Action may proceed under policy (human still executes sensitive steps). |
| **ADVISORY_ONLY** | Show context; no automatic side effects (typical for AI suggestions, seat alignment hints). |
| **REVIEW_REQUIRED** | Operator review before execute (email workflow queue-first, content review patterns). |
| **COMPLIANCE_REVIEW_REQUIRED** | Compliance-specific gate before treating artifact as trusted for AI or external comms. |
| **BLOCKED** | Must not proceed until rule satisfied (e.g. missing CONFIRMED ledger where policy demands it—product-defined per packet). |

---

## 7. Raw election results path (canonical)

Campaign-held **raw** Arkansas result JSON (and co-located handbook copy) lives under:

**`H:\SOSWebsite\campaign information for ingestion\electionResults`**

That folder is **not** the database. **Authoritative** election results for the app are **`Election*`-class tables** only **after** a governed ingest packet (`DATA-4` / `ELECTION-INGEST-1`) lands—until then, JSON on disk is **provisional input**, not workbench truth.

---

*Last updated: Packet BRAIN-OPS-1.*
