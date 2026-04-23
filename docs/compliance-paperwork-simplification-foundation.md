# Compliance — paperwork simplification architecture (COMP-1) (RedDirt)

**Goal:** Move **compliance** **reporting** **toward** **simple** **operational** **inputs** (mileage, receipts, categorized spend, **deadlines**) **while** **preserving** **human** **and** **legal** **responsibility** for **what** is **filed** **. ** FUND-1 and **FUND-2+** **donor** **data** are **separate** **;** this **doc** is **the** **horizontal** **“** **turn** **chaos** **into** **reviewable** **drafts** **”** **story** **. **

**Cross-ref:** [`compliance-governance-foundation.md`](./compliance-governance-foundation.md) · [`fundraising-desk-foundation.md`](./fundraising-desk-foundation.md) · `src/lib/campaign-engine/compliance.ts` (`PaperworkPrepStage`, …)

---

## 1. North star

**Operators** should **enter** **facts** **once** **(or** **import** **from** **known** **sources) **; **the** **system** **normalizes,** **categorizes,** and **produces** **draft** **schedules** **/** **line**-**item** **previews** **that** **mirror** **official** **form** **structures** **where** **practical** **. ** **Submission** to **FEC,** **SOS,** or **vendors** **stays** **human**-**gated** **(and** **often** **outside** **this** **app) ** in **COMP-1** **. **

---

## 2. Input model (future-oriented)

| Input type | Role |
|------------|------|
| **Mileage** | **Travel** for **field** / **fundraisers** / **reimbursable** **per** **policy** **.**
| **Receipts** | **Scans** / **emails** **(metadata** + **OCR** **in** **future) **.**
| **Reimbursements** | **Who** **paid** **,** **who** **approves** **(seating** + **SOP) **.**
| **Bank / account transactions** | **Reconciliation** **(COMP-1** **does** **not** **ingest** **bank** **APIs) **.**
| **Processor exports** (e.g. **Givebutter,** **ActBlue**-**style) ** | **Map** to **contribution** **buckets** **(integration** **later) **.**
| **Manual notes** | **Narration** for **ethics** **/** **gifts** **.**
| **Categorized** **expenses** | **Media,** **travel,** **stipends** **per** **chart** **of** **accounts** **(future) **.**
| **Event** / **fundraiser** **records** | **Link** to **comms** **/ events** **models** **.**
| **Filing deadlines** **&** **form** **skeletons** | **State**-**specific** **;** **not** **in** **repo** **as** **machine**-**readable** **AR** **SOS** **package** **in** **COMP-1** **. **
| **Checklists** | **Human**-**runnable** **;** **agent** **can** **narrate** **gaps** **. **

---

## 3. Prep pipeline (conceptual stages)

1. **Source** **capture** / **import** (CSV, **manual** form, **future** **bank** **reconciliation) **.**
2. **Normalization** (dates, **amounts,** **vendors,** **payees) **.**
3. **Categorization** (per **compliance** **COA** **and** **jurisdiction) **.**
4. **Exception** **detection** (over **limits,** **missing** **receipt,** **flagged** **vendors) **.**
5. **Draft** **paperwork** **(PDF** / **form** **JSON** **preview) **.**
6. **Human** **review** (Compliance / Finance / counsel as defined) **.**
7. **Official** **submission** **outside** the **app,** or **only** if **a** **later** **packet** **wires** **a** **certified** **integration** **with** **explicit** **opt-in** **. **

**Enum:** `PaperworkPrepStage` in `compliance.ts`.

---

## 4. Official form / structure alignment

- **Principle:** **Drafts** should **line**-**up** **field**-**for**-**field** with **SOS** / **FEC** **schedules** **when** we **ingest** **the** **official** **schema** **(JSON** / **XFA** / **field** **list) ** **—** **not** **in** **this** **repo** **as** of **COMP-1** **. **
- **Honesty:** The **current** **RedDirt** **codebase** does **not** **embed** **Arkansas** **Secretary** **of** **State** **filing** **form** **definitions**; **FUND-1** **and** this **doc** **only** **require** that **a** **future** **ingest** **+** **mapping** **layer** **exists** **. **

---

## 5. Governance / risk

- **Draft** **≠** **filed;** **UI** must **not** **hide** the **word** **“** **draft** **).**
- **Confidence** and **missing**-**data** **flags** on **every** **line** that **moves** **to** **review** **.**
- **Legal** / **compliance** **sign-off** on **first**-**use** of **a** **new** **template** **.**
- **Audit** **trail:** **provenance** **(ALIGN**-**1) **; **overrides** **on** **suggested** **categorization** **.**
- **No** **“** **AI**-**certified** **compliant** **”** **badge** **(COMP-1** **) **. **

---

## 6. Next packets

- **COMP-2** — **MVP** **receipt** / **expense** **intake** **table** (narrow) + **link** to **user** / **event** **.**
- **COMP-2** — **Templating** **for** one **federal** or **one** **state** **form** **after** **ingest** of **field** **map** **+** **counsel** **.**
- **COMP-3** — **OCR** + **categorization** **assist** (still **human**-**final) **. **

*Last updated: Packet COMP-1.*
