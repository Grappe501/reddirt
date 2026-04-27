# Manual Pass 3F — completion report

**Lane:** `H:\SOSWebsite\RedDirt\campaign-system-manual`  
**Date:** 2026-04-27  
**Pass name:** *Manual Pass 3F — County Party Integration, Rural Arkansas Priority, and County Party Meeting Tour System*  
**Constraints:** Markdown / manual only; no app code; no DB, auth, migrations, dependencies; no commit.

**Public product vocabulary:** **Campaign Companion**, **Guided Campaign System**, **Organizing Guide**, **Field Intelligence**, **Message Engine**, **Campaign Operating System**, **Workbench**, **Pathway Guide** — not “AI.”

**Honesty:** No invented **county party meeting dates**, **chairs**, or **relationships**. If schedules are unverified, system action: **county party meeting mapping required** (named owner, verification rules). Treat meetings as **not** endorsements. **Do not** overstate **state** Democratic Party **formal** support for the SOS campaign; **county**-level help with volunteers and dollars may still be real (Steve, per `COUNTY_PARTY_AND_RURAL_ORGANIZING_PLAN.md`).

---

## Files created (Pass 3F)

| File | Purpose |
|------|--------|
| `COUNTY_PARTY_AND_RURAL_ORGANIZING_PLAN.md` | Doctrine, rural priority, 0–11 ladder, recruitment/fundraising bounds, Workbench, integrations, risks, Steve list |
| `COUNTY_PARTY_MEETING_TOUR_SYSTEM.md` | 75-county mapping sprint, calendar, scores, pairing, run-of-show, 72h follow-up, **§1–20** |
| `MANUAL_PASS_3F_COMPLETION_REPORT.md` | This file |

---

## Files updated (Pass 3F)

- `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md` — **Part F** (3F)  
- `WEEKLY_TRAVEL_AND_EVENT_PROJECTION_SYSTEM.md` — **§22** Pass 3F addendum (county party + rural weighting)  
- `FUNDRAISING_AND_VOLUNTEER_ACCELERATION_PLAN.md` — Pass 3F addendum  
- `PAID_MEDIA_AND_LONG_TERM_INFRASTRUCTURE_PLAN.md` — **§15**  
- `PRECINCT_PATH_TO_VICTORY_AND_CANVASSING_PLAN.md` — **§23**  
- `FOCUS_CATEGORY_ORGANIZING_PLAN.md` — Pass 3F cross-ref  
- `SIMULATION_AND_FORECASTING_SYSTEM_PLAN.md` — **§23**  
- `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` — **§25**  
- `MANUAL_BUILD_PLAN.md`, `MANUAL_TABLE_OF_CONTENTS.md`, `WORKFLOW_INDEX.md`, `SYSTEM_READINESS_REPORT.md`  
- `MANUAL_PASS_3E_COMPLETION_REPORT.md` — **Pass 4** depth order pointer **23 → 27**

---

## Repo note (data model)

No dedicated **`CountyParty`** (or similar) in Prisma as of Pass 3F. Operational path: `CampaignEvent`, `WorkflowIntake`, `CampaignTask`, governed spreadsheets, SOP. `src/content/events/index.ts` may include user-designated example events — **verify** before ops or public use.

---

## Pass 4 — depth order (**27** roles)

**1–23** are unchanged from `MANUAL_PASS_3E_COMPLETION_REPORT.md` (Pass 3D **eighteen** + five **3E** operating roles, **fundraising** lead first through **calendar/travel** scheduler last).

**24** **County party relationship steward**  
**25** **Rural organizing lead**  
**26** **County party meeting scheduler**  
**27** **Surrogate / volunteer presenter coordinator**  

Align final titles with CM in Pass 4. The Pass 2B **26**-role **catalog** in `ROLE_MANUAL_INDEX.md` is unchanged; these **27** are **Pass 4 playbook depth** priority, not a schema rename.

---

## Unresolved (Steve)

- Full answers for `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` **§25** (and prior sections as needed).  
- Rural priority **list** or **scoring** **weights** when not yet field-verified.  
- Surrogate / presenter **policy** at mixed public meetings.

---

## Next recommended pass

**Manual Pass 4** — role playbooks, training modules, dashboard attachment rules (`MANUAL_BUILD_PLAN.md`).

**Last updated:** 2026-04-27 (Pass 3F)
