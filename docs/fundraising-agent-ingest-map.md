# Fundraising — agent knowledge ingest map (FUND-1) (RedDirt)

Companion to [`agent-knowledge-ingest-map.md`](./agent-knowledge-ingest-map.md) and [`fundraising-desk-foundation.md`](./fundraising-desk-foundation.md). **What to feed** the **RAG** / **assistant** so the **agent** is **useful** on **dollars** and **solicitation** **without** **inventing** **compliance** or **dialer** **behavior**.

**Scoping** labels: **G** = global, **F** = finance**/**fundraising role, **C** = candidate**/**principal voice, **U** = user**/**seat**/**personalized** (TALENT/assign).

---

## 1. Tier 1 — must have soon

| Content | Why | Unlocks (areas) | Scope |
|--------|-----|-----------------|-------|
| **Campaign** **fundraising** **narrative** (why we take money) | Grounds all asks in **message** | Fundraising comms, email drafts | G |
| **Approved** **ask** **ladder** (low/mid/major) | Prevents **invented** **amounts** | List prep, call scripts | G**/**F**
| **Candidate** **voice** for **money** (tone, do/don’t) | Stylistic **+** **risk** | AI drafts, speechlets | C |
| **Donor** **qualification** / **solicitability** **rules** (what we **can** / **can’t** say) | **Not** a **substitute** for **legal**; **tightens** RAG | Research ranking narrative | F + legal handoff |
| **Call**-**time** **script** **stubs** (opener, ask, **thank**-**you**) | Operator **efficiency** | Call time prep (future desk) | F**/**U |
| **Objection** **+** follow-up** **scripts** | **Conversion** and **courtesy** | Staff **+** **volunteer** **rails** | F |
| **Major**-**donor** **handling** (who greets, **stewardship** **cadence) ** | **Avoid** **gaffes** on **sensitive** **gifts** | TALENT + **events** | F**/**C |
| **Compliance** **red** **lines** (TCPA, **DNC** **(where** **we** have **a** list**), **disclaimers) ** | **Stops** **over**-**solicitation** **in** text | SMS**/**email **policy**; **comms** **workbench** **handoff** | G**/**F**/**Compliance |
| **Finance** / **FR** **role** **SOPs** (per [`workbench-job-definitions.md`](./workbench-job-definitions.md) **) ** | **Clarifies** **who** **approves** **spend** **vs** **raise** | Seating, **open** work | F |

---

## 2. Tier 2 — high leverage next

| Content | Unlocks | Scope |
|--------|---------|-------|
| **Segmentation** **frameworks** (major/mid/peer/prospect) | AI **sort** **narration** (not **sole** order) | F**/**G
| **Event**-**driven** **fundraising** **playbooks** | Festivals, **house** **parties** | **F**+ events
| **Historical** **donor** **notes** (anonymize where needed) | Relationship **context** in **RAG** | F**/**U
| **Relationship** **maps** (board, **bundlers) ** (non**-sensitive) | Strategic **narration** | F**/**C
| **Candidate** **schedule** **constraints** for call time | **List** **right**-**sizing** for **principals** | C**/**U
| **Finance** **calendar** / **Filing** **reminders** (handoff) | **Pacing** with **reality** | F
| **State**-**level** **fundraising** **/ ethics** **guidance** **(vetted) ** | **AR**-**specific** **narration** in **RAG** | G (after counsel) |

---

## 3. Tier 3 — later / advanced

- **Comparative** **donor** **intelligence** (cross-**state**); **opposition** **donor** **pattern** **notes** (non-**defamatory) **.**
- **Cross**-**candidate** **FEC** **overlap** **(with** **confidence** **language) **.**
- **Retros** from **prior** **cycles** (internal) **. **
- **Advanced** **persuasion** **(training** for **volunteer** **only,** not **dishonest) **. **

---

## 4. Ingest gaps (honest)

- The **repo** has **comms** and **voter** **/ contact** **hooks**; it **does** **not** **yet** **have** a **dedicated** **donor** **CRMs** **table** in **FUND-1** **—** many **T1** **items** are **“** **author** **in** `docs` **+** `SearchChunk` **(when** **ingest** **runs) **.**
- **State** **contribution** **ingest** **is** a **separate** **build**; **ingest** **order** in [`donor-research-and-enrichment-foundation.md`](./donor-research-and-enrichment-foundation.md) **. **

*Last updated: Packet FUND-1.*
