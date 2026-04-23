# Budget and spend — agent ingest map (BUDGET-1) (RedDirt)

This document names **what** to **ingest** so the **agent** can **assist** on **pacing,** **variance,** and **governance** **narration** without **asserting** **accounting** or **regulatory** **correctness** **. **

**Code:** `src/lib/campaign-engine/budget.ts` · `docs/budget-and-spend-governance-foundation.md`  
**Cross-ref:** [`budget-and-spend-governance-foundation.md`](./budget-and-spend-governance-foundation.md) · [`compliance-agent-ingest-map.md`](./compliance-agent-ingest-map.md) · [`fundraising-agent-ingest-map.md`](./fundraising-agent-ingest-map.md) · `docs/campaign-policy-foundation.md`

**Scope column:** *global* = org-wide; *finance* = treasurers / budget owners; *phase* = time-bound campaign phase; *user* = per-seat or per-person (sparingly) **. **

---

## 1. Tier 1 — ingest early

| Content | Why the agent needs it | Unlocks (areas) | Scope | + Human review |
|---------|------------------------|----------------|-------|----------------|
| **Current budget / COA** | Map spend lines to **plain**-**English** **categories** | Future budget UI, `CostBearingWireKind` | global / finance | Yes — org chart of accounts is counsel/treasury-owned |
| **Prior submitted financials (if you have them)** | **Continuity** with **“what** **we** **filed** **”** (not auto-imported) | Compliance narrative, BUDGET-2 | finance | **Always** for filings |
| **Reimbursement rules + mileage (policy)** | **Ground** **mileage** and **receipt** **questions** | `CAMPAIGN_POLICY_V1`, **expense** **SOPs** | global + finance | Yes when overlapping law |
| **Mileage rule (0.725 in v1)** | Internal **default;** not a statutory **claim** | POLICY-1, paperwork prep | global | N/A (policy default) not legal |
| **Approval thresholds** | **When** a human must **pre**-**approve** **spend** | Overrides, future budget alerts | global / finance | Yes |
| **Expense coding** (account → category) | Consistent **tagging** on **wires** | Budget rail + compliance **evidence** | finance | Yes |
| **Vendor list and known costs** | **Spot** **new** or **unbilled** **vendors** | BUDGET-2+ **commitments** | global / finance | **Vendor** **terms** can be **sensitive** |
| **Recurring software / platform** | **Baseline** **burn** | BUDGET variance | finance | Sometimes |
| **Candidate-specific expense** **policy** | **Scope** (e.g. **candidate** **only** in v1) | POLICY-1, reimbursements | global | **Yes** if mixed with **law** |

---

## 2. Tier 2 — high leverage next

| Content | Why | Unlocks | Scope | + Review |
|--------|-----|---------|--------|----------|
| **Historical spend by channel** | Pacing, **ROI** **story** (with **FUND-1) **| Dashboards, **narration** | phase / global | Finance |
| **Ad platform cost patterns** (when you have data) | Ad **workbench** **(future) **| `CostBearingWireKind.DIGITAL_ADVERTISING` | phase | Finance + comms |
| **Fundraising ROI** | **Donor** **acquisition** **vs** **cost** | FUND+ budget | global | **Careful** **claims** |
| **Event cost** **history** | **Per**-**event** **benchmarks** | Events + BUDGET | global | **Ops** + finance |
| **Staff / contractor** **patterns** | **Burn** and **ramp** | HR-weighted (often **sensitive) **| finance | **PII** / **labor** **rules** **. ** |

---

## 3. Tier 3 — later / specialist

| Content | Why | Unlocks | Scope | + Review |
|--------|-----|---------|--------|----------|
| **Optimization logic** (custom) | **Scenario** playbooks | “What-if” (future) | phase | **Don’t** **pretend** **certainty** |
| **Scenario** **assumptions** | **Contingent** **plans** | Board **/ finance** **narration** | global | **Leadership** |
| **District / county cost curves** | **Geo**-**targeted** **spend** | **Field** + **ad** (future) | county / phase | **Data**-**driven,** not **stereotyping** |
| **Persuasion** / **turnout** **CPI** **models** | **Comparative** **efficiency** | **Research,** not **filing** | phase | **Methodology**-**heavy** **;** **expert** **. **

---

*Last updated: Packet BUDGET-1 (with POLICY-1 + COMP-2).*
