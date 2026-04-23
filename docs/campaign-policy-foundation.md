# Campaign policy — foundation (POLICY-1) (RedDirt)

**POLICY-1** defines **campaign policy** as the **governed** source of truth for how the operation presents itself, sets **defaults**, and aligns **compliance- and spend-adjacent** rules **before** those rules become a dedicated settings product. This is **not** a substitute for **law** or **official filings**; it is the **org-authored** **baseline** that **RAG, UI, and the agent** should prefer when **versioned** policy exists.

**Code:** `src/lib/campaign-engine/policy.ts` — `CAMPAIGN_POLICY_V1` (v1 defaults), `CampaignPolicyCategory`, `ReimbursementScope`, **BUDGET-2** `SpendApprovalTier`, `spendBudget` on `CAMPAIGN_POLICY_V1`, `CAMPAIGN_BUDGET_APPROVAL_DEFAULTS_V1`.  
**Cross-ref:** [`budget-structure-foundation.md`](./budget-structure-foundation.md) · [`compliance-governance-foundation.md`](./compliance-governance-foundation.md) · [`compliance-paperwork-simplification-foundation.md`](./compliance-paperwork-simplification-foundation.md) · [`user-scoped-ai-context-foundation.md`](./user-scoped-ai-context-foundation.md) · [`campaign-brain-alignment-foundation.md`](./campaign-brain-alignment-foundation.md) · `docs/ai-agent-brain-map.md`

---

## 1. North star

Campaign policy is the place where the campaign **locks**:

- **Tone / philosophy / voice** (how we write and speak, not a legal disclaimer).
- **Operating defaults** (e.g. mileage rate for reimbursements, who may be reimbursed at all).
- **Compliance-adjacent defaults** (e.g. standard disclaimer line for web surfaces, escalation sensitivity).
- **Approval and spend thresholds** (when implemented: numeric caps that trigger human review; not legal limits by themselves).
- **Reimbursement defaults** (scope and unit rates the campaign chooses to use internally).
- **Disclaimer defaults** (the campaign’s chosen paid-for and similar lines for public/admin chrome).

**Alignment:** Policy feeds **`alignment`**, **user-scoped context**, and **RAG** “voice” **when** a **versioned** **record** **exists**; v1 in code is a **standing default** **until** **persisted** **policy** **ships** **(later** **packet) **.

---

## 2. Initial policy defaults (v1)

These are **initial campaign policy defaults** in **`CAMPAIGN_POLICY_V1`** (`policy.ts`) — **not** legal conclusions, **not** a guarantee that a jurisdiction accepts this mileage rate, and **not** a substitute for an approved expense policy in writing.

| Area | v1 value |
|------|-----------|
| **Tone** | Calm |
| **Philosophy** | Bottom-up |
| **Organizing line** | “We are here to help people organize where they are.” |
| **Page disclaimer (public + admin footers)** | “Paid for by Kelly Grappe for Secretary of State” (see `CampaignPaidForBar`, sourced from `CAMPAIGN_POLICY_V1`) |
| **Mileage reimbursement (internal default)** | **$0.725** per mile |
| **Reimbursement scope (internal default)** | **Candidate expenses only** (`ReimbursementScope.CANDIDATE_EXPENSES_ONLY`) |
| **Spend approval bands (BUDGET-2, narrative only)** | `CAMPAIGN_POLICY_V1.spendBudget.approvalThresholds` — small / medium / high **USD ceilings** with **SOP** copy; **no** software enforcement |

**`spendBudget` block:** `posture` (`SpendingPosture.STANDARD` in v1), `approvalThresholds` (see `CAMPAIGN_BUDGET_APPROVAL_DEFAULTS_V1`), and `budgetStructureChangeOnActivePlanRequiresHumanApproval: true`. These are **campaign defaults**, not legal conclusions.

---

## 3. Policy categories

| Category (`CampaignPolicyCategory`) | Use |
|-------------------------------------|-----|
| **messaging_voice** | Tone, brand voice, bottom-up story |
| **disclaimers** | Paid-for lines, comms footers, template disclaimer blocks |
| **expense_reimbursement** | Mileage, receipts, who may submit |
| **approvals** | Who signs what (narrative; not RBAC in this packet) |
| **channel_comms** | Email/SMS/call posture alongside `ContactPreference` and comms SOPs |
| **compliance_escalation** | When to tag compliance; ties **federal-state** [doc](federal-state-coordination-foundation.md) |
| **spend_budget** | Plan vs actual, thresholds, variance — **BUDGET-2** persistence (`BudgetPlan` / `BudgetLine`) + **POLICY-1** approval band **defaults** |
| **fundraising_goals** | Goal language and pacing narrative (FUND-1) |

`defaultPolicyCategoryComplianceDomain` in `policy.ts` maps some categories to **`ComplianceDomain`** for cross-rail **tagging** **only** **(no** **enforcement** **in** **POLICY-1) **.

---

## 4. Change / versioning model (intended, not all built)

Later packets should add:

- **Editable** policy in **database** (or CMS) with a **version id** and **effective dates**.
- **Auditable** diffs: who changed mileage rate, who approved a disclaimer change.
- **AI-visible** “current policy + version” in prompts and **alignment** (see [`campaign-brain-alignment-foundation.md`](./campaign-brain-alignment-foundation.md)).
- **Override-aware** pairing: if an operator **overrides** a suggested disclaimer, the **override log** (see `overrides` / handoff) should be able to reference **policy version** when wired.

**Today:** v1 is **in code** as **`CAMPAIGN_POLICY_V1`** so the **site and agent docs** have a **single** **importable** **default**.

---

## 5. Relation to the AI brain

- **Alignment:** Policy is an **input** to **“on-brand / on-voice”** checks; it does **not** **certify** **compliance**.
- **Context:** User- and **seat-scoped** explanations may cite **“campaign default”** for mileage or disclaimer **wording** when policy is available.
- **Skill domains:** `AgentSkillDomain.CAMPAIGN_POLICY` in `skills.ts` — RAG and **ingest** for **SOPs** and **this** **object** when persisted.

---

*Last updated: POLICY-1 + BUDGET-2 spend defaults (`spendBudget` on `CAMPAIGN_POLICY_V1`).*
