# County party meeting tour system (Pass 3F)

**Lane:** `RedDirt/campaign-system-manual` · **Markdown only** · **2026-04-27**  
**Companion:** `COUNTY_PARTY_AND_RURAL_ORGANIZING_PLAN.md`  
**Vocabulary (public):** Campaign Companion, Guided Campaign System, Organizing Guide, Field Intelligence, Message Engine, Campaign Operating System, Workbench, Pathway Guide — not “AI.”

**Honesty:** If meeting dates are not verified, run **county party meeting mapping required** (sprint, named owner, verification sources). Do not invent chairs, dates, or relationships. A meeting is not an endorsement. Do not overstate state-party formal support for the SOS campaign; county-level help with volunteers and dollars may still be real (Steve).

**Repo:** There is no `CountyParty` Prisma model. Use `CampaignEvent`, `WorkflowIntake`, `CampaignTask`, and off-repo rosters. `src/content/events/index.ts` may list user-designated party-style events — **verify** before any public or ops use.

---

## 1. Purpose

Make the 75-county (over-time) **meeting** **tour** **operable:** map or document **unknowns**, **priority**-score visits, **pair** with rural / EHC / campus / other **stops**, and **force** 48–72h follow-up in Workbench.

## 2. Inputs

- County **mapping** **table** (county plan §4) — one row per county.  
- **`CampaignEvent`** (draft or scheduled) for each planned **attendance** (type e.g. `MEETING` or `APPEARANCE` per local naming).  
- County **activation** **ladder**, `CountyCampaignStats` / OIS, **rural**-priority list (Steve).  
- **Travel** **caps**; **`FinancialTransaction`** with optional `relatedEventId` for event-tied **expenses**.  
- **UTM** / metadata: e.g. `source=county_party`, `county_slug=…` on `WorkflowIntake` (SOP; no Pass 3F code).

## 3. 75-county mapping sprint

- **Timebox** (e.g. 2–4 weeks) with **one** program owner and **LQA** backup.  
- **Sources** (illustrative only): public notices; official or party public pages; **introduction** to chair — not guessing.  
- **Output:** off-repo or governed table + % rows with **next** **date** and **data** **confidence**; **TBD** stays **TBD** until verified.  
- **Milestone** review with CM/owner: % of counties with **next** meeting date known (ladder 1+); % still **unknown** (ladder 0).  
- **Exit** criteria: owner + backup named; **hygiene** rules for one **source** of truth per county **(see** §12).

## 4. County party meeting calendar

- **Import** verified **next** dates into **`CampaignEvent`** (internal or public per **compliance** + **local** norms).  
- **Reconcile** with `WEEKLY_TRAVEL_AND_EVENT_PROJECTION_SYSTEM.md` so **no** **double-book** candidate or **surrogate**.  
- **Rolling** refresh: meeting **times** **change** — **stale** row = **high** **risk** (§17 in county plan).

## 5. Meeting priority score (conceptual)

**Boost** when: next meeting is within a defined window (T days, set with CM); **rural** priority flag; ladder **0–2**; no **attended** visit in a long lookback; relationship owner assigned; can **pair** with EHC, NAACP, campus, or **house** party on one vector; `CampaignEvent` already exists and is confirmed.

**Penalize** when: data confidence **low**; same county already has a **visibility-only** stop this week; travel cost exceeds a band without clear ladder upside.

**Composite:** weighted **sum** in spreadsheet (0–100 normalized); not a public promise.

## 6. Travel pairing rules

- Prefer one dense day per county when possible: county party meeting + optional EHC/Extension touch, local paper or radio (earned or compliant paid per `PAID_MEDIA_AND_LONG_TERM_INFRASTRUCTURE_PLAN` Pass 3F), NAACP or campus if mapped, house party recruitment lead.  
- Do not stack redundant visibility-only stops in the same seven days without a ladder reason (`WEEKLY_TRAVEL_AND_EVENT_PROJECTION_SYSTEM.md` §14).  
- Rural counties are core routing, not optional (`COUNTY_PARTY_AND_RURAL_ORGANIZING_PLAN.md` §3).

## 7. Pre-meeting checklist

Verify time, place, **open** vs members-only rules; **MCE/NDE** if public remarks; **materials** (sign-up, palm cards, donation path per treasurer); **who** attends (candidate vs surrogate); **`CampaignEvent`** draft **updated**; **UTM** on forms.

## 8. Meeting run-of-show (template)

Respect chair and agenda; short SOS framing (compliance); **listening** window; **asks** (sign-up, P5, host, coordinator prospect) as appropriate; capture intakes; thank chair; **internal** debrief same night (task).

## 9. Post-meeting 72-hour follow-up

Within 48–72 hours: thank-yous; assign V.C./county/fundraising; **close** or **spawn** `CampaignTask`; **update** county **ladder** and **mapping** row; **schedule** next touch; **no** **ghost** **signups**.

## 10. Workbench task templates (examples)

- `cp_map_{county}` — research next meeting date.  
- `cp_prep_{county}` — materials and **RACI** for **rem**arks.  
- `cp_follow_{county}` — 72h follow-up **owner** and **SLA**.  
- `cp_pair_{county}` — **pair** with EHC/NAACP/campus **same** **week**.

## 11. Dashboard and KPI requirements

Mapping % **(75);** upcoming meetings; ladder **distribution;** rural visits YTD; **72h** follow-up **rate;** **$** and **vol** **with** `source=county_party` (hygiene); **CC** prospects; **GOTV** readiness and **precinct** flags.

## 12. Data hygiene rules

One **source** of **truth** per county for **schedule;** **never** invent dates; **refresh** after each **contact;** **PII** off-repo; **double**-**entry** with `CampaignEvent` **and** mapping **table** **must** **match**.

## 13. Rural priority overlay

Apply the rural-priority list from `MANUAL_INFORMATION_REQUESTS_FOR_STEVE` §25 to **pairing** and **scoring**. Favor **follow-up** **capacity** in rural counties, not one-off drive-through stops without **ladder** moves.

## 14. Surrogate / volunteer presenter model

When the candidate cannot attend, use a **surrogate** or **volunteer** **presenter** only with **CM** approval, **MCE/NDE** fit, and **local** **norms** **(no** **surprise** **optics).** **Same** **sign**-**up** and **follow**-**up** **SOP** as a **candidate** **visit.**

## 15. Virtual meeting option

Use when **travel** **cost** **exceeds** **value** for the **ladder** **upside,** **health** **constraints,** or **the** **local** **party** **runs** **a** **hybrid** **meeting.** **Confirm** **format,** **audience,** **and** **moderation** **before** **committing;** it is **not** **the** **default** **for** **rural** **relationship** **building** when **in-person** **is** **feasible** **(see** `COUNTY_PARTY_AND_RURAL_ORGANIZING_PLAN` §3).

## 16. Escalation path

- **Sensitive** local dynamics, **factional** **risk,** or **unverified** **claims** **in** **public** **remarks** **→** **regional** **/** **state** **liaison** **(if** **named),** then **CM.**  
- **Donation,** **treasurer,** or **MCE/NDE** **questions** **→** **treasurer** **+** **CM** **(same** **day** **SLA** **in** **live** **weeks).**  
- **Media** **/** **earned** **friction** **at** **the** **meeting** **→** **comms** **+** **CM;** **no** **unsourced** **opponent** **claims** **(manual** **policy).**  
- **Log** **in** **Workbench;** **retire** **open** **tasks** **on** **resolution.**

## 17. Weekly review rhythm

**CM** **/** **tour** **owner:** **15–30** **minute** **standing** **review:** **this** **week** **(confirmed** **`CampaignEvent`,** **surrogate** **vs** **candidate);** **next** **two** **weeks** **(pipeline);** **mapping** **%** **and** **TBD** **counties;** **72h** **follow**-**up** **on** **last** **week;** **rural** **pairing** **wins/losses;** **escalations** **open** **/** **closed.** **Output:** **3–5** **action** **items** **with** **owners,** **not** **a** **status** **dump.**

## 18. 4-week rolling county party plan

- **Week** **1:** **mapping** **sprint** **checkpoint;** **priority**-**score** **top** **N** **counties;** **lock** **travel** **pairing** **for** **one** **or** **two** **dense** **days.**  
- **Week** **2:** **execute** **visits** **+** **72h** **follow**-**up;** **refresh** **stale** **rows;** **fundraising** **/** **V.C.** **handoffs.**  
- **Week** **3:** **next** **band;** **surrogate** **/** **virtual** **only** **where** **approved** **(§14–15).**  
- **Week** **4:** **review** **KPIs** **(mapping** **%,** **ladder** **moves,** **72h** **rate);** **adjust** **scoring** **weights** **with** **CM.**

## 19. 12-week county party tour map

**Three** **rolling** **4**-**week** **blocks** **(see** **§18),** **aligned** **with** **`WEEKLY_TRAVEL_AND_EVENT_PROJECTION_SYSTEM.md`** **and** **fundraising** **windows.** **No** **invented** **dates:** **every** **`CampaignEvent`** **ties** **to** **verified** **mapping** **or** **explicit** **TBD** **with** **owner** **(see** **§3).**

## 20. Missing system features

**Document** **as** **SOP** **until** **product:** **dedicated** **county**-**party** **entity** **in** **data** **(not** **in** **Prisma** **today);** **automated** **chair** **/** **schedule** **sync;** **native** **UTM** **on** **all** **`WorkflowIntake`** **rows** **(field** **names** **only** **if** **Pass** **3F** **code** **ships).** **Current** **path:** **`CampaignEvent`** **+** **`WorkflowIntake`** **+** **`CampaignTask`** **+** **governed** **spreadsheet.**

---

**Last updated:** 2026-04-27 (Pass 3F)