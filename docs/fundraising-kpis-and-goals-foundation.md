# Fundraising KPIs and goals — foundation (FUND-1) (RedDirt)

Defines **operational** **goal** and **KPI** **vocabulary** for a **future** **Fundraising** **Desk** so **pacing** and **retros** are **visible** **in**-**app** (not only spreadsheets). **FUND-1** has **no** new **persistence** for **metrics** **—** `FundraisingKpiKey` in `src/lib/campaign-engine/fundraising.ts` only.

**Cross-ref:** [`fundraising-desk-foundation.md`](./fundraising-desk-foundation.md) · `src/lib/campaign-engine/fundraising.ts`

---

## 1. Why KPI tracking must live in the workbench

- **Revenue** is **not** a **comms** **or** **field** **metric** **alone**; **fundraising** **ops** need **a** **single** **surface** to **reconcile** **dollars** **,** **asks** **,** and **time** with **tactics** **(channels** **,** **lists** **,** **events) **.**
- **AI** can **narrate** **gaps** **(pacing** **vs** **goal) **; **it** must **not** **change** **goals** **or** **send** on **its** **own** **(see** `HumanGovernanceBoundary` **,** skills **framework) **.**
- **Candidate**-**time** **efficiency** **(dials** **/** **hour** **,** **meaningful** **conversations) ** is **a** **first**-**class** **KPI** **next** to **dollars** **,** once **dial** **/ call** **logs** **exist** **. **

---

## 2. Core goals (examples)

| Area | Example measures |
|------|------------------|
| **Dollars** | Raised to date; **to**-**goal**; **by** **channel**; **refunds** and **net** (when available) **.**
| **Call** **ops** | **Dials** **/ attempts**; **connects**; **conversations** **>** **N** min **;** **ask** **outcomes** **(when** **captured) **.**
| **Outreach** | **Emails** **sent** (donor-**class** when separated); **SMS** (with **opt**-**in** **truth) **.**
| **Pipeline** | **Meetings** **booked**; **follow**-**ups** **due**; **lapsed** **touches** **.**
| **Conversion** | **Ask**-**to**-**close** for **covered** **cohorts** **(definitions** with **legal) **.**
| **Channel** **performance** | **Cost** **per** **dollar** **(when** **spend** **is** **mapped) **.**
| **Principal** **time** | **Candidate**-**ready** **numbers** used **/ **wasted** **(from** **contactability** **) **.**
| **Quality** **tiers** | **Touches** to **A**-**list** / **B**-**list** **(policy**-**defined) **. **

---

## 3. KPI tiers

- **Daily** — **Pacing** **(burn** down **/ build** up**)** **,** **hot** **lists** **cleared** **,** **call**-**block** **completions** **.**
- **Weekly** — **Channel** **mix**; **revenue** **by** **event** **or** **program** **;** **sprint** **retros** **.**
- **Monthly** and **end**-**of**-**quarter** — **reporting** **adapters** (Finance) **,** **goal** **reset** with **CM** **.**
- **Phase**-**specific** (e.g. **early** **low**-**dollar** **,** **close**) — **milestone** **KPIs** on **a** **timeline** **(future** **config) **. **

---

## 4. AI role (recommend, highlight)

- **Anomaly** **narration** (e.g. “**pacing** **to** **goal** is **X%** **behind** **peer** **cohort** **(if** **benchmark** **ingested) **) **.**
- **List** **suggestions** and **rationale** (never **sole** **sign**-**off) **.**
- **KPI** **alerts** as **advisory** **UI** (no **webhooks** in **FUND-1) **. **

---

## 5. Human governance

- **Goals** and **definitions** of **“raised”** (net vs **gross**, **in**-**kind** **exclusions) ** are **owned** by **CM** + **Finance** **+** **counsel** as **applicable** **.**
- **KPIs** that **affect** **compensation** **or** **public** **claims** get **a** **named** **signer** **(not** the **model) **.**
- **Override** on **suggested** **pacing** or **tactics** should **be** **loggable** (ALIGN-1 pattern) **. **

---

## 6. Next packets

- **FUND-2** — **Persisted** `FundraisingPeriodGoal` (or use **site**-**level** **config** for **MVP) **, **and** **read**-**only** **Rollup** **on** a **skeleton** **page** **.**
- **FUND-2** — **Ingest** **KPI** **definitions** (markdown) for **RAG** **(agent** **explains** **our** **math) **. **

*Last updated: Packet FUND-1.*
