# Fundraising and volunteer acceleration plan (Pass 3B)

**Lane:** `RedDirt/campaign-system-manual` · **Markdown only** · **2026-04-27**  
**Companions:** `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md` (Parts B–F), `SIMULATION_AND_FORECASTING_SYSTEM_PLAN.md`, `PAID_MEDIA_AND_LONG_TERM_INFRASTRUCTURE_PLAN.md` (3C+3E+3F), `ENDORSEMENT_AND_NATIONAL_ATTENTION_PROGRAM.md`, `PRECINCT_PATH_TO_VICTORY_AND_CANVASSING_PLAN.md` (3D+3E+3F), `YOUTH_CAMPUS_AND_STUDENT_ORGANIZING_PLAN.md`, `NAACP_AND_COMMUNITY_BRANCH_RELATIONSHIP_PLAN.md`, `FOCUS_CATEGORY_ORGANIZING_PLAN.md`, `WEEKLY_TRAVEL_AND_EVENT_PROJECTION_SYSTEM.md` (3E+3F), `COUNTY_PARTY_AND_RURAL_ORGANIZING_PLAN.md`, `COUNTY_PARTY_MEETING_TOUR_SYSTEM.md` (3F). **Public** language: **Campaign Companion**, **Guided Campaign System**, **Organizing Guide**, **Field Intelligence**, **Message Engine**, **Campaign Operating System**, **Workbench**, **Pathway Guide** — not “AI” as a public product name.

**Honesty:** All numbers are **directional** or **scenarios** — not guarantees. The **$250,000** by **2026-08-31** **base** goal is the **default** plan; **$500,000** is **stretch** (unlock rule in `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md` §3). **5,000** **active** volunteers by **end** of **August** is an **aggressive** **stretch** that **is** **not** described here as “likely” without **proven** **pace** — it requires **movement**-scale **growth**.

---

## Executive summary

- **Plan** the campaign on **$250k** **raised** by **Aug** **31,** with **$500k** as **stretch** only after **two** **consecutive** **reporting** **periods** **beating** the **relevant** **pace** (treasurer defines **period** with owner). **COH** and **compliance** **govern** **spend**; **narrative** **does** **not** **outrun** **ledger**.  
- **Build** a **wide,** **redundant** **volunteer** **structure** as **default** (**no** **hired** **staff** **assumed**). **As** **many** **titled** **or** **documented** **volunteer** **positions** **as** **sustainable,** with **backups,** so **one** **person** **on** **vacation** **or** **burnout** **does** **not** **zero** a **function**.  
- **Fundraising** and **field** acceleration = **grassroots** ladder: **call** time, **house** parties, **road** / county stops, **P5**, **Message** **Engine** + **Narrative** **Distribution**, donor + volunteer follow-up, all driven through **Workbench** memory (tasks, intakes) when the build supports it.  
- **5,000** **active** **(stretch)** = **~277** **net** **new** **active** **/ week** if **smoothed** over **18** **weeks** **from** **late** **April** — **not** achievable by **form** **signups** **alone;** **requires** **house** **party** **+** **tour** **+** **P5** **virality** in **favorable** **scenarios** **(see** **volunteer** **scenario** **table** in **parent** **manual** **§7).**  
- **Road** **/ travel:** **Use** `CampaignEvent` (with **county,** **location,** **time)** + `CountyCampaignStats.campaignVisits` + `FinancialTransaction` **(category,** `relatedEventId`) to **reconstruct** **ROI**; **off**-**line** / **stale** **“places** **we** **been**” **list** **(Steve)** must **re**-**ingest** into **SOPs** and **optionally** **Prisma** **(manual** **entry** first). **Paid** **travel** is **third**-**largest** **expense** **(Steve) **— **track** in **category** and **tied** **events**.

---

## Baseline (April 27, 2026)

- **~$55,000** **raised,** **~$15,000** **COH,** **spend** on **lift,** **materials,** **visibility,** **road** (qualitative from Steve).  
- **~100** **signups,** **~70** **hub,** **~10** **active;** **4–5** **county** **coordinators.  
- **February** **(Steve):** **~3,200** **miles,** **27** **stops,** **roughly** a **county** **a** **day** (qualitative) — use **as** **pacing** **reference,** not **a** **database** of **truth** **until** **reconciled**.  
- **External** “list of everywhere we’ve been” **not** **fully** **current** in **this** **repo** **(Pass** **3B) **— **reconcile** **in** **ops**.

---

## $250K base and $500K stretch; weekly pacing

| Goal | Remaining (from $55K) | Apr 28 → Aug 1 (96 d) | Apr 28 → Aug 31 (126 d) |
|------|------------------------|------------------------|-------------------------|
| **$250K base** | **~$195,000** | **~$14.2K/week** (range **$13–16K**) | **~$10.8K/week** (range **$9.5–12K**) |
| **$500K stretch** | **~$445,000** | **~$32.5K/week** (range **$30–35K**) | **~$24.7K/week** (range **$22–28K**) |

**Default** to **base** **math**; **unlock** **stretch** **(§3** in **parent** **manual**).

---

## Fundraising flywheel (grassroots)

**One** **loop** **(repeat** per **tour,** per **county,** per **host):**

1. Travel stop (or virtual county touch) → 2. Local story (aggregate; **Narrative** **Distribution**) → 3. Event or house party (scheduled) → 4. Donor ask (compliance) → 5. Volunteer ask (**Pathway** **Guide**) → 6. Power of 5 ask → 7. County captain / coordinator ID (not a dossier) → 8. Next host or tour return → 9. Donor + volunteer follow-up (**Workbench**) → 10. Thank-you + recurring (where permitted).

**If** a **link** **breaks,** the **work** **pools** in **Workbench** **as** `WorkflowIntake` **or** `CampaignTask` **(see** `SYSTEM_CROSS_WIRING_REPORT.md` **).

---

## House party and donor follow-up programs

- **Host** **recruitment** **(volunteer** **role):** “house **party** **host** **captain” **(Part** **B** **/** `CAMPAIGN_STRATEGY` **/ no**-**hired** **list).**  
- **In**-**a**-**box:** **1**-**page** **SOP,** **invite,** **script,** **RSVP,** **follow**‑**up,** **MCE** **this** **week** **theme,** **NDE** **rollout,** **compliance** **on** **paid** **or** **regulated** **asks**.  
- **Donor** **follow**-**up: **48h** **/ **7d** / **30d**; **recurring** **team** (volunteer) + **treasurer** **/ **finance** **helper** **on** **receipts**.

---

## Travel ROI and stop data (Pass 3B — repo)

| Finding | Location | Notes |
|---------|----------|--------|
| **Scheduled** **stops** **/ events** | `prisma` **`CampaignEvent`**: `countyId`, `locationName`, `address`, `startAt`/`endAt`, `eventType` | **Updated** in **app** if **ops** use **workbench;** no **dedicated** **“mileage”** **field** on **event;** use **`FinancialTransaction` `relatedEventId`** for **$** **+** **category** **(e.g. travel)**. |
| Visits count per county | `CountyCampaignStats.campaignVisits` (Int, nullable) | Pipeline-style field; may be stale; not a per-stop log by itself. |
| **Spend** / **reimbursement** | `FinancialTransaction` (EXPENSE, **category** **string) **+ **optional** `relatedEventId` | **Third**-**largest** **spend** **(paid** **travel) **— **model** as **line** **items**; **compliance** **on** **authorizing** **(MANUAL** **requests) **. |
| **OIS** **/ county** **UI** | `CountyCommandExperience` — **“Campaign** **visits**” **score** **+** “latest** **visit**” **post** | **Public** **UX** **wires;** **operator** must **update** **content** and **stats**; **“not** **updated**” **(Steve) **= **provenance** **risk. |
| **Missing** in **product** **(gap)** | **Dedicated** **“road** **segment”** (mile, **receipt** **per** **tank) **| **SOP** in **simulation** as **assumption**; **optional** **future** `TravelSegment` or **spreadsheet** **export** to **ingest. |

**Recommended** **next** **(manual,** not **code** **in** **Pass** **3B):** (1) **Reconcile** **external** **stop** **list** **to** `CampaignEvent` + **or** **CSV** **+** `CountyCampaignStats` **(human);** (2) **Tag** **travel** **expenses** in **`FinancialTransaction.category`;** (3) **define** **event** **outcome** **report** **(paper** or **intake) **per **stop**.

---

## Volunteer growth and 5,000 target

See `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md` **§7** **(Floor** 250, **Base** 1,000, **Momentum** 2,500, **Stretch** 5,000) **+** **linear** **~277** **active**/week **impossibility** **without** **scale** **mechanics**.

---

## County activation ladder (0–9)

| Stage | Name | Required action (examples) | Owner (typical) | Dashboard / surface | KPI (examples) | Manual / training | Workbench / queue | Advance to next when |
|-------|------|----------------------------|-----------------|----------------------|-----------------|------------------|--------------------|------------------------|
| **0** | No contact | — | — | OIS “cold” or blank | n/a | n/a | n/a | Form / intro |
| **1** | Contact ID’d | **One** **named** person | V.C. / field | County page + intake | # contacts | `roles` brief | `WorkflowIntake` | Responds to ask |
| **2** | Volunteer active | 30d/14d “active” (SOP) | V.C. | Personal / hub | **Active** = 1+ action | **Organizing** **Guide** | Tasks | Sustains |
| **3** | County coord ID’d | **Commitment,** not title theater | CM / region | OIS, county | Has CC **or** **deputy** | **County** **leader** **manual** | **Approval** for **map** | **2**-deep **RACI** (Part B) |
| **4** | Event held | `CampaignEvent` or logged | **Event** / **field** | Events, OIS | Attendance, **dollars** (private) | **Event** lead | **Comms,** follow-up | Debrief + ask |
| **5** | House party sched | Dated, host named | **Host** **captain** | Comms, calendar | # hosts / Q | **MCE** + **SOP** | **Comms** **queue** | Complete + stories |
| **6** | P5 team active | P5 started / complete (product TBD) | P5 / leader | Leader dash | P5 state | P5 + **Pathway** | Tasks | 5 complete or on track |
| **7** | Sign/visibility | Captain + plan | Sign captain, county | County, tasks | Coverage proxy | **Sign** **workflow** | **Tasks** + **safety** | Legal OK |
| **8** | GOTV captain | Named + training path | **GOTV** lead | **GOTV** (verify depth) | Contact capacity | **GOTV** ch. | **GOTV** **tasks** | EV window approaches |
| **9** | County **cell** | **2**+ on **RACI,** OIS true | **CM** + **regional** | OIS, **Workbench** | **Ladder** **roll-up** + **readiness** | All **relevant** | **RACI** + **triage** | **GOTV/ED** **ready** (phase) |

---

## No-hired-staff structure and roles (redundant by design)

**Principle:** **Build** as **if** **no** one **is** there; **treat** **momentum** as **head** **start** on **filling** **roles,** not **a** **shorter** **ramp** **(unless** **Steve** **says) **. **Every** **function:** **lead,** **backup,** **bench;** every **county: **at** **least** a **point** person** **(deputy** **if** **possible) **. **Work** **benches** **(Workbench) **+ **manuals** **(roles/*) **survive** **turnover** **(see** `CAMPAIGN_STRATEGY` **Part** **B.6) **.  

**Position** list (all **default** to **volunteer**-**stewarded,** **RACI** to **owner/CM/ treasurer** for **$** and **contrast) **: fundraising **captain,** **house** **party** **host** **captain,** **county** **coordinator,** **county** **deputy,** **precinct** **captain,** **sign** **holder** **captain,** **event** **lead,** **road** **team** **lead,** **merch/materials,** **social** **lead,** **story** **collector,** **message** / **Narrative** **Distribution** **support,** **volunteer** **follow**‑**up,** **data** **steward,** **compliance** **liaison,** **finance** **helper,** **GOTV** **lead,** **Election** **Day** **precinct** **lead. **(Align** **with** `ROLE_MANUAL_INDEX.md` **+** **Pass** **4** **deeper** **chapters) **.  

---

## Redundant human network (summary)

- **No** **single**-**string** org chart. **2**-deep **on** every **outward**-**facing** **tollgate** (comms, **contrast,** **export,** **big** $).  
- **Downgrade** not **dismiss: **burnout** **=** **reduce** **scope,** **keep** **in** **Pathway,** not **shame. **- **Workbench** **+** `CampaignTask` **+** `WorkflowIntake` = **continuity** **(see** `open-work` **+** **CROSS** **WIRING) **.  

---

## Dashboard and simulation (inputs)

- **Fundraising** **lead:** week-to-goal, **$** by **tranche,** **party** count, **donor** **stages,** **follow**‑**up** **age. **- **Owner/CM:** same **+** **stretch** **unlock** **flag** **(manual) **+ **county** **ladder** **roll-up. **- **Sim** **(see** `SIMULATION_AND_FORECASTING_SYSTEM_PLAN.md` **Pass** **3B) **: **base,** **stretch,** **5k** **volunteer,** **road** **ROI,** **ladder,** **redundancy** **index,** **burnout** **risk,** **pace** **triggers**. **

---

## Risks (Pass 3B)

- **Announcing** **5,000** **active** as **a** **promise** in **public. **- **Over**-**funding** **narrative** **(stretch) **before **two**-**period** **unlock. **- **One** **hero** **volunteer** per **function** (no** **backup) **- **Stop** list **+** **ledger** **out** **of** **sync** **(Field** **Intelligence** **and** **finance** **disagree) **- **P5** and **OIS** **demos** read **as** **live** **(see** `SYSTEM_READINESS_REPORT.md` **) **.  

---

## Decisions Steve must make

- **Active** **definition** **(14d** **vs** **30d) **+ **SOP. **- **Fundraising** **“reporting** **period”** for **2**-**consecutive** **week** **unlock** **(with** **treasurer) **. **- **Reconciliation** of **“places** **we’ve** **been”** **to** `CampaignEvent` / **or** **explicit** **manual** **only** for **H1** **(before** **product**). **- **What** **public** line **(if** **any) **on** **5,000** **—** default **=** **internal** **stretch** only. **- **Counties** in **Q2** **pilot** **+** **order** (see `MANUAL_INFORMATION_REQUESTS` **) **.  

---

## Pass 3C — APA vendor channel, paid social, and media feeding the ladder

**Standalone** **chapter:** `PAID_MEDIA_AND_LONG_TERM_INFRASTRUCTURE_PLAN.md` **(governance,** **phases,** **KPIs,** **Workbench** **flow,** **2028/2030** **doctrine).**

- **Arkansas** **Press** **Association** **(APA) ** **as** **planned** **vendor** **/** **channel** **for** **social,** **digital,** **radio,** **TV** **(if** **budget),** **paper,** **paid** **PR** **—** **price** **sheet** **pending** **(Steve);** **all** **in** **finance** **+** **compliance** **paths**.  
- **Paid** **social** **ramp** **:** **test** **→** **scale** **with** **weekly** **review;** **never** **replace** **relational** **layer** **(V.C.,** **host** **captain,** **county** **coord).**  
- **Paid** **media** **feeding** **house** **parties** **:** **boost** **+** **host** **follow**‑**up** **within** **48h;** **empty** **RSVP** **=** **failed** **buy** **(manual** **review) **.  
- **County** **activation** **ladder** **(0–9) **: **paid** **can** **accelerate** **stages** **1–5** **only** **if** **follow**‑**up** **exists** **—** **otherwise** **it** **inflates** **OIS** **without** **truth**.  
- **Volunteer** **recruitment** **:** **tag** **paid** **vs** **organic** **leads** **;** **different** **onboarding** **cadence** **(see** **that** **chapter** **§8).**  
- **Fundraising** **:** **paid** **donation** **asks** **governed** **by** **base** **/** **stretch** **pace** **(strategy** **manual** **§3) **—** **no** **stretch**-**level** **paid** **blast** **before** **unlock** **without** **treasurer** **+** **owner**.  
- **Spend** **discipline** **:** **COH** **floor,** **APA** **invoice** **match** **to** **`FinancialTransaction` **when** **used** **in** **ops**.

---

## Pass 3D — Endorsements, national attention, precinct path (addendum)

**Chapters:** `ENDORSEMENT_AND_NATIONAL_ATTENTION_PROGRAM.md`, `PRECINCT_PATH_TO_VICTORY_AND_CANVASSING_PLAN.md`.

- **Endorsement announcements → fundraising:** Use **directional** lift ranges in simulation only; tie **receipt** dates to **announce** dates in **treasurer** **view** (manual or future **metadata**). **No** **public** **claim** that an **endorsement** “**will**” **raise** **$X**.  
- **Endorsement → volunteer recruitment:** National or state visibility should feed V.C. and house-party host pipeline within 48–72h (SOP in endorsement chapter); empty follow-up = failed moment.  
- **National endorsements → house party hosts:** Message Engine + Narrative Distribution wave per endorsement type; county coordinator assigns follow-up against the ladder.  
- **Press releases (paid or earned) → county activation ladder:** Map each major announce to true ladder stage moves (event, host, P5) — do not inflate OIS without field truth.  
- **Paid media (Pass 3C) + endorsements:** Boost only approved creative; UTM `endorsement_*` on forms; spend governed by base/stretch pace (`CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md` §3).  
- **Precinct path / canvass:** County first; do not assume precinct-level vol/fundraising impact without data acquisition SOP for priority counties (`PRECINCT_PATH_TO_VICTORY_AND_CANVASSING_PLAN.md`).  

---

## Pass 3E — Youth/campus acceleration, EHC/focus lanes, travel feeding the flywheel

**Chapters:** `YOUTH_CAMPUS_AND_STUDENT_ORGANIZING_PLAN.md`, `FOCUS_CATEGORY_ORGANIZING_PLAN.md`, `WEEKLY_TRAVEL_AND_EVENT_PROJECTION_SYSTEM.md`.

- **Youth/campus volunteer acceleration:** Prioritize **known** **Central/NWA** campuses first; scale to **statewide** **coverage** **ambition** only with **field** **truth** and **status** **labels** on the campus table — **not** OIS “heat” without bodies. P5 and **host** asks at every real campus event.  
- **Campus house parties and student events:** `CampaignEvent` + follow-up; lift to dollars and actives when debriefs exist; no ghost RSVPs (same discipline as 3C paid + parties).  
- **Campus-to-county volunteer lift:** Campus captain ↔ county coordinator; **ladder** **7–8** in youth plan = **documented** **handoff** to **P5,** **sign,** **GOTV** **(age-appropriate).**  
- **Extension Homemakers / focus category relationship lane:** Non-transactional first; EHC and rural/caregiver hooks in counties with fairs and Extension-adjacent touches — do not assume EHC is a monolith (see focus plan).  
- **Travel projection** feeding fundraising and volunteer acceleration: 4-week and 12-week maps in travel doc; place priority scores stack with base pace (strategy manual §3); miles and dollars from `FinancialTransaction` + `CampaignEvent` (strategy Part B.4).  

**Companions (3E):** `NAACP_AND_COMMUNITY_BRANCH_RELATIONSHIP_PLAN.md` (relationships may unlock local hosts and events when governed, not assumed).  

---

## Pass 3F — County party and rural meeting tour feeding dollars and actives

**Chapters:** `COUNTY_PARTY_AND_RURAL_ORGANIZING_PLAN.md`, `COUNTY_PARTY_MEETING_TOUR_SYSTEM.md`.

- **County party** **stops** **(mapped** **meetings)** **=** **recruitment** **+** **ask** **venues** **under** **treasurer** **rules** **—** **not** **assumed** **endorsement** **or** **D-turnout** **guarantee.** **Tag** **attributable** **intake** **/** **$** **with** **`source=county_party`** **(SOP).**  
- **Rural** **counties** **in** **the** **tour** **increase** **house** **party** **and** **coordinator** **prospect** **pipeline** **when** **48–72h** **follow**-**up** **exists** **—** **applause**-**only** **does** **not** **count** **as** **acceleration.**  
- **Pair** **meeting** **nights** **with** **travel** **and** **paid** **earned** **local** **touch** **per** **`WEEKLY_TRAVEL_AND_EVENT_PROJECTION_SYSTEM.md` §22** **+** **`PAID_MEDIA_AND_LONG_TERM_INFRASTRUCTURE_PLAN.md` §15.**

---

## Pass 3G — Structured call time, drive-time calls, visibility lanes, **proposed** ambassador model, list-driven asks

**Chapters:** `CALL_TIME_AND_CANDIDATE_FUNDRAISING_EXECUTION_PLAN.md`, `POSTCARDS_SIGNS_BANNERS_AND_VISIBILITY_FUNDRAISING_PLAN.md`, `GRASSROOTS_FUNDRAISING_AMBASSADOR_AND_COMMISSION_MODEL.md`, `CONTACT_LIST_INTAKE_AND_RELATIONSHIP_DATABASE_PLAN.md`, `IMMERSION_STOPS_AND_LOCAL_HOST_SYSTEM.md` (as relevant).

- **Structured** **call** **time** **(candidate):** **drive-time** where **safe** **+** **practical;** **one** **recurring** **after-work** **evening** **/ week** (CM/treasurer); see `CALL_TIME...` **+** `MANUAL_INFORMATION_REQUESTS` **§**28.  
- **Postcards,** **yard** **signs,** **3×6** **/ 4×8** **banners,** **billboard**-**style** **\—** **sponsor** **ask** **lane** (treasurer) **+** **MCE/NDE** **(copy);** **\~$200** **banner** **as** **planning** **bracket,** **not** a **signed** **price** **(verify).**  
- **Grassroots** **fundraising** **ambassador** **/** **incentive: **\—** **proposed** **\—** **pending** **treasurer,** **counsel,** **Arkansas** **finance** **review;** **no** **operational** **commission** **until** **signed** \— `GRASSROOTS_...`  
- **County** **party** **contact** **list** **\→** **warm** **Dem** **\→** **asks** only **with** **consent** **/ provenance** **\—** `CONTACT_LIST...` **+** `MANUAL_INFORMATION_REQUESTS` **§**26.  
- **Event** **host** **+** **immersion** **stops** **\→** **house** **party** **/ donor** **follow-up: **\—** `IMMERSION_...` **+** **3F** **tour** **discipline.**

---

## Pass 3H — Database financial records, weekly raises, early spend lanes

**Chapter:** `FINANCIAL_BASELINE_AND_BUDGET_CALIBRATION_PLAN.md` **+** `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` **§**36**.**

- **Database** **`FinancialTransaction`** **(CONFIRMED)** **supersedes** **rough** **narrative** **estimates** **in** **this** **plan** **and** **strategy** **§2** **where** **they** **conflict** **—** **DRAFT** **rows** **are** **not** **operational** **truth** **until** **confirmed** **(see** **`truth-snapshot` / `budget-queries`).**  
- **Fundraising** **progression** **should** **be** **charted** **by** **week** **(or** **treasurer** **reporting** **period)** **using** **reconciled** **inflows** **—** **not** **a** **single** **flat** **rate** **from** **startup** **to** **August.**  
- **Last** **three** **weeks** **acceleration** **should** **be** **modeled** **as** **its** **own** **segment** **(higher** **/ lower** **/ flat** **weekly** **raise)** **vs** **early** **baseline** **—** **do** **not** **annualize** **a** **lump** **or** **one**-**off** **event** **week.**  
- **Early** **spend** **categories** **(mapped** **to** `CostBearingWireKind` **via** `FinancialTransaction.category`) **inform** **next** **asks** **and** **budget** **lanes** **(see** `FINANCIAL_BASELINE_AND_BUDGET_CALIBRATION_PLAN.md` **§7** **and** **§**10**–**16**).**

**Last updated:** 2026-04-28 (Pass 3B + 3C + 3D + **3E** + **3F** + **3G** + **3H**)
