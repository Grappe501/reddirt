# Interactive strategy Workbench, scenario sliders, and KPI impact modeling

**Lane:** `RedDirt/campaign-system-manual`  
**Status:** **Manual Pass 4B** — design and documentation only. **Not** shipped product. **Not** a promise of app readiness (see `SYSTEM_READINESS_REPORT.md`).  
**Date:** 2026-04-28  
**Public language:** **Guided Campaign System**, **Campaign Operating System**, **Workbench**, **Field Intelligence**, **Pathway Guide**, **Campaign Companion** — **not** “AI” as a product name for this layer.  
**Boundary:** This document describes **forecasts, scenarios, projections, and readiness** — **not** election outcome **certainty** or clandestine microtargeting.

**Cross-references:** `SIMULATION_AND_FORECASTING_SYSTEM_PLAN.md`, `SEGMENTED_CAMPAIGN_TARGETING_AND_MESSAGE_STRATEGY_PLAN.md`, `CANDIDATE_AND_CAMPAIGN_MANAGER_STRATEGY_DASHBOARD_REQUIREMENTS.md`, `IPAD_MOBILE_AND_DESKTOP_DASHBOARD_DESIGN_REQUIREMENTS.md`, `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md` (Part J), `FINANCIAL_BASELINE_AND_BUDGET_CALIBRATION_PLAN.md`, `POLITICAL_ANALYSIS_AND_PATH_TO_WIN_DATA_MODEL.md`, `PRECINCT_PATH_TO_VICTORY_AND_CANVASSING_PLAN.md`, `playbooks/DASHBOARD_ATTACHMENT_RULES.md`, `playbooks/APPROVAL_AUTHORITY_MATRIX.md`.

---

## 1. Executive summary

The campaign’s **master plan and strategy** should be **visibly anchored** on **candidate** and **campaign manager (CM) Workbench surfaces** (future build), with **interactive scenario controls** (sliders) that adjust **documented assumptions** and show **how** readiness, trajectory, and plan progression **would shift** if those resources changed — with **KPI impact explanations**, **confidence bands**, and **approval gates** before anything becomes **operational** (spend, messaging, paid audiences, exports, or GOTV programs).

This is **strategic foresight and alignment**, not a substitute for **treasurer truth**, **counsel**, or **compliance** sign-off. Sliders that imply **money** or **voter-audience** changes must be **gated** per `playbooks/APPROVAL_AUTHORITY_MATRIX.md` and **§**38 in `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md`.

---

## 2. Why the strategy must live on candidate and CM dashboards

- **Single source of intent:** The **owner-approved** program lives in strategy manuals; **day-to-day** tradeoffs (time vs. travel vs. money) are decided by **candidate + CM** with **treasurer and compliance** on edges. Surfacing the **plan + assumptions** on their dashboards **reduces** DMs, slide decks, and “shadow math.”  
- **Honest triage:** When **capacity** is finite, the UI should show **readiness and constraints** (cash floor, V.C. load, NDE/MCE queue) in one place.  
- **Narrative discipline:** The **Message Engine** and **Narrative Distribution** stay aligned when strategy shifts are **visible** to comms, not only to one channel owner.  
- **Device reality:** **Most work** is expected on **iPads**; strategy must be **legible and operable** on tablet-first layouts (`IPAD_MOBILE_AND_DESKTOP_DASHBOARD_DESIGN_REQUIREMENTS.md`).

---

## 3. Candidate dashboard strategy panel (requirements)

- **Read-only** by default for **sensitive** sliders (treat until Steve policy — see **§**21 and MI **§**38).  
- **Panels:** master plan snapshot, “behind / ahead” strip, **scenario** (sandbox) vs. **locked baseline**, recommended next **human** decisions, **calendar/travel** load implied by plan.  
- **Never:** row-level **voter** data, **protected-class** or sensitive trait targeting, or **unsourced** opponent framing.

---

## 4. Campaign manager dashboard strategy panel (requirements)

- **Full** scenario editing **proposal** path (not necessarily auto-apply): draft assumption changes, attach **RACI**, route to **LQA** per category.  
- **Queues:** intakes, tasks, and **“strategy change”** items must not bypass **WorkflowIntake** / **CampaignTask** patterns when the app supports them.  
- **Tie-in:** open **Workbench** work linked to the **assumption** that would change (future data model: see `SIMULATION_AND_FORECASTING_SYSTEM_PLAN.md` Pass 4B addendum).

---

## 5. Master plan viewer

- Renders the **current** strategic baseline from `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md` **Parts B–H** and linked plan manuals, **as excerpts** (not a copy-paste of the whole tome in UI).  
- **Versioning:** when assumptions update, show **“effective date”** and **“approved by”** (owner/CM/treasury as appropriate).  
- **Links** to canonical markdown sources for operators who need the **full** chapter (internal).

---

## 6. Editable assumptions registry (conceptual)

A structured registry (product future; spreadsheet today) of **each** slider and non-slider assumption:

| Field | Purpose |
|-------|---------|
| `key` | Stable machine key, e.g. `fundraising_pace_index` |
| `label` | Human label for UI |
| `value` / `range` | Current value; min/max *safe* band (policy) |
| `unit` | $/week, hours, FTE, %, count, index 0–1 |
| `owner` (proposal) | Role that may *propose* change |
| `approver` (operationalize) | LQA per `APPROVAL_AUTHORITY_MATRIX` |
| `downstream` | Which manuals, KPIs, and dashboards recalc |
| `confidence` | Low/Med/High based on data age + sample |
| `audit` | Link to `WorkflowIntake` / operator note (future) |

**No** PII in the registry. **Voter** contact universes and paid audiences are **metadata references** to **compliance-approved** programs only.

---

## 7. Scenario slider system (design)

- **Private staff** language: “scenario” or “simulation” — not “**AI**-optimized plan.”  
- **Modes:** (1) **Preview** (what-if, no system-of-record change), (2) **Proposed** (saved scenario pending approval), (3) **Locked baseline** (what leadership agreed).  
- **UI:** sliders, numeric inputs, and **presets** (Floor / Base / Momentum) aligned with `CAMPAIGN_STRATEGY` / `FUNDRAISING_AND_VOLUNTEER_ACCELERATION` where applicable.  
- **Coupling:** when a slider implies **$**, **GOTV**, or **paid audience**, the UI must show **“requires treasurer / counsel / data approval”** before execution.

---

## 8. KPI impact explanation system

For each slider move, the UI should show **plain language**:

- **What moved** (readiness, trajectory, **plan phase** alignment).  
- **Which KPIs** are first-order vs. second-order (avoid fake precision).  
- **Confidence** band (low/med/high) and **which data** was stale.  
- **Risks** of over-rotating (burnout, cash floor, NDE queue, field thin coverage).

This is a **KPI impact explanation** layer — **not** a claim that a single control **deterministically** fixes an outcome.

---

## 9. Forecast vs. prediction (boundary)

| Allowed | Not allowed |
|---------|-------------|
| Ranges, scenarios, “if we add X hours, capacity model shifts to…” | “We will win X county” or exact vote share |
| Readiness 0–100 **with** method note | Hiding that precinct model is off when data is missing |
| Stating **sensitivity** to assumptions | **Public** “model certainty” for fundraising or turnout |

---

## 10. Approval gates before strategy changes become operational

- **No** slider directly **commits** spend, approves a vendor, changes a **regulatory** text, or alters a **voter** export — those remain **LQA** per matrix.  
- **Proposed** scenario → **owner/CM** review (as policy) → **treasurer** for $ → **counsel/data** for audience or GOTV when applicable → **operator** may create **tasks** to execute.  
- **Public** comms and **contrast** remain **MCE/NDE + counsel** as already documented.

---

## 11. Strategy change workflow (SOP, future product)

1. **Draft** assumption changes in a **Preview** (or spreadsheet until UI exists).  
2. **Document** “why” in a short note (links to `WorkflowIntake` when used).  
3. **RACI** check against `APPROVAL_AUTHORITY_MATRIX` (new rows in Pass 4B).  
4. **Simulate** outputs + confidence.  
5. **Approve** per category.  
6. **Publish** “**Locked baseline**” for the week.  
7. **Tasks:** CM or staff creates `CampaignTask` items for V.C., field, comms, etc. — **Pass 5** will expand.  
8. **Review** in next weekly leadership block.

---

## 12. Workbench integration (no code in this pass)

- **Intake and tasks** remain the **execution** spine: `workflows/TASK_QUEUE_AND_APPROVALS.md`, `playbooks/TASK_TEMPLATE_INDEX.md`.  
- **Future:** `WorkflowIntake` or `CampaignTask` may reference `CampaignAssumption` / `ScenarioRun` keys (see `SIMULATION_AND_FORECASTING_SYSTEM_PLAN.md`).  
- **Today:** integration is **procedural** + **this manual**; **not** a claim the objects exist in Prisma yet.

---

## 13. Dashboard UX model (summary)

- **Layout:** top = **outcome strip** (ahead/behind on *plan*, not *vote*), middle = **assumptions + sliders**, right or bottom = **KPI impact** and **alerts** (PII **never** in volunteer-visible tiles).  
- **Candidate** view = fewer controls, more **narrative** and **time** load. **CM** view = **full** operational stack + queues.

---

## 14. iPad-first interaction design (pointer)

- Full requirements: `IPAD_MOBILE_AND_DESKTOP_DASHBOARD_DESIGN_REQUIREMENTS.md`. **Touch** targets, **one-thumb** reach for critical warnings, and **landscape** default for strategy panels.

---

## 15. Desktop edge-to-edge “command center” (pointer)

- Large monitors: use **edge-to-edge** **tables** and **split** plan vs. sim panes. **Not** a second-class experience — **field leads** and **admin** will still use desktop for bulk review.

---

## 16. Mobile fallback design (pointer)

- **Phone:** **read** strategy + **alerts**; **no** complex multi-slider **production** on phone without simplification. **Propose** changes from mobile only if **auth** and **approver** policy allow (Steve — MI **§**38).

---

## 17. Budget and equipment note: 3–5 iPads

- **Plan** to budget **3–5** iPads (cellular where needed) for **staff** who live in **Work**bench + **calendar** on the road.  
- This is a **non-binding** line item in **manuals** only until **treasurer** and **owner** add it to **real** **budget** in **ledger** and **3H** process.

---

## 18. Data and compliance guardrails (non-negotiable)

- **No** **suppression,** deception, or intimidation patterns in UI copy or SOP.  
- **No** **row-level** voter file in volunteer tiles. **Aggregate** and **consent**-aware outreach only.  
- **No** **protected** or **sensitive** attribute targeting; **all** file-based and paid audiences = **compliance** path.  
- **GOTV** and **text** = **compliance** as in `MANUAL_INFORMATION_REQUESTS` §3, §16.

---

## 19. Current repo support (honest)

- **Workbench** (`open-work`), **tasks**, **intakes**: mature **5**-ish readiness per `SYSTEM_READINESS_REPORT.md`.  
- **No** dedicated **interactive** strategy **/ scenario** product surface **claimed** in this pass. **Spreadsheet** + **manual** remain valid until build.  
- **Financial** actuals: **CONFIRMED** `FinancialTransaction` when used — **3H**.

---

## 20. Missing product features (build backlog, not a commitment)

- **Scenario engine** in-app with `CampaignAssumption` / `ScenarioRun` persistence.  
- **KPI explainer** panel wired to sim outputs.  
- **Candidate/CM** strategy **routes** with **gated** sliders.  
- **Audit** of who changed an assumption, when, and with what **approval** record.  
- **Segment** toggles (recruit / persuade / GOTV) as **metadata** only, **compliance**-approved — `SEGMENTED_CAMPAIGN_TARGETING_AND_MESSAGE_STRATEGY_PLAN.md`.

---

## 21. Steve decision list (this document)

- Who may **edit** vs. **propose** vs. **view** each slider class (see MI **§**38).  
- **Candidate** direct-edit vs. **request-only** for high-impact sliders.  
- **Named** scenario presets: Floor, Base, Momentum, Stretch, **custom** list.  
- **Cash floor** and **spend** rules that should **block** or **cap** sim outputs in UI.  
- **iPad** purchase approval and **MDM** / wipe policy.  
- **Data retention** of scenario runs (internal only).

---

## 22. Scenario slider reference — all controls

**Columns:** *Input* · *Safe range (policy band)* · *KPIs affected* · *Dashboards / surfaces* · *Plan / manual section* · *Propose* · *Approve operational* · *Risk if overused* · *Data needed*

*“Safe range” is **governance** language — not a legal cap until treasurer/counsel say so. Use **TBD** where **Steve** must set.*

| # | Slider / assumption | Input | Safe range (illustrative) | KPIs affected | Dashboards / surfaces | Plan / manual section | Propose | Approve operations | Overuse risk | Data |
|---|---------------------|--------|----------------------------|--------------|------------------------|------------------------|---------|--------------------|------|------|
| 1 | **Fundraising pace** | Index vs. baseline weekly raise | 0.5×–1.3× of trailing **CONFIRMED** inflow (TBD) | cash runway, burn vs. goal, “ahead/behind” | CM **strategy**, fin panel | `CAMPAIGN_STRATEGY` §2–3, Part B; `FINANCIAL_...` | Fin lead, CM | T (+ O threshold) | Promise donors impossible velocity | `FinancialTransaction` **CONFIRMED** time series |
| 2 | **Weekly call time hours** | Hours/week candidate | Min rest **policy**; max **TBD** fatigue | $ raised via call, connect %, time debt | CM + candidate | `CALL_TIME_...` | CM, call-time mgr | Candidate + T if $ asks | candidate burnout | call logs (internal), not public dumps |
| 3 | **Travel days** | Days / month on road | Within **weekly travel** SOP; rural min **TBD** | ladder, meeting %, 72h FU, $ travel | cal + OIS, CM | `WEEKLY_TRAVEL_...` | advance, CM | T (budget), candidate (time) | field exhaustion; ghost stops | `CampaignEvent`, `FinancialTransaction` travel |
| 4 | **House parties / week** | Count | 0–**TBD** max **V.C.** can host | new actives, $, P5 | events + V.C. | Part B, house party 3B | V.C., CM | T if paid assets | quality collapse | RSVP + outcomes (aggregated) |
| 5 | **Active volunteers** | Count or target | Floor/Base/Stretch (5K = stretch) | WIP, tasks cleared, NDE capacity | V.C. + Workbench | `FUNDRAISING_...` | V.C., CM | O for public use of number | inflating “active” | hub **active** def + tasks |
| 6 | **Power of 5 teams** | # teams on track | Product definition TBD | P5 completion, field capacity | P5 + CM | P5 in strategy | P5 lead, V.C. | CM | fake completion | honest team definitions |
| 7 | **County coordinators** | FTE-like bench | 0–**TBD**; map-first | OIS quality, 72h FU, rural coverage | county + OIS | `FUNDRAISING_...` county ladder | regional, CM | O | overclaiming coverage | real roster + TBD map |
| 8 | **Paid media spend** | $ / week or % of cap | Gated to **COH** + 3C governance | CAC, signups, **$** out | paid + NDE + fin | `PAID_MEDIA_...` | paid coord, CM | T + C + O high $ | unapproved buys | **CONFIRMED** ledger + cap table |
| 9 | **Postcard volume** | Pieces / week or tranche $ | 3G tranche; **$** must clear | name ID, response, cost/piece | fin + NDE + CM | `POSTCARDS_...` | postcard lead, CM | T + M (copy) | list fatigue, bad data | list hygiene + print specs |
|10 | **Sign / banner spend** | $ and placements | 3G/3H **gate**; permit path | visible geography, $ | OIS, fin | 3G visibility | vis lead, CM | T + M + field permit | unpermitted deploy | **CONFIRMED** $ + permit check |
|11 | **Campus activation** | Ladder count / priority | 0–8 per campus; **no** fake “active all” | youth funnel, org relationships | OIS + youth | 3E youth plan | youth/campus, CM | C if minors; MCE | token visits | field-verified **status** |
|12 | **Rural county visits** | # / month | Align rural weight + travel cap | rural ladder, tour score | OIS, travel | 3F rural | field, road, CM | T + candidate | hit-and-run optics | `CampaignEvent` + tour log |
|13 | **County party meetings** | # attended / month | 75-county **map** honest | 72h FU, relationship stage | cal + `WB` | 3F meeting tour | stewards, CM | MCE if public | invented dates | verified schedule layer |
|14 | **Listening tour events** | # sessions | 3G design | intakes, contrast guardrails | comms + `WB` | listening tour 3G | focus/listening, CM | MCE/NDE | false **stats** in public | internal formats only in public |
|15 | **Canvassing shifts** | # shifts, hours | # universe policy | turf completion, V.C. WIP | field + tasks | `PRECINCT_...` | field, CM | C if turf edge | PII in chat | program rules + capacity |
|16 | **GOTV shifts** | Shifts, capacity | compliance **first** | contact coverage, queue depth | GOTV (when live) + CM | `SIMULATION_...` §11 | GOTV, CM | ST + T + C | wrong scripts | program status + **opt**-in law |
|17 | **Precinct data completeness** | % with usable data | 0–100% honest | degrades to county model | analyst + OIS | `POLITICAL_...`, precinct plan | data lead, analyst | O for exports | overfitting sparse data | import QA + as-of **date** |
|18 | **Candidate time availability** | Hours / week, blocks | must include **rest** and **non**-campaign | schedule stress, comms **SLA** | candidate strategy | calendar, advance | candidate, CM, advance | O if crisis triage | candidate fatigue | `CampaignEvent` + self-report **rest** |

**Additional cross-slider rules**

- **Coupled sliders** (e.g. travel + call time) should show **tradeoff** when **sum of implied hours** exceeds a **TBD** human weekly cap.  
- **“Publish scenario”** is **not** “send to voters” — it is **internal** + **RACI**-approved baseline for **this** period.

---

**Last updated:** 2026-04-28 (Pass 4B)
