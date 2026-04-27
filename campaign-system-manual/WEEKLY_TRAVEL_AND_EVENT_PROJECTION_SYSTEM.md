# Weekly travel and event projection system (Pass 3E + Pass 3F addendum)

**Lane:** `RedDirt/campaign-system-manual` · **Markdown only** · **2026-04-27**  
**Public language:** **Campaign Companion**, **Guided Campaign System**, **Organizing Guide**, **Field Intelligence**, **Message Engine**, **Campaign Operating System**, **Workbench**, **Pathway Guide** — not “AI.”

**Honesty:** **Priority scores** are **decision support**, not **predictions**. **Do not** invent **visited** places, **RSVP** counts, or **active** teams. Reconcile **“where** **we’ve** **been”** with **`CampaignEvent`** and/or **explicit** **off-line** **SOP** (strategy manual Part B.4).

---

## 1. Executive summary

Travel and **statewide** **scheduling** must be run as a **system** so **campus**, **NAACP**, **EHC/focus** **categories**, **county** **ladder**, **fundraising**, **house** **parties**, **precinct** **data** **gaps**, and **endorsement/press** **windows** **compound** instead of **colliding**. This document defines **inputs**, **weekly** **projection** **model**, **priority** **scores** (place, county, campus, NAACP, focus category, event, fundraising, travel **cost/ROI**), **redundancy** **guardrails**, **output** **templates** (1-week, 4-week rolling, 12-week **map**), **Workbench** **task** **flow**, **dashboards**, **data** **gaps**, and **Steve** list.

---

## 2. Why travel must be managed as a system

- **Burnout** and **missed** **follow-up** if **stops** are **ad** **hoc** (strategy manual, Part B.4, **road** **ROI**).  
- **Cash** and **miles** are **scarce** — tie **stops** to **ladder** **moves** and **real** **events** on **`CampaignEvent`**.  
- **Calendar**-**driven** organizing prevents **duplicating** **statewide** **festival** **and** **fair** **opportunities** (see **repo** **festival** **ingest** below).

---

## 3. Inputs

| Input | Source / owner |
|-------|----------------|
| **Campaign calendar** | **`CampaignEvent`** in DB + Google sync fields; public `/events`, Calendar HQ admin; **suggest-dates** API for planning. |
| **Statewide / community events** | **`ArkansasFestivalIngest`** → optional **`CampaignEvent` promotion** (schema) — see §4. |
| **Where we have been** | **Steve:** external list; **`CountyCampaignStats.campaignVisits`** (count per county, **not** a per-stop log); **`CampaignEvent`** with **COMPLETED** / past **startAt**; **reconciliation** SOP. |
| **County activation ladder 0–9** | OIS + manual + `FUNDRAISING...` |
| **Campus targets** | `YOUTH_CAMPUS_AND_STUDENT_ORGANIZING_PLAN.md` **table** (status labels). |
| **NAACP branch targets** | `NAACP_AND_COMMUNITY_BRANCH_RELATIONSHIP_PLAN.md` — **NAACP** **branch** **mapping** **required** until mapped. |
| **Extension / focus categories** | `FOCUS_CATEGORY_ORGANIZING_PLAN.md` |
| **Fundraising** | `FinancialTransaction` + **house** **party** **pipeline** |
| **House party** **opportunities** | `WorkflowIntake` / tasks / V.C. |
| **Youth/campus** | Youth plan ladder |
| **Endorsement / press** | `ENDORSEMENT_AND_NATIONAL_ATTENTION_PROGRAM.md` — **compliance** **first** |
| **Precinct data acquisition** | `PRECINCT_PATH_TO_VICTORY...` **flag** for **strategic** **counties** |
| **County party meetings + rural** | `COUNTY_PARTY_AND_RURAL_ORGANIZING_PLAN.md`, `COUNTY_PARTY_MEETING_TOUR_SYSTEM.md` — **75-county** **map,** **priority** **score,** **pairing;** **Pass** **3F** **§22** **below** |
| **Travel cost and mileage** | `FinancialTransaction` (expense) + optional `relatedEventId`; **no** dedicated **`RoadTrip`** model (Part B.4) — **SOP/CSV** for **receipts** **and** **miles** **if** **needed** |

---

## 4. Existing repo support (read-only; Pass 3E documents, does not change code)

| Area | What exists in `RedDirt` (evidence) |
|------|--------------------------------------|
| **`CampaignEvent`** | `prisma/schema.prisma` — `countyId`, `eventType` enum (incl. `FESTIVAL`), `startAt`/`endAt`, `EventWorkflowState`, public site flags, `campaignIntent`, readiness fields, `financialTransactions` relation. |
| **`CountyCampaignStats.campaignVisits`** | Integer on county stats; **count** only — **stale** risk; admin county page has **field** for updates. **Not** a **per-stop** **log** without **`CampaignEvent`** **rows**. |
| **`FinancialTransaction`** | `relatedEventId` **→** **`CampaignEvent`** for **cost** **attribution** (FIN-1 in schema comments). |
| **Public calendar** | `src/lib/calendar/public-events.ts` — `queryPublicCampaignEvents`; `(site)/events` page. |
| **County command** | `CountyCommandExperience` — shows **campaign** **visits** **count** and **upcoming** **public** **events** for county. |
| **Calendar HQ (admin)** | `admin/.../calendar-hq` components — `CalendarCommandView`, `CalendarApprovalBoard`, `EventExecutionPanel` — **week** **view**, **readiness** **strips**. |
| **Planning** | `api/planning/suggest-dates` uses **upcoming** **`CampaignEvent`** to suggest dates. |
| **Fairs/festivals** | `ArkansasFestivalIngest` model, **promote** to **`CampaignEvent`** — **ingested** **community** **events**; **not** a **substitute** for **all** “statewide” **fairs** **if** **ingest** **incomplete**. |
| **Workbench** | **Open-work** + **tasks**; **comms** **mention** `CampaignEvent` in **workflows**; **not** a **dedicated** “travel** **optimizer**” **UI** in **this** **pass**. |

**Gap (honest):** There is **no** **single** **admin** “**where** we’ve been this quarter” **report** **guaranteed** **complete** without **SOP** + **operator** **discipline**; **miles** **and** **per-diems** need **treasurer** **truth** in **`FinancialTransaction`** or **compliance** **spreadsheets**.

---

## 5. Weekly schedule projection model (conceptual)

- **Time** **horizon** **=** **1** week **tactical** (must ship), **4**-**week** **rolling** (capacity and **burn**), **12**-**week** **strategic** **(shape** of **tour**).  
- **Each** **candidate**-**facing** **or** **delegate** **block** has: **objective,** **counties,** **anchor** `CampaignEvent` (or create), **follow-up** **task** **template**, **budget** **line,** **risk** to **KPIs**.  
- **Reconcile** **new** **stops** with **existing** **`CampaignEvent` rows** to avoid **double-booking** and **wasted** **drive** **time**.

---

## 6. Place priority score (composite)

**Concept:** Weighted **sum** (0–100 **normalized** in spreadsheet), **tuned** by Steve/CM. **Not** a **promise** of **outcome**. **Suggested** **weights** (illustrative):

- Strategic **county** value (OIS, base goal alignment) **×** w₁  
- **Ladder** **stage** (lower = higher **need**, **capped** so **GOTV**-**ready** **counties** still get **touches**) **×** w₂  
- **Precinct** data **gap** (Pass 3D **flag** → **higher** if **acquisition** **mission**) **×** w₃  
- **Prior** **visit** **recency** (longer = higher, **max** cap) **×** w₄  
- **Urgency** **window** (EV, registration, **deadline** **event**) **×** w₅  
- **Event** **already** on **calendar** (boost if real **`CampaignEvent`**) **×** w₆  
- **Local** **lead** available (binary or 0–1) **×** w₇  
- **Whether** **visit** **creates** **follow-up** **capacity** (P5, host, **captain** **asks** **pre**-**loaded**) **×** w₈  
- **Travel** **cost** (subtract or divide) from **a** `FinancialTransaction` **+** **mileage** **estimate**  
- **Redundancy** (subtract if **other** **stop** in **same** **county** **this** **7d**)

---

## 7. County visit priority score

- Emphasize **ladder** **+** **county** **goal** (registration, P5) + **EHC/NAACP** **if** in **county** **row**.  
- **Sub-score** = **f(place)** with **county** **as** the **geographic** **unit** of **record**.

---

## 8. Campus visit priority score

- From **youth** **table:** only **target** and **known** **contact** **counties** first; **boost** if **ladder** < **3** and **region** is **C** **+** **N** **(Steve** **baseline) **+ **ramp** **out**.  
- **Penalty** if **status** = **unknown** (forces **research** **task** **before** **burning** **candidate** **time**).

---

## 9. NAACP relationship visit priority score

- **High** if **ladder** **0–2** in **strategic** **county**; **0** if **unmapped** **(mapping** **sprint** **first)**.  
- **See** **§6** for **compositing** with **county** **score**. 

---

## 10. Focus category visit priority score

- **EHC** / **rural** / **veteran** / **small** business **touches** as **separate** **line** on **itinerary** (same day as county if possible) — **saves** **miles** (redundancy rule).

---

## 11. Event opportunity score

- **Public** **`CampaignEvent`** with **festival** or **earned** **press** **hooks**; **ingest** data **quality** **flag** if **festival** **row** is **stale** or **un**-**reviewed**.  
- **De-dupe** **ingest** **vs** **manually** **created** **events** (see **`promotedCampaignEventId` ** on `ArkansasFestivalIngest`).

---

## 12. Fundraising opportunity score

- **Host** **confirmed** > **soft** > **none**; **align** to **$250K** **base** **pace** (strategy **§3**). **Treasurer** **truth** in **`FinancialTransaction`**.

---

## 13. Travel cost / ROI score

- **ROI** **(directional)** = **(directional** **$** **raised** + **vols** **recruited** + **ladder** **moves) **/ **(vehicle** + **hotel** + **time) **. **Not** for **public** **claims** without **compliance** on **$** **disclosure** **rules**.

---

## 14. Redundancy and burnout guardrails

- **Max** **N** **county**-**nights** **or** **miles** **per** **week** (Steve) — **in** `MANUAL_INFORMATION_REQUESTS` §24.  
- **No** **two** **redundant** **“**visibility**-**only**” **stops** in **same** **county** **7d** without **ladder** **or** **follow-up** **reason**.  
- **Buffer** for **emergency** and **sick**; **LQA** **(strategy** **§9) **+ **Part** B.6** **redundancy**.

---

## 15. Weekly schedule output template

```
Week of [date]  |  Primary geographic focus: [region(s)]
Mon [ ] Objective | County | Anchor event (CampaignEvent id/slug) | Lead | $ budget | Ladder target | Follow-up task IDs
Tue [ ]
Wed [ ]
Thu [ ]
Fri [ ]
Sat [ ]  (often: fairs, campus, big events)
Sun [ ]  (often: travel / rest — Steve sets)

KPI: ladder moves planned | $ raised (goal) | intakes (goal) | campus/NAACP/EHC touches (as scheduled)
Risks: | Conflicts w/ public calendar: 
```

---

## 16. 4-week rolling projection template

- **Column** per **week**; **row** = **strategic** **initiative** (campus, NAACP, **EHC** **push**, **house** **party** **sprint**, **precinct** **acquisition** **week**).  
- **End** of **week** 4: **re-score** all **place** **priorities** (§6).

---

## 17. 12-week strategic travel map template

- **Heat**-**light** **table** (internal): **county** **×** **week** **=** **planned** **or** **tentative** **stop** (TBC).  
- **Align** to **OIS** **pilot** **and** **base** **fundraising** **geography** **(Pass** **3B).**

---

## 18. Workbench task flow (SOP)

- **From** a **scored** **stop:** create **`CampaignEvent`** (draft) **→** **approval** path **→** **public** if needed **→** **WorkflowIntake** for **recruitment** and **V.C. **+ **`FinancialTransaction` **(travel) when **funds** **move**.  
- **Intake** **metadata:** `priority_score=`, `place_type=campus|county|naacp|ehc` — **SOP** **naming**, **not** a **code** **change** in **Pass** 3E.

---

## 19. Dashboard requirements (future / spec)

- **Gantt**-**style** view of **CampaignEvent** with **type** and **readiness** **colors**; **overlay** `campaignVisits` **delta** **(manual** **after** **trips) **+ **$** by **county** **(treasurer) **+ **ladder** **row**.  
- **Map** of **4**-**and**-**12**-**week** **TBC** **stops** (operator tool — **not** a **this**-**pass** build).

---

## 20. Data gaps

- **No** **RoadTrip** / **miles** **entity**; **suggest-dates** does **not** **optimize** **routing** (uses **upcoming** **events** **list**).  
- **Campaign** **visits** **integer** is **not** a **log**; **reconcile** with **`CampaignEvent` **and **Steve’s** **“everywhere** **we’ve** **been**” **list** **(strategy** **§23).**  
- **Festival** **ingest** may be **incomplete** for **all** **statewide** **events** **—** **other** **sources** **in** `MANUAL_INFORMATION_REQUESTS` §24.

---

## 21. Steve decision list

- **Source** of **campaign** **calendar** **of** **record**; **how** to **reconcile** **visits** **list**.  
- **Priority** **counties,** **campuses,** **NAACP** **branches**; **soft** **vs** **hard** **caps** on **miles**/**week**. **See** `MANUAL_INFORMATION_REQUESTS` §24.  
- **Pass** **3F —** **county** **party** **/** **rural** **(see** **§22** **+** `MANUAL_INFORMATION_REQUESTS` **§25).**

---

## 22. Pass 3F addendum — County party meetings, rural weighting, 75-county map

**Companions:** `COUNTY_PARTY_AND_RURAL_ORGANIZING_PLAN.md`, `COUNTY_PARTY_MEETING_TOUR_SYSTEM.md`. **No** new **Prisma** **entity** in **Pass** **3F** **—** use `CampaignEvent`, `WorkflowIntake`, **tasks,** **spreadsheets.**

- **Rural** **Arkansas** **is** **a** **first-class** **input** **to** **place** **/** **county** **priority** **scores** **(§5–6):** **boost** **when** **rural**-**priority** **flag** **or** **ladder** **0–2** **(see** **county** **plan** **§3–5,** **tour** **§5).** **Do** **not** **treat** **rural** **stops** **as** **optional** **fill** **ins.**  
- **County** **party** **meeting** **“soon** **within** **T** **days**” **(T** **set** **with** **CM):** **adds** **to** **boost** **terms** **in** **§5** **when** **the** **meeting** **date** **is** **verified** **in** **the** **mapping** **table** **or** in `CampaignEvent` **—** **if** **unverified,** **run** **county** **party** **meeting** **mapping** **required,** **do** **not** **invent** **dates.**  
- **Pairing** **(§6,** **tour** **§6):** **same-day** **or** **same-week** **densification** **—** **county** **meeting** **+** **EHC/Extension/NAACP/campus/fair/house** **party** **when** **mapped;** **reconcile** **so** **candidate** **and** **surrogate** **are** **not** **double**-**booked.**  
- **Follow**-**up** **as** **output** **metric:** **72h** **task** **completion** **after** **a** **meeting** **(tour** **§9–11) **—** **visibility**-**only** **without** a `WorkflowIntake` **row** **or** **ladder** **update** **=** **failed** **stop** **per** **county** **plan** **doctrine.**  
- **UTM** **/** **metadata** **(SOP):** `source=county_party`, `county_slug=…` on `WorkflowIntake` **—** **field** **names** **if** **/** **when** **product** **ships.**

---

**Last updated:** 2026-04-27 (Pass 3E + **3F**)
