# PPEN A.0b — Participant Identity & Access Layer

**Status:** Doctrine + structural framework · **Gate:** Pilot smoke before implementation code  
**Updated:** 2026-06-16  
**Related:** [`ELECTION_PLAN_OPERATING_SYSTEM_DOCTRINE.md`](./ELECTION_PLAN_OPERATING_SYSTEM_DOCTRINE.md), [`PPEN_A0C_VOLUNTEER_INTAKE_ACTIVATION.md`](./PPEN_A0C_VOLUNTEER_INTAKE_ACTIVATION.md), [`COMMUNITY_WORKBENCH_PPEN_ROADMAP.md`](./COMMUNITY_WORKBENCH_PPEN_ROADMAP.md), [`ELECTION_PLAN_DATA_INTEGRITY_DOCTRINE.md`](./ELECTION_PLAN_DATA_INTEGRITY_DOCTRINE.md)

---

## Four first-class objects

| Object | Question |
|--------|----------|
| **Person** | Who they are |
| **Participation** | How they are involved (in a specific context) |
| **Relationship** | Who they know and influence |
| **Impact** | What changed because of them |

A.0b owns **Person** + **Participation** + access. A.1/A.1b own **Relationship**. Impact rollups derive from relationships.

---

## Participation Record (critical — not optional)

A **Person** is one human. A **Participation Record** is involvement in one context.

```text
Steve Grappe (Person)
├── Faulkner County Volunteer Lead          (participation: county)
├── Sherwood Event Committee Member         (participation: event_committee)
├── Direct Democracy Coalition Participant  (participation: program)
├── Veterans Outreach Contributor           (participation: coalition)
└── Substack Insider Member                 (participation: comms)
```

One person. Multiple participations. Required for permissions, reporting, comms scoping, and leadership development.

Context types: `county` · `community` · `coalition` · `event_committee` · `comms` · `program` — see framework registry.

---

## Why A.0b before ACS, BLS, or 75-county imports

Every future feature depends on **who the person is**:

- Volunteer signup & one-time activation
- Usernames & access levels
- My Five & Help 10 Participate
- Leadership applications & training
- County / coalition assignment
- Communications access (CCH insider feed)
- Impact metrics ("Because of You")

**Build the Person Layer first.** Not census tiles.

---

## Participant Record (target model)

Renamed in doctrine: **Person** record.

| Field | Notes |
|-------|--------|
| Name | |
| Address | |
| Phone | |
| Email | |
| Username | Unique activation handle |
| Status | prospect · active · suspended · … |
| County | Primary county assignment |
| City | Optional city workbench link |
| Coalitions | Many-to-many coalition workbench slugs |
| Skills | |
| Interests | |

County/coalition/community assignment lives on **Participation** records — not duplicated on Person.

Linked to operator account when applicable. One canonical person — not duplicate list rows.

---

## Participation Record (target model)

| Field | Notes |
|-------|--------|
| person_id | FK to Person |
| context_type | county · community · coalition · event_committee · comms · program |
| context_slug | e.g. `faulkner`, `sherwood`, `veterans`, `substack-insider` |
| role_title | e.g. Volunteer Lead, Committee Member |
| status | active · interested · ended · … |
| access_scope | Optional scoped permissions for this context |
| started_at / ended_at | |

---

## Access levels (L1–L6)

| Level | Label |
|-------|--------|
| L1 | Participant |
| L2 | Leader |
| L3 | County |
| L4 | Regional |
| L5 | State |
| L6 | Executive |

Scopes what workbench sections, CCH insider feed, and admin surfaces a person can see.

---

## My Journey (three parallel tracks)

```text
Every participant
├── Leadership Journey     (optional specialization)
├── My Five                (mandatory — network growth)
└── Help 10 Participate    (mandatory civic mission — My Ten)
```

Plus: Training · Certifications · Volunteer Hours · Events

---

## Impact — "Because of You"

Every participant profile eventually shows record-backed impact:

```text
Because of You

People Joined              27
Network Impact             143
People Helped Participate  18
Vote Plans Completed       11
```

These are **movement retention metrics** — only from participant relationship records, never dashboard placeholders.

---

## Activation workflow (A.0b + A.0c)

**A.0b** (identity graph):

1. **Person** model (Prisma + API)
2. **Participation** model (multi-context per person)
3. Access levels L1–L6 + permission gates scoped by Participation
4. **My Journey** shell (home screen fields in framework registry)
5. My Five + Help 10 placeholders (Relationship objects land in A.1/A.1b)
6. Impact tracking framework ("Because of You")

**A.0c** (front door — see dedicated doc):

Volunteer signup → confirmation → activation link → username/password/terms → create Person + Participation(s) → L1 → My Journey.

[`PPEN_A0C_VOLUNTEER_INTAKE_ACTIVATION.md`](./PPEN_A0C_VOLUNTEER_INTAKE_ACTIVATION.md)

Registry v2: `data/campaign-brain/ppen-participant-framework.source.json`  
Loader: `src/lib/election-plan/ppen/load-ppen-participant-framework.ts`

---

## Workbench integration — Interested Candidates

County / coalition leadership positions show:

```text
Volunteer Lead

OPEN

3 Interested Participants   [View candidates →]
```

Count = `LeadershipOpportunityApplication` records (or equivalent) for that role slug.  
Turns recruitment from spreadsheets into workflow.

Structural placeholder in County Workbench v4: **0 interested** until A.0b records exist.

---

## Coalition workbenches — same engine

Each coalition workbench (Muslim outreach, Hispanic outreach, Youth, Veterans, etc.) gets the **same operating sections** as county v4:

```text
Leadership · Open Positions · Interested Candidates · Volunteer Pipeline
Training · Events · Relationships · Communications · My Five · Help 10
```

Different content. Same OS. See [`COALITION_COMMAND_WORKBENCH_MIGRATION.md`](./COALITION_COMMAND_WORKBENCH_MIGRATION.md).

---

## CCH integration

| PPEN event | CCH access |
|------------|------------|
| Volunteer approved (L1) | Public feed subscription |
| Active volunteer + training | Insider feed access |

PPEN owns the person; CCH owns the comms channel — linked records.

---

## What NOT to build yet

- 75-county ACS/BLS bulk import
- Fake impact numbers on county rollups
- Separate participant dashboards outside workbench shell

---

## Verification (post A.0b code)

- Participant can activate via one-time invite → username → profile
- County workbench shows interested candidate count > 0 only when application records exist
- My Five / Help 10 on profile drill to named relationship records
- Impact metrics on profile = sum of verified edges — 0 until data exists

---

## Build gate

1. Sherwood + Jacksonville pilot smoke complete (v1.3)  
2. County Workbench v4 locked (structural)  
3. **PPEN A.0b implementation**  
4. PPEN A.0 leadership onboarding engine  
5. A.1 / A.1b engines  
6. ACS pilot (Faulkner or Saline) — parallel OK after A.0b schema exists, not before Person Layer
