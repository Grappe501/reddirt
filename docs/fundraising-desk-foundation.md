# Fundraising desk / finance workbench — foundation (FUND-1) (RedDirt)

**Packet FUND-1** names the **future** **Fundraising Desk** (also referred to as **Finance** **+** **fundraising** **operations** **workbench**) as a **first-class** **target** in the **unified** **campaign** **engine** **—** **planning** **and** **governance** **only** in this packet; **no** **dialer**, **no** **mass** **SMS** **sends**, **no** **wire** to **AR** **/** **FEC** **APIs** as **outcomes** of **this** **PR**.

**Cross-ref:** [`workbench-build-map.md`](./workbench-build-map.md) · [`workbench-job-definitions.md`](./workbench-job-definitions.md) (Finance Director) · [`position-hierarchy-map.md`](./position-hierarchy-map.md) · [`position-seating-foundation.md`](./position-seating-foundation.md) · [`agent-skill-framework.md`](./agent-skill-framework.md) · [`agent-knowledge-ingest-map.md`](./agent-knowledge-ingest-map.md) · [`fundraising-agent-ingest-map.md`](./fundraising-agent-ingest-map.md) · `src/lib/campaign-engine/fundraising.ts` · `src/lib/campaign-engine/skills.ts`

---

## 1. North star

The **Fundraising Desk** is the **operational** **center** for **money**-related **outreach** and **stewardship** (distinct from **treasury** **/** **disclosure** **compliance** **alone**):

- **Donor** **targeting** and **prospect** **pipelines** (with **human**-approved **lists**)
- **Call** **time** **prep** and **post-call** **follow-up** **queues** (read/plan, not a dialer in FUND-1)
- **Fundraising** **comms** (separate from **voter** **comms** where policy requires — often **tighter** **consent** and **opt-in** **rails**; today **comms** **workbench** is **compliance**-heavy; **dedicated** **donor** **streams** are **future**)
- **Donor** **research** and **enrichment** (see [`donor-research-and-enrichment-foundation.md`](./donor-research-and-enrichment-foundation.md))
- **Stewardship** **notes** / **history** / **next** **step** (future CRM surfaces)
- **Fundraising** **goals** / **pacing** / **KPI** **surfaces** (see [`fundraising-kpis-and-goals-foundation.md`](./fundraising-kpis-and-goals-foundation.md))
- **Strategic** **prioritization** (scoring is **governed**; **no** **silent** **auto-dial**)

**Finance Director** in ROLE-1 remains **accountable** for **treasury** and **filing** **inputs**; the **Fundraising** **Desk** is the **day-to-day** **revenue** **ops** **layer** that **feeds** **good** **data** to **Finance** and **Compliance** (disclaimers, **major** **donor** **events**, **vendor** **hooks**). **Candidate** and **seated** **volunteer** **roles** map per [`position-hierarchy-map.md`](./position-hierarchy-map.md) and `positions.ts` (`finance_director`).

---

## 2. Fundraising workbench model (target shape)

A **future** route such as `…/workbench/fundraising` (or split **fundraising** + **call-time**) would **eventually** **contain** **(conceptually)**:

| Area | Description |
|------|-------------|
| **Top** **prospects** | Ranked **list** with **confidence** + **why** (signals from research packet) **—** **human** **accepts** into **“candidate”** / **“staff”** **sheets** |
| **Call** **list** (candidate-ready) | **Filtered** by **contactability** **(see** [`contactability-and-calltime-precheck-foundation.md`](./contactability-and-calltime-precheck-foundation.md) **)**; **never** **raw** **CSV** to **principals** without **status** **strip** |
| **Contactability** / **preflight** | **Line**-level **stages** (normalized → validated → **review** / **ready** / **suppressed**) **—** **configurable** **thresholds** |
| **Research** **insights** | **Match** **confidence**; **overlaps**; **lapsed**; **geography** **fit** (see **donor** **research** **doc** **)** |
| **Outreach** **queues** **by** **channel** | **Email** / **text** / **call** (each **governed**; **separate** **opt-in** **truth** in `ContactPreference` / **jurisdictional** **rules** in **future** **packets** **)** |
| **Goals** / **pacing** / **KPIs** | **See** **KPI** **doc** **—** **daily** / **phase** / **cumulative** **dollars** / **dials** / **meetings** **booked** (what **we** can **count** when **data** **exists** **)** |
| **Notes** / **history** / **follow-up** | **CRM**-style **timeline** (future); **overrides** **and** **assignments** **align** with **ASSIGN-2** **and** **ALIGN-1** |
| **Escalation** / **compliance** **flags** | **Legal**; **DNC**; **bundling**; **content** that **moves** **money** (handoff to **Compliance** and **Finance** per [`workbench-job-definitions.md`](./workbench-job-definitions.md) **)** |

---

## 3. Relation to existing system

| Rail / layer | How the desk should plug in (future) |
|--------------|----------------------------------------|
| **Identity** / **contact** | `User` / `VolunteerProfile` have optional `phone`; `ContactPreference` has **email** and **SMS** **opt-in** **state** **—** **not** a **blank** **check** to **message**; **VoterRecord**-linked paths exist for **P**I **—** **donor** **CRMs** may **separate** **identity** **in** a **later** **data** **model** **.** |
| **Seating** / **roles** | `finance_director` in `PositionSeat`; **call-time** **volunteers** / **interns** in **TALENT-1** **narrative**; **UWR-1** / **inbox** **heuristics** **not** **fundraising**-specific **yet** **.** |
| **Assignment** | **User-scoped** **assign** **fields** on **existing** **work**; **future** **call** **sheets** could **use** `assignedToUserId` or **a** **dedicated** **list** **table** | 
| **AI** / **alignment** / **overrides** | **Recommend** **rank** **and** **drafts**; **no** **auto-dial**; **override** **events** on **suggested** **vs** **edited** **lists** (ALIGN-1) |
| **Open** **work** | **Email** `EmailWorkflowItem` can **include** **donor**-class **tags** (product); **not** **required** in FUND-1 |
| **Comms** / **email** **workflow** | **Existing** **queue**-first; **donor**-specific **templates** and **RAG** **slices** in **ingest** **map** **.** |
| **Talent** / **training** | **TALENT-1** **for** **volunteer** **call** **time** **norms**; **no** **auto** **seating** **.** |

**Repo** **evidence** **today** **—** there is **no** **`/admin/workbench/fundraising`** in [`workbench-build-map.md`](./workbench-build-map.md); **Finance** **Director** **row** in [`workbench-job-definitions.md`](./workbench-job-definitions.md) **states** **the** **gap** **explicitly** **.** FUND-1 **does** **not** **invent** **that** **UI** **.** 

---

## 4. What the fundraising agent should eventually do (governed)

| Class | Posture |
|-------|---------|
| **Know** | **Campaign** **fundraising** **message** (ingested SOPs), **compliance** **red** **lines**, **ask** **ladder**, **major** **/** **mid** **/** **low** **dollar** **rituals** |
| **Recommend** | **List** **order** and **“why** **here”** **notes**; **objection** **response** **drafts**; **KPI** **gaps** **vs** **goal** **—** all **advisory** |
| **Assist** | **Preflight** **copy**; **summary** of **prospect** **dossier**; **pacing** **narration** for **1:1s** with **CM** / **FD** **.** |
| **Watch** | **Mismatches** between **suggested** **and** **human**-final **lists**; **override** **patterns**; **dials** with **repeated** **bad** **outcomes** **(when** **instrumented** **)** **.** |
| **Never** **decide** **alone** | **Dials**; **Sends** that **spend** **text** or **email** at **scale**; **“legal** **to** **call”**; **waiver** of **disclaimers**; **bypass** of **queue-first** on **sensitive** **paths** **.** |

---

## 5. What is out of scope now (FUND-1)

- **No** **live** **dialer** or **A** **/** **B** **testing** of **PSTN** **termination**
- **No** **mass** **SMS** **or** **peer-to-peer** **send** **engine** **in** **this** **repo** **as** part of **FUND-1** **(product** may **add** **later** **)** 
- **No** **ingestion** of **live** **FEC** **/** **state** **contribution** **feeds** **as** **implemented** **code** in **this** **packet** **—** **architecture** only (see **donor** **research** **doc** **)** 
- **No** **compliance** **“auto-approve”** or **implied** **legal** **sign-off** on **messaging** **.** 
- **No** **hidden** **scoring** that **moves** **rows** in **the** **queue** without **human** **and** **audit** **.** 

---

## 6. Next packets (suggested)

- **FUND-2** — **Schema** **slices**: **Prospect** / **CallSheetRow** (if **warranted**); **contactability** **enum** and **status** **history**; **read**-only **APIs** to **vendors** **(Twilio** **Lookup**-**style** **)** **behind** **flags** 
- **FUND-2** — **Wire** `fundraising.ts` **types** to **RAG** **ingest** **manifests** and **a** **minimal** **admin** **skeleton** **page** (optional)
- **FUND-3** — **OpenFEC** (or **batch** **FEC** **import**) with **field**-level **confidence**; **AR** state **ethics** **/** **disclosure** **when** **source** **is** **confirmed** with **legal** **.** 

*Last updated: Packet FUND-1.*
