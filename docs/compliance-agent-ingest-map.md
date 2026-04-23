# Compliance — agent knowledge ingest map (COMP-1) (RedDirt)

Tells the **user** what to **ingest** so the **agent** is **useful** on **governance** **without** **claiming** **to** be **a** **lawyer** **. ** Pairs with [`agent-knowledge-ingest-map.md`](./agent-knowledge-ingest-map.md) and [`compliance-skill-framework.md`](./compliance-skill-framework.md). **Tiers** align with `ComplianceKnowledgeTier` in `compliance.ts` **(naming) **. **

**Scoping (columns):** **G** global · **C** compliance-specific · **F** finance · **Ch** channel (sms/email/phone) · **+HR** = **extra** **human** or **legal** **review** **expected** **. **

---

## 1. Tier 1 — must have soon

| Category | Why | Unlocks / areas | Scope | +HR? |
|----------|-----|------------------|--------|------|
| **Internal** **compliance** **SOPs** | Base **RAG** for **“** **what** **we** **do** **”** | All **rails;** **narration** in **comms** **/ **UWR** | G | Y if novel |
| **Escalation** **rules** | **When** to **bump** to **CM** / **counsel** | **Exception** **queues** (future) | G | Y |
| **Filing** **calendars** / **deadlines** | **Timeliness** | **Event** + **KPI** **(COMP** **) **; **not** **auto**-**file** | G, F | Y |
| **Approved** **disclaimers** / **required** **phrases** | **Mass** **comms** **safety** | **Email** **workflow,** **comms** | G, C | Y |
| **Expense** / **reimbursement** **procedures** | **Paperwork** **prep** | **Paperwork** **simplification** | F | Y |
| **Receipt** **rules** | **Document** **completeness** | **Triage** **of** **missing** **fields** | F | case-by-case |
| **Fundraising** **red** **lines** | **Overlap** with **FUND-1** | **Solicitation** **copy** | F + C | Y |
| **Text** / **phone** / **email** **contact** **rules** | **TCPA,** **opt-in,** **DNC** **(as** **adopted) ** | **`ContactPreference` **story** **;** **FUND-1** **contact** | G, Ch | Y |
| **Authority** / **approval** **thresholds** | **Who** **signs** **what** | **Seating,** **SOPs** | G | Y |
| **Paperwork** **checklists** | **RAG**-**driven** **draft** **gaps** | **Pre**-**filing** **review** | C | Y |

**Mirror** in **T1** of **main** **ingest** **map;** this **file** is **compliance-**-**heavy** **. **

---

## 2. Tier 2 — high leverage next

| Category | Unlocks | Scope | +HR? |
|----------|---------|--------|------|
| **State** **filing** **guides** / **form** **instructions** | **SOS**-**shaped** **drafts** | C, **state**-locked | Y |
| **Ethics** / **conflict** **policies** | **Gift** / **second** **job** **flags** | G | Y |
| **Committee** / **account** **procedures** | **Bank** **+** **FEC** **(when** **built) ** | F, C | Y |
| **Processor** **/ export** **formats** (ActBlue, **etc. **) | **Import** **mapping** (later) | F | low **if** **vendor**-**blessed** **.**
| **Bank** **reconciliation** **workflows** | **Narration** of **gaps** | F | Y **for** **material** **moves** **.**
| **Historical** **filing** **examples** (sanitized) | **“** **Looks** **like** **last** **quarter** **”** | C, F | Y **if** **public**-**facing** **.**
| **Exception** **playbooks** | **UWR-1+** **handling** of **sensitive** **intakes** | G | Y |

---

## 3. Tier 3 — later / specialist

- **Counsel** **memos** (privileged handling — **separate** **RAG** **ACL** in **future) **.**
- **Edge** **cases** and **enforcement** **stories** **(non**-**fictional) **.**
- **Retros** on **filing** **corrections** **. **

*Each* **item** *should* **name** **jurisdiction** **(federal,** **AR,** **…)** in **the** **ingest** **manifest** **. **

*Last updated: Packet COMP-1.*
