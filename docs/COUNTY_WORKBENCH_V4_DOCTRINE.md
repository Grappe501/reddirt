# County Workbench v4 — Operating Center Doctrine

**Status:** Structural planning · **Lane:** `RedDirt/` · **Audience:** Burt, county leads, Steve  
**Updated:** 2026-06-16  
**Related:** [`COUNTY_WORKBENCH_V3_ELECTION_PLAN.md`](./COUNTY_WORKBENCH_V3_ELECTION_PLAN.md), [`COMMUNITY_WORKBENCH_PPEN_ROADMAP.md`](./COMMUNITY_WORKBENCH_PPEN_ROADMAP.md), [`ELECTION_PLAN_DATA_INTEGRITY_DOCTRINE.md`](./ELECTION_PLAN_DATA_INTEGRITY_DOCTRINE.md)

---

## Milestone: v3 succeeded

Architecture shifted from:

```text
Election Plan → County Page → External County System
```

to:

```text
Election Plan → County Workbench → Everything happens here
```

v3 brought **county intelligence** inside Election Plan. That was the correct direction.

---

## Risk to avoid

Do **not** turn counties into beautiful static intelligence pages nobody uses.

The platform now has:

- County Workbench v3/v4
- Community Workbenches
- Coalition Workbenches
- Campaign Communications Hub (CCH)
- PPEN (doctrine)
- Social Media OS (SMOS)

Data is becoming easier to build than systems. **Protect operational use.**

---

## v4 formula

```text
County Intelligence
+
County Leadership
+
County Execution
+
County Growth
```

v3 was heavily weighted toward **intelligence** (correct for Phase 1).  
v4 adds **people, leadership, onboarding, movement metrics, and execution**.

---

## County operating center nav (target)

```text
{County Name}

Overview
Intelligence
Leadership
Open Positions
My Five Progress
Help 10 Participate
Events
Communications
Coalitions
Volunteer Pipeline
Relationships
Documents
Activity Feed
```

One page. No external dashboard required.

---

## Biggest missing piece (v4 focus)

The county page knows a lot about the **place**.

It must know more about the **people**:

```text
Community Lead     OPEN
Volunteer Lead     OPEN
Faith Lead         OPEN
Youth Lead         OPEN
```

Visible on every county workbench. Assigned names only when strike team or PPEN records exist.

**Interested candidates** (PPEN A.0b): each OPEN role shows applicant count from onboarding pipeline — e.g. `Volunteer Lead · OPEN · 3 Interested Participants`. Zero until application records exist.

---

## Volunteer pipeline lives here

Sophisticated onboarding surfaces **inside the county**:

```text
Volunteer Applications    (PPEN records — 0 until live)
Pending Review
Approved
Training
Leadership Candidates
```

Plus **field log** volunteer counts (record-backed today).

---

## My Five + Help 10 rollups

Movement metrics visible at county level when PPEN pilot gate clears:

**Network Growth (My Five)**

- Participants
- My Five completion %
- Network impact (people)

**Help 10 Participate**

- People assisted
- Registration verification
- Vote plans

Until PPEN live: show framework slots with **0** and pilot-gate note — never fake movement numbers.

---

## Convergence (single operating system)

County Workbench, Community Workbench, Coalition Workbench, CCH, and PPEN are **converging** — not separate products:

| Layer | County workbench section |
|-------|--------------------------|
| City/community ops | Priority cities → community workbenches |
| Coalition ops | Coalitions section → coalition workbenches |
| Comms | Communications → CCH |
| Content | SMOS downstream of CCH |
| Growth | PPEN (My Five, Help 10, volunteer pipeline) |

---

## ACS/BLS data work (pilot, not scale-first)

**Do not** import ACS/BLS for all 75 counties immediately.

**Pilot counties:** Faulkner or Saline — important, manageable, easier to validate.  
**Not Pulaski first** — huge and complicated.

```text
Pilot (Faulkner or Saline) → validate pipeline → scale to 75
```

Template: `data/county-intelligence/acs-bls-import-template.csv` → `CountyPublicDemographics`

---

## Burt handoff

1. **v3 is success** — intelligence inside Election Plan.
2. **v4 priority:** people, leadership, open positions, volunteer pipeline, PPEN rollups — not more intel dashboards.
3. **No standalone county dashboards** — keep everything in `/election-plan/counties/{slug}`.
4. **ACS/BLS:** Faulkner or Saline pilot only until pipeline validated.
5. **Data integrity:** pipeline stages and PPEN metrics show **0** until records exist.
6. **Strike team JSON** remains interim leadership source until PPEN assigns county leads.

---

## Phase 1 structural (now)

| Deliverable | Status |
|-------------|--------|
| v4 nav + section anchors | In county page |
| Leadership slots (OPEN until assigned) | Framework + strike team merge |
| Open positions list | Vacant/recruiting roles |
| Volunteer pipeline framework | 0 until PPEN |
| My Five / Help 10 framework | 0 until PPEN |
| Communications / Coalitions link cards | → CCH / coalition hub |
| v3 intelligence | `#intelligence` section |

---

## Verification

- `/election-plan/counties/faulkner` → Leadership shows OPEN slots; pipeline shows 0 with PPEN note
- Field log volunteer count reflects actual field entries when logged
- No placeholder movement metrics (145 participants, etc.)
