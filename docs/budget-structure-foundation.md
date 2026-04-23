# Budget structure — foundation (BUDGET-2) (RedDirt)

**BUDGET-2** adds a **minimal, auditable** **budget model** on top of **FIN-1** (`FinancialTransaction`). It is the place where **planned vs actual** is **visible** for internal operations — **not** the ledger’s replacement, **not** official filings, and **not** a forecasting engine.

**Cross-ref:** [`budget-and-spend-governance-foundation.md`](./budget-and-spend-governance-foundation.md) · [`financial-ledger-foundation.md`](./financial-ledger-foundation.md) · [`submission-to-ledger-bridge.md`](./submission-to-ledger-bridge.md) · [`campaign-policy-foundation.md`](./campaign-policy-foundation.md) · `src/lib/campaign-engine/budget.ts` · `src/lib/campaign-engine/budget-queries.ts` · Prisma `BudgetPlan` / `BudgetLine`

---

## 1. North star

- **Budget** is the campaign’s **internal spend-planning and control narrative**: caps, lines, and variance **for operators**.
- It is **distinct from the ledger**: the ledger (`FinancialTransaction`) records **confirmed** (or draft) **activity rows**; the budget records **intent** (`plannedAmount` per line).
- It is **distinct from official filings**: nothing here **reports** to an agency or **certifies** compliance.
- It is **where planned vs actual is visible**, when ledger rows exist and categories map cleanly enough to **cost-bearing wires** (`CostBearingWireKind`).

---

## 2. Core concepts

| Concept | Definition |
|--------|------------|
| **Budget period** | The **plan-level** window: `periodLabel` (human) plus optional `startDate` / `endDate`. When dates are set, **actuals** in code only count **CONFIRMED** transactions whose **calendar day** (UTC `YYYY-MM-DD`) falls in that inclusive range. If dates are **omitted**, **all** CONFIRMED transactions contribute to wire totals (honest but coarse). |
| **Budget category (line)** | A **`BudgetLine`**: human `label` + **`costBearingWireKind`** (must match `CostBearingWireKind` in `budget.ts`). This is the **governed** join to the ledger: ledger `category` → wire via `getBudgetWireForTransaction`. |
| **Planned amount** | `BudgetLine.plannedAmount` — **USD**, campaign-internal. |
| **Actual amount** | Derived: sum of **CONFIRMED** `FinancialTransaction.amount` values whose mapped wire equals the line’s `costBearingWireKind` (after optional period filter). **Not** perfect attribution when multiple lines share one wire (each line currently shows the **full** wire total — see governance). |
| **Committed amount** | **Future**: purchase orders, verbal “go”, IOs — **not** persisted in BUDGET-2. |
| **Remaining amount** | `planned − actual` for that line (same caveats as actual). |
| **Variance** | `actual − planned` (positive ⇒ **over** plan, for typical expense-out framing). |
| **Approval thresholds** | **POLICY-1** defaults in `CAMPAIGN_POLICY_V1.spendBudget.approvalThresholds` — **narrative / SOP** only; **no** automatic spend authorization in product. |
| **Spending posture** | `CAMPAIGN_POLICY_V1.spendBudget.posture` (e.g. `standard`) — **advisory**; does not change math. |

---

## 3. Relation to other rails

| Rail / area | Link |
|-------------|------|
| **Financial ledger (FIN-1)** | Actuals **read** from `FinancialTransaction` **CONFIRMED**; category → **`CostBearingWireKind`** via `getBudgetWireForTransaction`. |
| **Policy defaults (POLICY-1)** | Mileage, reimbursement scope, and **spend approval bands** in `CAMPAIGN_POLICY_V1`; **human** interpretation for real-world spend. |
| **Compliance (COMP-1/2)** | Receipts and uploads remain **evidence**; budget variance **does not** prove filing correctness. |
| **Fundraising (FUND-1)** | Future **fees** and **vendor** costs should use **`FUNDRAISING_VENDOR`** (or mapped ledger categories) when booked. |
| **Events / tasks** | Optional `relatedEventId` on ledger rows can tighten attribution **later**; BUDGET-2 does **not** require it. |
| **Future ad workbench** | Should register spends under **`DIGITAL_ADVERTISING`** when booked to the ledger. |
| **Approvals / overrides** | Thresholds are **defaults**; real authority stays in **people** and **SOP**; override rail can log exceptions **later**. |
| **AI recommendations** | May **summarize** variance and **flag** missing ledger coverage — **never** the only source of truth for spend or compliance. |

---

## 4. Governance

- **Draft vs active budget** — `BudgetPlan.status`: **`DRAFT`** (editable narrative default), **`ACTIVE`** (operators treat as “in force”), **`ARCHIVED`**. The product **does not** block edits by status; **SOP** should say who may change an **ACTIVE** plan.
- **Category ownership** — Lines are **owned** by the campaign in the DB; **who may add lines** is operational (admin gate today).
- **Human approval thresholds** — `SpendApprovalTier` bands in **`policy.ts`**; **no** automatic authorization or vendor unlock.
- **No automatic spend authorization** — BUDGET-2 is **read-mostly** for actuals plus **small** create paths; **no** “approve invoice” or bank hooks.
- **Auditability** — Plans/lines are **durable** Prisma rows; ledger rows keep **source** and **status**; mapping imperfections are **documented** in UI copy and this doc.

---

## 5. What is out of scope

- **No** full forecasting engine or ML pace models.
- **No** live vendor, bank, or processor integrations.
- **No** filing or report automation.
- **No** perfect cost attribution (multi-line same wire, multi-wire categories, unmapped categories → **`other`**).
- **No** commitment / encumbrance ledger in BUDGET-2.

---

*Last updated: Packet BUDGET-2.*
