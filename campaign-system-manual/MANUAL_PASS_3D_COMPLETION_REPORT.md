# Manual Pass 3D — completion report

**Lane:** `H:\SOSWebsite\RedDirt\campaign-system-manual`  
**Date:** 2026-04-27  
**Pass name:** *Manual Pass 3D — Endorsement Program, National Attention Strategy, and Precinct Path to Victory (operational)*  
**Constraints:** Markdown / manual only; no app code; no DB, auth, migrations, dependencies, or production settings; no commit. **No** invented endorsements or precinct statistics. **Vocabulary:** Campaign Companion / Guided Campaign System (not “AI” as a product name).

---

## Files created (Pass 3D)

| File | Purpose |
|------|--------|
| `ENDORSEMENT_AND_NATIONAL_ATTENTION_PROGRAM.md` | Endorsement lanes, national attention loop, Workbench/UTM hooks, **ask packet** (process — no real endorsers) |
| `PRECINCT_PATH_TO_VICTORY_AND_CANVASSING_PLAN.md` | County-first; path-to-victory as **operational** (capacity, turf, GOTV); **flag** when strategic counties lack precinct data: *Precinct data acquisition required before full path-to-victory modeling* |
| `MANUAL_PASS_3D_COMPLETION_REPORT.md` | This file |

---

## Files updated (Pass 3D)

| File | Change |
|------|--------|
| `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md` | Pass 3D in header; Part D; risks; §16; §23 Steve list; pointers to `MANUAL_INFORMATION_REQUESTS` §1–**20** |
| `SIMULATION_AND_FORECASTING_SYSTEM_PLAN.md` | **§21** Pass 3D table + gaps (e.g. no endorsement *entity* in this pass) |
| `FUNDRAISING_AND_VOLUNTEER_ACCELERATION_PLAN.md` | Pass 3D addendum; companion lines |
| `PAID_MEDIA_AND_LONG_TERM_INFRASTRUCTURE_PLAN.md` | **§13** endorsement / national / community conversion; companions; `Last updated` 3C+3D |
| `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` | Purpose line; **§19** endorsements; **§20** precinct / field; sim §21 pointer |
| `MANUAL_TABLE_OF_CONTENTS.md` | Version + Part IX; lifecycle + Pass 3D; appendix M–O |
| `MANUAL_BUILD_PLAN.md` | Pass 3D section; **18-role** Pass 4 list |
| `WORKFLOW_INDEX.md` | Pass 3D cross-link |
| `SYSTEM_READINESS_REPORT.md` | Pass 3D artifacts; precinct *modeling* constraint |

---

## Design summary (short)

- **Endorsements:** Category lanes, pipeline, compliance/comms, **MCE/NDE** fit, `WorkflowIntake` **metadata** and UTM (SOP), national attention **as handoff** to V.C. + county + P5 + dollars — not a replacement for field labor. **No** named endorsers in the repo until **approved** elsewhere.
- **National attention:** **Earned** first; optional **paid** per Part C/§18; same creative discipline as Message Engine and Narrative Distribution.
- **Precinct / path to victory:** **Operational** (coverage, shifts, walk-list policy, GOTV readiness). **Not** a prediction. Repo has field/precinct-related **models** (cited in `PRECINCT_PATH...` from `prisma/schema.prisma`) — manuals do **not** claim end-to-end product coverage for every surface.
- **Data gaps:** Where **strategic** counties **lack** precinct-level data, **flag** and treat full **path-to-victory modeling** as blocked until **acquisition** (Steve / data / field).

---

## Repository / data gaps (honest)

- **Endorsement object or workflow type** in app may be **future**; Pass 3D stays **process + metadata** SOP, not a schema mandate.
- **Precinct** UI and OIS **depth** for every county remain **uneven** (see `SYSTEM_READINESS_REPORT` Pass 2A table; city/precinct OIS 0–1).
- **Steve** **answers** in `MANUAL_INFORMATION_REQUESTS` **§19–20** (and prior §) **re-baseline** strategy and simulation text.

---

## Unresolved (Steve and senior operators)

- Full `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` **§1–20**, especially **§19** (endorsement program, **national** handoff, **lift** **bands**) and **§20** (strategic **county** list, **per-county** precinct data status, canvass **capacity**, result **lineage** for scenarios).

---

## Next recommended pass — Manual Pass 4

**Role playbooks, training modules, dashboard attachment** (see `MANUAL_BUILD_PLAN.md`).

**18-role** depth priority ( **14** from Pass 3C report **+** **4** from Pass 3D operating doctrine):

1. Fundraising lead  
2. Paid media / vendor coordinator  
3. House party host captain  
4. Volunteer coordinator  
5. County coordinator  
6. Road team lead  
7. Social media lead  
8. Narrative Distribution lead  
9. Sign holder captain  
10. Power of 5 leader  
11. Future candidate pipeline lead (scaffold)  
12. Campaign manager  
13. Candidate  
14. Owner (governance)  
15. **Endorsement / relationship program** lead  
16. **Field manager** (turf, precinct path)  
17. **Voter file / data steward** (walk lists, data completeness)  
18. **Communications lead** (earned + national attention **handoff** with Workbench and county)

**Pass 4 full depth order (23 roles):** `MANUAL_PASS_3E_COMPLETION_REPORT.md` **adds** **(19)** campus organizing lead — **(20)** youth/student coordinator — **(21)** NAACP/community relationship steward — **(22)** focus category outreach lead — **(23)** calendar/travel scheduler.

---

**Last updated:** 2026-04-27 (Pass 3D; **3E** extends Pass 4 to **23** roles)
