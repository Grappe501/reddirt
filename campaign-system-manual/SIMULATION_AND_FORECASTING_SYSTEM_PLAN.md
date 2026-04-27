# Simulation and forecasting system — plan (future build)

**Lane:** `RedDirt/` (design only)  
**Date:** 2026-04-27  
**Status:** **Manual Pass 3** + **3B** + **3C** + **3D** + **3E** — **not** application code. **No** “prediction certainty.” Use: **forecast**, **scenario**, **projection**, **readiness model**, **simulation** (private/staff). **Public** product language: **Campaign Companion**, **Guided Campaign System**, **Field Intelligence** — not “AI” as a brand for this layer.

---

## 1. Purpose

Give **CM**, **owner**, and **leads** a **shared, honest** way to:
- run **ranged** scenarios (fundraising, volunteers, county activation, GOTV) against **documented assumptions**;
- see **readiness** move when **inputs** change (not magic — **rules** + **human** approval for sensitive actions);
- attach outputs to **dashboards** and **task** creation in the **Workbench** (future) without auto-executing law, money, or contrast strategy.

## 2. What it should forecast (targets)

- **Fundraising** cash trajectory vs goal bands (week/month)  
- **Volunteer** funnel: signups → hub → **active** (definitions fixed in assumptions registry)  
- **P5**: teams “complete” / on track (when product has graph)  
- **County** activation: coordinator bench, event density, **Field Intelligence** gap vs peer  
- **GOTV** program readiness: contact capacity vs target coverage (not individual voter propensity in public)  
- **ED** “pressure” model: **operational** load, not “win probability” as pseudo-science

## 3. What it must never claim

- **Certainty** of outcome, **exact** final vote, or **undisclosed** microtargeting to volunteers  
- “The model says we **will** win **county** X” without human narrative + sourcing  
- Replacement for **compliance**, **treasurer**, or **counsel** on finance/legal

## 4. Inputs

- **Financial:** cash on hand, burn categories, **goals** — **$250,000** base by **2026-08-31** and **$500,000** stretch (Pass 3B; stretch unlocked only per pace rule in `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md` §3).  
- **People:** signups, hub membership, **active** count (SOP: **14d** or **30d**), P5 where available; **5,000** active by **Aug 31** is a **model stretch only**, not a default assumption.  
- **Field:** events; county leads; sign coverage; **county ladder stage 0–9** (Pass 3B); road/tour from `CampaignEvent` and/or SOP; travel **$** from `FinancialTransaction` (category) and optional `relatedEventId`.  
- **Comms/NDE:** **Message Engine** and **Narrative Distribution** “shipped this week” (manual or telemetry).  
- **Time:** election calendar, EV window, **reporting cadence** (must match **two**-consecutive-**week** stretch assessment).

## 5. Outputs

- **Scenario** tables: **low / base / high** or named scenarios (e.g. Conservative, Momentum)  
- **Readiness** scores **0–100** (or 0–6 mapped) **per** layer with **explanation** strings (“why this moved”)  
- **Suggested** `CampaignTask` or **RACI** handoff (future) — **always** with **lowest qualified approver** rule for execution

## 6. Baseline metrics (anchoring)

- Use point-in-time snapshots from `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md` §2 (April 27, 2026) **+** Pass 3B: **$250K** base / **$500K** stretch, **5K** active **stretch** (not default), no-hired-staff default — see `FUNDRAISING_AND_VOLUNTEER_ACCELERATION_PLAN.md`. Re-baseline when treasurer updates cash or V.C. updates **active** definition.

## 7. Fundraising forecast model (conceptual)

- **Inputs:** `r_week[]` (historical or scenario weekly raise), `Burn_week[]`, **goals: **$250K** **base** and **$500K** **stretch** **(Pass** **3B) **, `T` weeks, **and** a **Boolean** or **tranche** **state** for **“stretch** **eligibility”** (after two consecutive reporting periods **at** or **above** **stretch** **pace) **(manual** **+** **treasurer) **- **Output:** **range** of ending cash, **implied** weekly need **per** **goal**, **sensitivity** to a bad week  
- **Not:** Bank integration truth — **ledger** in `FinancialTransaction` is operational record when used

## 8. Volunteer growth model

- **Funnel** states: `signup` → `hub` → `active` (define **14d** or **30d** — Pass 3B) → `P1` / `P5` paths  
- **Scenarios (Pass 3B):** Floor / Base / Momentum / Stretch (5,000) — see parent manual **§7**; **treat** **5,000** as **aggressive** **simulation** **ceiling,** not “likely” **out** **of** the **box**  
- **Conversion** **rates** as **assumptions** (not constants forever); **seasonal** multipliers; **house** **party** and **P5** **multipliers** in **favorable** **counties** **(ranges) **

## 9. Power of 5 growth model

- **Stocks** (how many P5s “complete” per month) and **flows** (invites, stale invites) when Prisma product exists  
- Until then: **proxy** = tasks + P5 page completions + V.C. counts

## 10. County readiness model

- **Per county:** bench (T/F or 0–3), event cadence, **OIS** **honest** data completeness, **narrative** **gap** flag from NDE (when live) **+** **ladder** **stage** **0–9** (Pass 3B: “County **Activation** **Ladder**” in `FUNDRAISING_AND_VOLUNTEER_ACCELERATION_PLAN.md`)

## 11. GOTV readiness model

- **Capacity:** volunteer hours, dialable doors (under policy), text program **status** (compliance)  
- **Gaps** → **suggested** task types (human creates task)

## 12. Election Day pressure model

- **Not** a vote model for public. **Internal:** **incident** queue depth, **comms** **approval** backlog, **ride** / **VBM** help queue — **all** with **RACI**

## 13. Confidence levels

- Every forecast row: **Low / Med / High** **confidence** based on data freshness and sample size (e.g. 8 weeks of fundraising vs 2)

## 14. Human approval gates

- **Any** new **contrast** claim, **spend** class, **export**, **GOTV** text script change — not auto from simulation

## 15. Dashboard integration (future)

- OIS/region/county: **readiness** strip + “what changed this week” (aggregate)  
- **Workbench** widget: “scenario X implies **N** new **V.C.** **tasks** this week (suggest only)”

## 16. Future data model needs (non-destructive list)

- `CampaignAssumption` (versioned JSON), `ScenarioRun` (input hash, output snapshot), `ReadinessScore` (entity × week × layer)  
- **Optional** link to `WorkflowIntake` for “**why** this task was suggested” (audit)

## 17. Required manual updates

- This file + `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md` when Steve updates baseline; **no** PII in examples

## 18. Build roadmap

1. **Phase A:** **Spreadsheet** + SOP in **manual** (no code)  
2. **Phase B:** Read-only **admin** page with **assumption** registry and saved scenarios  
3. **Phase C:** Suggested tasks with explicit opt-in; **no** auto-send of comms  
4. **Phase D:** Telemetry from **MCE/NDE** and **GOTV** for automated **inputs** where quality allows

## 19. Pass 3B extensions (manual-only design)

- **$250K** base / **$500K** stretch goals and **unlock** logic in assumptions registry.  
- **5,000** active volunteer **stretch** (scenario only; definition with V.C.); Floor/Base/Momentum/Stretch table in parent manual **§7**.  
- **Road** / travel **ROI** model: inputs from `CampaignEvent`, `FinancialTransaction` (+ `relatedEventId`), `CountyCampaignStats.campaignVisits`; no dedicated `RoadTrip` / mileage model in Prisma (documented in strategy manual Part **B.4**).  
- **House** party **growth** model: hosts/month, conversion to **$** and to **actives** (ranges, not one number).  
- **No-hired-staff** capacity: volunteer hours as FTE-like **load**; **redundancy** index (% key functions with named backup) — conceptual.  
- **Pace-change** triggers: e.g. move scenario from Base to Floor after two **missed** **periods**; re-lock stretch per treasurer + owner.  
- **Burnout** **risk** score (conceptual): WIP, unfilled backups, time-in-triage; self-report; never for public shaming.  
- Narrative and SOP: `FUNDRAISING_AND_VOLUNTEER_ACCELERATION_PLAN.md`.  
- **Redefines** what older Pass 3 docs may have called a single $500K goal: **base** is $250K by Aug 31; **stretch** is $500K with unlock.

## 20. Pass 3C extensions (paid media, APA vendor, 2028/2030 infrastructure)

**Manual** **source:** `PAID_MEDIA_AND_LONG_TERM_INFRASTRUCTURE_PLAN.md`. **No** **code** in **Pass** **3C**; **no** **invented** **prices** **—** **APA** **price** **sheet** **=** **placeholder** **in** **assumptions** **until** **Steve** **provides** **numbers**.

| Model element | Inputs / notes |
|---------------|----------------|
| **Paid** **media** **spend** | Weekly **by** **channel** **(social,** **digital,** **radio,** **TV,** **paper,** **PR) **; **capped** **by** **finance** **+** **base/stretch** **unlock** **(§3** **strategy** **manual) **|
| **APA** **vendor** **price** **sheet** | **Pending** **—** **assumption** **row** **“**TBD**” **per** **line** **item** **when** **running** **scenarios** |
| **Channel** **ROI** **(projection)** | **Ranges** **only** **: **$** **raised,** **signups,** **RSVPs** **per** **$** **spent** **by** **channel** **(when** **telemetry** **exists) **|
| **Cost** **per** **volunteer** **signup** | **Paid**-**sourced** **only;** **separate** **from** **organic** **(see** **Volunteer** **growth** **model) **|
| **Cost** **per** **active** **volunteer** | **After** **SOP** **14d/30d** **window;** **higher** **than** **organic** **in** **most** **realistic** **scenarios** |
| **Cost** **per** **donor** | **Paid** **donation** **flow** **only;** **compliance** **on** **disclaimers** **(not** **modeled** **as** **legal** **truth) **|
| **Cost** **per** **event** **RSVP** | **Tag** **paid** **boosts** **to** **`CampaignEvent` **where** **possible** |
| **Paid**-**to**-**active** **conversion** | **Funnel** **: **signup** **→** **hub** **→** **active** **stratified** **by** **source**=**paid_* **(assumption) **|
| **County** **team** **formation** | **Ladder** **moves** **attributed** **(partially) **to** **paid** **+** **follow**‑**up** **quality** **—** **ranges,** **not** **attribution** **certainty** |
| **2028** **/** **2030** **infrastructure** **carryover** | **Stocks** **: **trained** **leaders,** **named** **county** **bench,** **P5** **teams** **persisting** **—** **scenario** **only;** **no** **guarantee** **of** **candidacies** |
| **Candidate** **pipeline** **model** | **Counts** **of** **readiness** **stages** **(opt** **in) **—** **internal** **only** |
| **Uncontested**-**seat** **coverage** **model** | **Aggregate** **gap** **map** **by** **office** **type** **if** **data** **exists** **later** **—** **directional** **“**miles** **to** **go**” **not** **prediction** **of** **fill** |

**Burnout** **/** **redundancy** **(3B)** **still** **apply** **; **add** **paid**-**ops** **load** **on** **single** **volunteer** **“**vendor** **liaison**” **as** **risk** **if** **unbacked**. **

## 21. Pass 3D extensions (endorsements, national attention, precinct / canvass)

**Manual** sources: `ENDORSEMENT_AND_NATIONAL_ATTENTION_PROGRAM.md`, `PRECINCT_PATH_TO_VICTORY_AND_CANVASSING_PLAN.md`. **All** **directional;** **no** **invented** **endorsers** or **precinct** **turnout** **predictions** in **public** **copy.**

| Model element | Notes |
|---------------|--------|
| **Endorsement momentum (projection)** | Count of prospects by stage, recent moves, **not** a “win” score. |
| **National attention (projection)** | Earned + paid **announce** volume, alignment to MCE/NDE **waves** (manual). |
| **Endorsement → fundraising lift** | **Assumed** **ranges** only, tagged **low** confidence until receipt data ties to announcement dates. |
| **Endorsement → volunteer lift** | Tag paid vs organic; compare conversion **ranges** in funnel (14d/30d active). |
| **Precinct data completeness** | Per county: **%** of strategic precincts with **usable** key + fresh import, or **null** = **0** (forces county-only model in scenario). |
| **County path-to-victory (readiness)** | Aggregate: ladder + capacity + $ + OIS honesty; **narrative** required — no “we win” claim. |
| **Precinct path-to-victory (readiness)** | Only when completeness > threshold in assumptions; else **degraded** to county rollup. |
| **Canvassing capacity** | Volunteer hours, pairs, shifts vs. doors target (policy universe — counsel-defined in assumptions, not the manual). |
| **Walk-list completion** | **Staff**-only proxy: % of assigned turf with debrief; **not** a public stat. |
| **GOTV precinct readiness** | Contact capacity vs. policy target at precinct where data exists. |

**Gaps** **(repo** **/ **readiness) **: **dedicated** **endorsement** **entity** not **in** **Pass** **3D** **scope;** **OIS** / **GOTV** **/ **field** **UI** **depth** may **not** **match** **this** **design** **—** **see** `SYSTEM_READINESS_REPORT.md` **. **

## 22. Pass 3E extensions (youth, campus, NAACP, focus categories, travel)

**Manual** sources: `YOUTH_CAMPUS_AND_STUDENT_ORGANIZING_PLAN.md`, `NAACP_AND_COMMUNITY_BRANCH_RELATIONSHIP_PLAN.md`, `FOCUS_CATEGORY_ORGANIZING_PLAN.md`, `WEEKLY_TRAVEL_AND_EVENT_PROJECTION_SYSTEM.md`. **All** **directional;** **no** **invented** **campus** “active” **counts,** **NAACP** **branches,** or **EHC/affinity** “support** **rates.”

| Model element | Notes |
|---------------|--------|
| **Campus activation** | **Count** of campuses by **ladder** **0–8;** % **unknown/needs** **research;** not a “**win**” **score. |
| **Youth volunteer growth** | Funnel: student intake → **active** (SOP) → P5 / county roles; **stocks** and **flows** with **safety** **constraints** on **assumptions**. |
| **Campus-to-county conversion** | Rate of **ladder** **7+** in **a** **county** per **quarter;** **handoff** **quality** as **subjective** **input. |
| **NAACP relationship stage** | **Distribution** of **ladder** **0–8** **(see** **NAACP** **plan);** **null** = **unmapped** **(mapping** **sprint** **not** **done) **. |
| **Focus category relationship stage** | **Index** of **touches** or **ladder** **moves** **per** **category** **(internal);** **low-N** **suppression** in **public. |
| **Weekly travel projection** | **1**-**/ **4**-**/ **12**-**week** **templates;** **priority** **scores** **(not** **auto**-**routed) **+ **burnout** **/ **miles** **limits** (Steve). |
| **Schedule ROI (directional)** | **(Fundraising** **+** **ladder** **moves** **+** **intakes) **/ **(travel** **$** + **time) **; **receipts** in **`FinancialTransaction` **when** **used. |
| **Event opportunity (statewide + ingested)** | **Count** of **real** `CampaignEvent` **+** **festival** **ingest** **rows** per **region**; **incomplete** **ingest** = **low** **confidence. |
| **Statewide event prioritization** | **Event** **score** **stack** **(§** **11** **weekly** **travel) **+ **geography;** not **a** **substitute** for **CM** **judgment. |

**Gaps:** **No** **dedicated** **Campus** or **NAACP** **Prisma** **entity** in **Pass** **3E** **(process** / **SOP** **+** **metadata) **. **Festival** **ingest** may **not** **cover** **all** **statewide** **events** **(see** `WEEKLY_TRAVEL...` **§20) **. 

## 23. Pass 3F extensions (county party meetings, rural weighting, 75-county map)

**Manual** **sources:** `COUNTY_PARTY_AND_RURAL_ORGANIZING_PLAN.md`, `COUNTY_PARTY_MEETING_TOUR_SYSTEM.md`, `WEEKLY_TRAVEL_AND_EVENT_PROJECTION_SYSTEM.md` §22. **Directional;** **no** **invented** **meeting** **dates,** **chairs,** or **rural** **“activation”** **without** **field** **truth.**

| Model element | Notes |
|---------------|--------|
| **County party meeting mapping completeness** | **%** **of** **75** **counties** **with** **verified** **next** **meeting** **(or** **explicit** **TBD+owner);** **0** = **high** **uncertainty** **in** **tour** **scenarios.** |
| **Rural** **tour** **/ **ladder** **moves** | **Stack** **rural** **priority** **with** **county** **ladder** **0–9;** **separate** **from** **generic** **“events** **count**.” |
| **72h** **follow**-**up** **rate** **(meetings)** | **%** **of** **attended** **meeting** **stops** **with** **closed** **Workbench** **task** **+** **intake** **within** **72h;** **process** **quality** **input.** |
| **County** **party** **+** **P5** **/** **$** **attribution** | **Rough** **tags** **only** **(`source=county_party`);** **not** **a** **claim** **of** **isolated** **ROI.** |

**Gaps (3F):** **No** `CountyParty` **or** **dedicated** **meeting** **log** **model;** **SOP** **+** `CampaignEvent` **+** **spreadsheets.**

**Last updated:** 2026-04-27 (Pass 3 + 3B + 3C + 3D + **3E** + **3F**)
