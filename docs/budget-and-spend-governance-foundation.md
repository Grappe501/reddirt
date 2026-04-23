# Budget and spend governance — foundation (BUDGET-1) (RedDirt)

**BUDGET-1** defines **budget and spend** as a **horizontal rail**: every **cost-bearing** **wire** in the product should **eventually** **declare** a **governance** **category** and **contribute** to **plan** **/ actual** / **variance** **stories** **. **This** **packet** is **not** a **full** **budget** **workbench,** **not** a **ledger,** and **not** any **bank** or **ad**-**platform** **integration** **.

**Code (types** **only):** `src/lib/campaign-engine/budget.ts` — `BUDGET1_PACKET`, `CostBearingWireKind`, `BudgetEnforcementStage`.  
**Cross-ref:** [`compliance-governance-foundation.md`](./compliance-governance-foundation.md) · [`fundraising-desk-foundation.md`](./fundraising-desk-foundation.md) · [`compliance-paperwork-simplification-foundation.md`](./compliance-paperwork-simplification-foundation.md) · [`federal-state-coordination-foundation.md`](./federal-state-coordination-foundation.md) · [`workbench-build-map.md`](./workbench-build-map.md) · `docs/ai-agent-brain-map.md`

---

## 1. North star

Spend governance is a **shared rail** so **compliance**, **fundraising ops**, **comms**, **events**, and **future** **ad** and **dialer** **vendors** **do** **not** **each** **invent** **their** **own** **“money** **story** **.”** **The** **system** should **link** **commitments,** **invoices,** and **reimbursements** to **one** **model** of **where** **money** **was** **planned** **and** **where** it **went** (when data exists) **,** with **human** **review** for **jurisdiction-**sensitive** **and** **federal-** **state** **sensitive** **allocations** **(see** **federal-state** **doc) **.

---

## 2. What counts as cost-bearing

Examples (grounded in **domain** **;** not every wire exists in the **Prisma** **schema** **yet) **:

| Area | Notes |
|------|--------|
| **Fundraising tools / vendors** | Processor fees, platform subscriptions tied to **donation** **flows** (see FUND-1; GoodChange / Givebutter-style **cited** in docs, **not** **integrated** in BUDGET-1) **. |
| **Digital advertising** | Future **ad** workbench; **no** ad **APIs** in this **packet** **. |
| **Texting / calling / email vendors** | Comms stack costs (SendGrid, Twilio, etc. **at** **ops** level) **. |
| **Event costs** | `CampaignEvent` and related **ops**; **line**-**item** **detail** is **a** **later** **packet** **. |
| **Travel / mileage / reimbursements** | Tied to **POLICY-1** defaults and **receipts** in **COM**-**2** **uploads** **. |
| **Content / media** | Production, design, **owned** **media** **(not** **all** **are** **spend) **. |
| **Software / platform** | Hosting, tool subscriptions, **prisma** **/ app** **infra** as **org** **costs** **(often** **outside** **this** **app’s** **DB) **. |
| **Consultants / contractors** | **Human**-**governed** **;** **IE**-**like** or **shared**-**resource** **questions** go to **federal-state** **. |
| **Printing / mail** | **Vendor** and **in**-**kind** (future) **. |
| **Other** | Any **spend** **the** **campaign** **tags** in **a** **future** **“cost** **line** **”** **model** **. |

---

## 3. Budget model (conceptual)

- **Categories** — map to `CostBearingWireKind` and **future** **COA** **(chart** of **accounts) **in **RAG** / policy **,** not **only** in **one** **workbench** **. **
- **Budgets vs actuals** — **planned** **caps** and **realized** **outlays**; **BUDGET-1** does **not** **persist** **. **
- **Commitments** — e.g. **signed** **IO** or **verbal** **“go** **”** **(human**-**entered) **, **future** **. **
- **Reimbursement tracking** — **receipts** and **policy**-**scoped** **mileage**; **COM**-**2** **files** are **evidence,** not **auto**-**booked** **. **
- **Approval thresholds** — **align** to **Policy** and **seating** **(who** **can** **approve) **, **not** **RBAC** in **BUDGET-1** **. **
- **Campaign phase pacing** — **goal** / **spend** **pace** for **future** **dashboards** **(FUND-1** **/ KPI** **). **
- **Variance / overrun** — **flags** for **when** **actuals** **or** **commitments** **exceed** **plan**; **advisory,** not **blockers** in **v1** **. **

---

## 4. Relation to other rails

| Rail | Link |
|------|------|
| **Compliance** | **Receipts,** **filings,** and **SOS**-**aligned** **paperwork** **(COMP**-**1** / **2) **. |
| **Fundraising** | **Donor** and **platform** **fees,** **goal** **pacing,** not **waiver** of **compliance** **(FUND-1) **. |
| **Tasks / events** | **Money**-**relevant** **events** and **checklists** **(future) **. |
| **Future ad workbench** | **Must** **register** as **`CostBearingWireKind.DIGITAL_ADVERTISING` **(when** **exists) **. |
| **Approvals / overrides** | **Spend** **exceptions** and **narrated** **reasons** **(override** **rail) **. |
| **Seating / roles** | **“Who** **can** **approve** **$X**” **is** **a** **human** / **SOP** **pairing** to **seats,** not **inferred** from **`PositionSeat` **. |
| **AI** | **Summarize** **variance,** **flag** **missing** **receipts;** **never** **certify** **compliance** **. |

---

## 5. What existing data may already help

- **`ComplianceDocument`** (COMP-2) — **file**-**backed** **evidence** **(not** **structured** **amounts) **. **
- **`Submission`** — **generic** **intake**; **may** **hold** **future** **typed** **financial** **submissions** **if** **you** **add** **type** **conventions** **(not** in **BUDGET-1) **. **
- **Fundraising / comms** **models** — **donor**-**facing** **;** **processor** **fee** **lines** **not** **first-class** **in** **DB** in **this** **packet** **(honest) **. **
- **Policy defaults** — **mileage** **in** `CAMPAIGN_POLICY_V1` **(POLICY-1) **. **

---

## 6. Next packets (after BUDGET-1)

- **BUDGET-2** — **Spending** / **commitment** **rows** in **DB** **(narrow** **MVP) **+ **link** to **compliance** **docs** **. **
- **BUDGET-3** — **Plan** **vs** **actual** **dashboard** **(workbench) **+ **alerts** **(advisory) **. **
- **FUND-2+** — **Revenue** **+** **fee** **reconciliation** **(processor** **exports) **, **read-only** where **safe** **. **
- **AD**-**1** — **Digital** **ad** **workbench** **+** **mandatory** **budget** **rail** **tag** **(when** **built) **. **

---

*Last updated: Packet BUDGET-1 (with POLICY-1 + COMP-2 foundation run).*
