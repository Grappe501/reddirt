# Compliance governance — foundation rail (COMP-1) (RedDirt)

**Packet COMP-1** defines **compliance** as a **cross-system governance rail** — not a single **department** app, not only **Finance**, and **not** a **full** **compliance** **workbench** **in** this **repo** **yet**. It **binds** **policy**, **human** **review**, **audit** **provenance**, and **future** **paperwork** **pipelines** **to** every **major** **workbench** **and** **agent** **touchpoint** **without** **claiming** **legal** **correctness** **for** **materials** **not** **ingested** **or** **signed** **by** **counsel**.

**Cross-ref:** [`campaign-brain-alignment-foundation.md`](./campaign-brain-alignment-foundation.md) · [`automation-override-and-impact-foundation.md`](./automation-override-and-impact-foundation.md) · [`user-scoped-ai-context-foundation.md`](./user-scoped-ai-context-foundation.md) · [`ai-agent-brain-map.md`](./ai-agent-brain-map.md) · [`campaign-policy-foundation.md`](./campaign-policy-foundation.md) (POLICY-1) · [`compliance-document-ingest-foundation.md`](./compliance-document-ingest-foundation.md) (COMP-2) · [`budget-and-spend-governance-foundation.md`](./budget-and-spend-governance-foundation.md) (BUDGET-1) · [`federal-state-coordination-foundation.md`](./federal-state-coordination-foundation.md) · [`compliance-skill-framework.md`](./compliance-skill-framework.md) · [`compliance-paperwork-simplification-foundation.md`](./compliance-paperwork-simplification-foundation.md) · [`compliance-agent-ingest-map.md`](./compliance-agent-ingest-map.md) · `src/lib/campaign-engine/compliance.ts` · `src/lib/campaign-engine/ai-brain.ts` (`HumanGovernanceBoundary`)

---

## 1. North star

Compliance is a **horizontal** **rail**: every **send**, **list**, **expense** **class**, **contact** **channel** **use**, **filing** **deadline**, and **automation** **that** **moves** **money** **or** **PII** **should** **eventually** **declare** **its** **policy** **context** and **leave** **an** **audit** **trail** **when** **humans** **override** **or** **approve**. The **Compliance** **Director** **(ROLE-1)** **remains** **a** **human** **role**; **COMP-1** **does** **not** **ship** **RBAC** **or** **a** **dedicated** **`/admin/workbench/compliance`** **UI** **in** this **packet**.

---

## 2. Compliance domains

| Domain | Scope (examples) |
|--------|-------------------|
| **Campaign-finance reporting** | FEC / state **schedules**, **thresholds**, **aggregation** **(when** **data** **exists) ** |
| **Donor / fundraising** | **Solicitation** **rules**, **disclaimers**, **coordination** **(high** **risk) **—** **ties** **FUND-1** **docs** **.**
| **Communications / disclaimers** | **Paid** **vs** **earned**, **authorization** **lines** **on** **mass** **comms** **.**
| **Phone / text / email contact** | **Opt-in**, **DNC** / **suppression** **lists** **(where** **applicable) **; **`ContactPreference`** **in** **Prisma** **for** **tier-1** **comms** **—** **donor** **channels** **may** **need** **parallel** **truth** **later** **.**
| **Ethics / conflict / governance** | **Dual** **roles**, **gift** **rules** **(policy** **ingest) ** |
| **Reimbursement / expense documentation** | **Receipts**, **mileage**, **approver** **chains** **(paperwork** **doc) ** |
| **Deadlines / calendar** | **Filing** **dates**, **event** **reporting** **if** **required** **.**
| **Retention / records** | **What** **to** **keep**, **how** **long** **(policy) ** |
| **Role / authority** | **Who** **may** **sign** **what** **(see** **seating** **+** **SOPs) ** |

**Typed** **hooks:** `ComplianceDomain` in `src/lib/campaign-engine/compliance.ts`.

---

## 3. Relation to the unified system

| Layer | Tie-in |
|-------|--------|
| **AI brain / alignment** | **Guardrails** **on** **sensitive** **paths**; **RAG** **grounding** **for** **policy** **;** **no** **auto**-**certify** **.**
| **Overrides** | **Human** **path** **changes** **as** **learning** **signal** **;** **not** **“** **model** **was** **wrong** **”** **alone** **.**
| **Assignment / seats** | **Accountability** **narrative** **;** **no** **legal** **authority** **from** **`PositionSeat`** **.**
| **Fundraising (FUND-1)** | **Donor** **and** **contactability** **governance** **feeds** **same** **rail** **.**
| **Comms / email workflow** | **Queue-first** **E-1** **;** **disclaimer** **and** **risk** **fields** **on** **iterations** **.**
| **Tasks / events / calendar** | **Deadlines** **and** **money**-**adjacent** **events** **surface** **as** **exceptions** **.**
| **User-scoped context** | **Role**-**aware** **explanations** **without** **conflating** **with** **permissions** **.**
| **Position system** | **Compliance** **Director** **in** **`positions.ts`** **;** **overlay** **not** **separate** **product** **today** **.**
| **Open work / inboxes** | **Exception** **queues** **(future) **; **UWR-1** **unchanged** **in** **COMP-1** **. **

---

## 4. AI compliance role (eventually)

- **Monitor:** **inconsistencies** (missing **disclaimer** **candidates**, **unusual** **spend** **tags) **.**
- **Flag:** **sensitive** **patterns** per **`HumanGovernanceBoundary`**-**class** **stories** **(types** in **`ai-brain.ts`)** **.**
- **Prepare:** **draft** **checklists** **,** **not** **filed** **returns** **.**
- **Summarize:** **deadline** **queues** **,** **exception** **backlogs** **.**
- **Recommend:** **next** **human** **reviewer** **(role) **, **not** **binding** **routing** **.**
- **Never** **decide** **alone:** **legal** **submissions**, **opt-out** **overrides** **,** **“** **cleared** **to** **send** **at** **scale** **”** **,** **bank** **moves** **,** **filing** **clicks** **. **

---

## 5. Human governance (non-negotiable)

- **Legal** and **compliance** **officers** **(or** **designated** **signers) ** own **filing** **accuracy** and **regulatory** **interpretation** **in** **their** **jurisdiction** **.**
- **The** **model** **never** **implies** **“** **FEC**-**compliant** **”** or **“** **Arkansas**-**ethics**-**ok** **”** without **ingested** **cited** **rules** **+** **human** **sign-off** **.**
- **Draft** **vs** **final** **must** be **visually** and **provenance**-**tagged** **(future** **UI) **. **

---

## 6. Build sequence (updated after COMP-2, POLICY-1, BUDGET-1)

- **COMP-2 (shipped, minimal)** — Admin **`/admin/compliance-documents`**: **upload,** **metadata,** `approvedForAiReference` **(not** **auto) **, **Prisma** **`ComplianceDocument`**. RAG / extraction **TBD** **(next) **. **
- **POLICY-1 (shipped, v1 in code)** — **`CAMPAIGN_POLICY_V1` **in** **`policy.ts`**, **public** **footer** **disclaimer** **sourced** **from** **policy** **. **Persisted** **versioned** **store** = **future** **. **
- **BUDGET-1 (shipped, types)** — **`budget.ts` **;** **no** **ledger;** **all** **cost** **wires** **should** **eventually** **tag** **`CostBearingWireKind` **when** **built** **. **
- **COMP-2b+** — **Index** **approved** **uploads** for **RAG;** **optional** **OCR** **(human**-**reviewed) **. **
- **COMP-3** — **SOS** / **official** **form** **mirrors** **(after** **counsel) **+ **tighter** **link** **to** **paperwork** **prep** **. **
- **FUND-2+** / **E-*** / **ad** workbench: **name** **which** **ComplianceDomain** and **spend** **rail** **they** **touch** **in** **PR** / **pack** **notes** **. **

*Last updated: Packets COMP-1+COMP-2+POLICY-1+BUDGET-1 (foundation run).*
