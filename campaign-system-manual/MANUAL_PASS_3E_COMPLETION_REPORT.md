# Manual Pass 3E — completion report

**Lane:** `H:\SOSWebsite\RedDirt\campaign-system-manual`  
**Date:** 2026-04-27  
**Pass name:** *Manual Pass 3E — Youth, Campus, NAACP, Extension Homemakers, Focus Categories, and Weekly Travel Projection System*  
**Constraints:** Markdown / manual only; no app code; no DB, auth, migrations, dependencies; no commit.

**Public product vocabulary:** **Campaign Companion**, **Guided Campaign System**, **Organizing Guide**, **Field Intelligence**, **Message Engine**, **Campaign Operating System**, **Workbench**, **Pathway Guide** — not “AI.”

**Honesty:** No invented **named** students, **campus** “active” where only **target**, **NAACP** **branch** names, or **EHC/affinity** “support” without process. **NAACP branch mapping** is a **system action** when unverified. **EHC** stats: **3,200+** members / **320+** clubs (bracket) unless Steve confirms; ADHE: **40+** higher-ed institutions; Extension **offices in all 75 counties** (public references — not “we are in all 75” unless true).

---

## Files created (Pass 3E)

| File | Purpose |
|------|--------|
| `YOUTH_CAMPUS_AND_STUDENT_ORGANIZING_PLAN.md` | Baseline, ladder 0–8, coverage table, playbooks, risks, Steve list |
| `NAACP_AND_COMMUNITY_BRANCH_RELATIONSHIP_PLAN.md` | Relationship-first, visit ladder, mapping **required** action, not assumed endorsement |
| `FOCUS_CATEGORY_ORGANIZING_PLAN.md` | EHC + other categories, maps to message/travel/endorsement process/county |
| `WEEKLY_TRAVEL_AND_EVENT_PROJECTION_SYSTEM.md` | Inputs, scores, templates, **repo** evidence for `CampaignEvent` / visits / finance / festival ingest |
| `MANUAL_PASS_3E_COMPLETION_REPORT.md` | This file |

---

## Files updated (Pass 3E)

- `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md` — **Part** **E** (3E)  
- `FUNDRAISING_AND_VOLUNTEER_ACCELERATION_PLAN.md` — Pass 3E addendum  
- `PAID_MEDIA_AND_LONG_TERM_INFRASTRUCTURE_PLAN.md` — Pass 3E (campus paid, youth social guardrails)  
- `ENDORSEMENT_AND_NATIONAL_ATTENTION_PROGRAM.md` — **youth** quote, campus **approved** only, **NAACP/focus** relationship lanes  
- `PRECINCT_PATH_TO_VICTORY_AND_CANVASSING_PLAN.md` — campus–precinct, youth **canvass** **rules**  
- `SIMULATION_AND_FORECASTING_SYSTEM_PLAN.md` — **§22** Pass 3E models  
- `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` — **§21–24**  
- `MANUAL_BUILD_PLAN.md`, `MANUAL_TABLE_OF_CONTENTS.md`, `WORKFLOW_INDEX.md`, `SYSTEM_READINESS_REPORT.md`  
- (Also `MANUAL_PASS_3C_COMPLETION_REPORT.md` or `MANUAL_PASS_3D` pointer if we add 3E next-pass note — in **build** plan only is enough.)

---

## Design summary (short)

- **Youth/campus** **=** high-focus **ladder** from **3–4** **strong** **Central/NWA** **sites** to **ADHE-scale** **coverage** **ambition**; **all** **campus** **rows** **status**-**labeled** (**active** / **contact** / **target** / **unknown** / **needs** **research**).  
- **NAACP** **=** **map** first; **ladder** **0–8**; **not** **transactional**; **not** **endorsement** from a **meeting**.  
- **Focus** **categories** **=** **EHC** and others as **listening** **+** **service** **+** **category**-**RACI**; **3,200+** / **320+** for internal planning.  
- **Weekly** **travel** **=** **composite** **scores** **+** **reconciliation** of **`CampaignEvent`**, **`CountyCampaignStats.campaignVisits`**, and **`FinancialTransaction.relatedEventId`**.  
- **Calendar**-**driving** = **`CampaignEvent`** + optional **`ArkansasFestivalIngest` ** promotion. 

---

## Repo findings (calendar / events / travel)

- **`CampaignEvent`**: first-class; **county** link, **types** including `FESTIVAL`, **workflow** and **readiness** fields, link to **financial** **transactions** and **festival** **ingest** promotion.  
- **`CountyCampaignStats.campaignVisits`**: **integer** **only**; **shallow** for **tour** **forensics** — **SOP** **+** **events** **needed** for **truth**.  
- **`FinancialTransaction`**: `relatedEventId` for **event**-**tied** **spend** **attribution**.  
- **Public** calendar + **admin** **Calendar** **HQ**; **`suggest-dates`** plans against **upcoming** **events** — **not** a **full** **TSP** **router**.  
- **Festival** **ingest** model exists; **completeness** of **all** **statewide** **events** **not** **guaranteed**.  
- **Gaps** **(honest)**: no **`RoadTrip`**; **miles** **/ **receipts** in **SOP/CSV**; **visit** **int** can **diverge** from **`CampaignEvent` **if **not** **Reconciled**.

---

## Unresolved (Steve)

- `MANUAL_INFORMATION_REQUESTS` **§21–24** in full.  
- **NAACP** **branch** **source** **of** **truth** and **sensitivity** **markings**.  
- **Travel** **caps** and **who** **approves** **changes**.

---

## Next recommended pass

**Manual Pass 4** — **Role** **playbooks**, **training** **modules**, **dashboard** **attachment** (`MANUAL_BUILD_PLAN.md`).

**Pass 4** **depth** order **(27** **—** **see** **`MANUAL_PASS_3F_COMPLETION_REPORT.md` **for** **full** **list):** **extends** the **3E** **23**-**role** **sequence** **below** **with** **four** **Pass** **3F** **roles** **(county** **party** **relationship** **steward,** **rural** **organizing** **lead,** **county** **party** **meeting** **scheduler,** **surrogate** **/** **volunteer** **presenter** **coordinator).**  

**3E** **reference** **list** **(1–23):**  
**1** fundraising lead — **2** paid media / vendor — **3** house party host captain — **4** volunteer coordinator — **5** county coordinator — **6** road team lead — **7** social media lead — **8** Narrative Distribution lead — **9** sign holder captain — **10** Power of 5 leader — **11** future candidate pipeline (scaffold) — **12** campaign manager — **13** candidate — **14** owner — **15** endorsement / relationship program — **16** field manager — **17** voter file / data steward — **18** communications lead — **19** **campus organizing** lead — **20** **youth/student** **coordinator** — **21** **NAACP/community** **relationship** **steward** — **22** **focus** **category** **outreach** lead — **23** **calendar/** **travel** **scheduler** (or **tour/schedule** lead — align title with CM in Pass 4).

---

**Last updated:** 2026-04-27 (Pass 3E)
