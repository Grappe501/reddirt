# Financial ledger — foundation (FIN-1) (RedDirt)

**FIN-1** introduces a **minimal, durable** **`FinancialTransaction`** model: the **campaign’s internal, structured representation of money movement** for **operations,** **audit,** and **future** **compliance** **paperwork** **support** **—** **not** **a** **bank** **ledger,** **not** **an** **FEC** **/ SOS** **filing** **system,** **and** **not** **an** **“** **official** **”** **legal** **record** **by** **itself** **. **

**Code / schema:** `prisma/schema.prisma` (`FinancialTransaction`, enums) · `src/lib/campaign-engine/budget.ts` (`getBudgetWireForTransaction`, category→`CostBearingWireKind`) · `src/lib/campaign-engine/financial-ingest.ts` (submission **seams** only) · admin read-only list `…/financial-transactions` (if present).

**Cross-ref:** [`budget-and-spend-governance-foundation.md`](./budget-and-spend-governance-foundation.md) · [`compliance-document-ingest-foundation.md`](./compliance-document-ingest-foundation.md) · [`campaign-policy-foundation.md`](./campaign-policy-foundation.md) · [`submission-to-ledger-bridge.md`](./submission-to-ledger-bridge.md)

---

## 1. North star

- **Single internal source of truth** for **classified** **financial** **activity** **the** **campaign** **chooses** **to** **record** **(when** **confirmed) **—** **alongside** **,** **not** **replacing** **,** **bank** **and** **agency** **records** **. **
- **Not** a **bank** **replacement:** **no** **balances,** **no** **sync** **,** **no** **reconciliation** **engine** **in** **FIN-1** **. **
- **Not** a **compliance** **filing** **system:** **no** **schedule** **mapping,** **no** **electronic** **filing** **,** **no** **“** **filed** **”** **flags** **. **
- **Structured** **representation** **of** **money** **movement** **for** **budget** **rails,** **exceptions,** **and** **later** **paperwork** **drafts** **(with** **human** **review) **. **

---

## 2. Core concepts

| Concept | Meaning (FIN-1) |
|---------|------------------|
| **Transaction** | One **`FinancialTransaction`** row: **expense,** **reimbursement,** or **other** **(enum) **. **Contributions** **/** **receipts** **as** **a** **distinct** **type** **are** **deferred** **(use** **OTHER** **or** **a** **later** **enum** **value) **. |
| **Amount** | **`Decimal(14,2)`** **USD** **(assumed) **—** **currency** **field** **is** **a** **future** **add** **if** **needed** **. |
| **Date** | **`transactionDate`** **—** **economic** **date** **chosen** **by** **staff** **(not** **DB** **insert** **time) **. |
| **Category** | **Free-form** **string** **slug** **(normalized** **in** **code) **—** **maps** to **`CostBearingWireKind` **via **`getBudgetWireForTransaction` **(budget** **rail) **. |
| **Source** | **`FinancialSourceType` **:** **manual,** **submission,** **compliance** **document,** **or** **future** **integration** **;** **`sourceId` **is** **opaque** **per** **source** **(e.g.** **submission** **cuid) **. |
| **Related entity** | **Optional** **`relatedUserId`**, **`relatedEventId` **—** **no** **forced** **graph** **to** **every** **Prisma** **model** **. |
| **Compliance linkage** | **Optional** **narrative** **in** **notes** **or** **future** **FK** **to** **`ComplianceDocument` **;** **FIN-1** **does** **not** **mandate** **a** **join** **. ** |

---

## 3. Relation to other rails

| Rail | How the ledger fits |
|------|----------------------|
| **Budget** | **Category** **→** **`CostBearingWireKind` **;** **variance** **(future) **compares** **to** **plan** **. ** |
| **Compliance** | **Confirmed** **rows** **+** **uploaded** **docs** **(COMP-2) **support** **evidence** **stories** **;** **not** **auto**-**filing** **. ** |
| **Fundraising** | **Processor** / **platform** **fees** **(future) **as** **EXPENSE** **+** **category** **. ** |
| **Tasks** / **events** | **Optional** **`relatedEventId` **for** **attributed** **event** **cost** **. ** |
| **Policy** | **Reimbursement** **and** **mileage** **defaults** **in** **POLICY-1;** **not** **auto**-**applied** **to** **rows** **. ** |
| **Document** **ingest** | **Source** **DOCUMENT** **+** **`sourceId` **=** **compliance** **doc** **id** **(when** **staff** **creates** **the** **row) **. ** |
| **Submissions** | **Seam** **in** **`financial-ingest.ts` **;** **see** **bridge** **doc** **. ** |

---

## 4. Governance

- **Draft** **vs** **confirmed** **`status` **(enum) **:** **DRAFT** **by** **default** **;** **CONFIRMED** **only** **after** **human** **affirmation** **(no** **auto**-**confirm) **. **
- **Source**-**of**-**truth** **ambiguity** **:** **the** **ledger** **is** **for** **internal** **governance;** **bank** **and** **filings** **can** **disagree** **—** **document** **reconciliation** **in** **notes** **or** **future** **reversal** **rows** **. **
- **Human** **override** **:** **corrections** **prefer** **new** **rows** **+** **narrative** **(FIN-1** **does** **not** **add** **deletion** **/ **audit** **table) **. **
- **Audit** **trail** **:** **created/updated** **timestamps,** **source** **type** **+** **id,** **and** **future** **actor** **ids** **(FIN-2+) **. **

---

## 5. What is out of scope (FIN-1)

- **Bank** **/** **card** **sync** **or** **statement** **import** **. **
- **FEC** **/** **SOS** **filing** **automation** **. **
- **Claiming** **an** **“** **official** **”** **or** **“** **filed** **”** **record** **from** **this** **table** **alone** **. **
- **Full** **finance** **dashboard,** **reporting** **UI,** or **editing** **workbench** **(read-only** **list** **only** **if** **shipped) **. **

---

*Last updated: Packet FIN-1.*
