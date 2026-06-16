# Fundraising Opportunity Architecture

> **Status:** Planning inventory only — **do not implement** until PPEN A.0b/A.0c, Leadership Workbench gates, and this registry are locked.  
> **Registry:** `data/campaign-brain/fundraising-opportunity-registry.source.json`  
> **Parent system:** [Fundraising Operating System](./FUNDRAISING_OPERATING_SYSTEM_ARCHITECTURE.md) (FOS)  
> **Lane:** RedDirt / election-plan only

---

## What FOS solved vs what this layer solves

| System | Question |
|--------|----------|
| **FOS (Phase 1)** | **How much?** — vote-target dollar allocation |
| **Fundraising Opportunity Pipeline (this doc)** | **How do we get there?** — executable opportunities with owners |
| **Donation Record Layer (later)** | **What actually came in?** — compliance-backed receipts |

FOS without opportunities becomes another dashboard:

```text
Fundraising Goal
$9,390

Raised
$0
```

and nothing else. That violates data-integrity doctrine.

---

## Three systems aligning

```text
Election Math System     →  Votes   (VCI · chapter-05 · numeric targets)
Fundraising OS (FOS)     →  Dollars (vote-target allocation)
PPEN                     →  People  (Person · Participation · Relationships)
```

A county or community leader should answer from **one workbench**:

```text
How many votes?
How many people?
How many dollars?
```

Opportunity architecture connects **dollars** to **people doing things** (meetings, events, house parties) — not hope.

---

## Goal card — required fields (every community)

Every fundraising surface must eventually show:

```text
Base Goal
Stretch Goal
Raised
Gap
Ownership
```

**Sherwood example (live FOS math, 2026-06-16):**

```text
Sherwood

Base Goal           $9,390
Stretch Goal        $16,433
Raised              $0
Gap                 $9,390
Fundraising Lead    OPEN
```

**A goal without an owner is just a number.** `OPEN` is valid display until `PpenParticipation` or `CommunityWorkbenchLeadership` placement exists.

Gap formula: `base_goal - raised` (stretch tracked separately as upside ceiling).

---

## Fundraising Opportunity Pipeline (community template)

Every Top 40 community workbench eventually gets:

```text
Fundraising Opportunities

House Parties           Goal: N   (from numeric targets — e.g. Sherwood 50 hosts plan)
Business Meetings       Goal: N   (derived · business outreach lane)
Major Donor Meetings    Goal: N   (derived · FOS base / avg major gift)
Community Events        Goal: N   (events workbench + fundraising tag)
Campus Fundraisers      Goal: N   (campus workbench when applicable)
```

Counts are **planning targets or record counts** — never fake live numbers. Each count drills to `FundraisingOpportunityRecord` rows (preview in registry; not in Prisma yet).

---

## Ten opportunity types (inventory)

Full KPI, ownership, rollup, and workbench detail: **registry JSON** (`opportunityTypes[]`).

| # | Opportunity type | Primary owner role | Phase |
|---|------------------|-------------------|-------|
| 1 | House Party Program | House Party Lead | FOP-1 |
| 2 | Grassroots Events | Event Chair / Events Lead | FOP-1 |
| 3 | Major Donor Meetings | Major Donor Lead | FOP-2 |
| 4 | Small Dollar Program | Small Donor Lead | FOP-2 |
| 5 | Campus Fundraising | Campus Fundraising Lead | FOP-2 |
| 6 | Coalition Fundraising | Coalition Lead | FOP-2 |
| 7 | Online Fundraising | Small Donor + Comms Lead | FOP-3 |
| 8 | Event Sponsorships | Business Lead | FOP-2 |
| 9 | Recurring Donor Program | Small Donor Lead | FOP-3 |
| 10 | Business Outreach | Business Lead | FOP-1 |

---

## Ownership structure

```text
State Fundraising Director     (L5 — statewide programs, major donor, compliance)
        ↓
County Fundraising Lead        (L3 — county rollup, escalations, pipeline)
        ↓
Community Fundraising Lead     (L2 — goal card, community opportunity panel)
        ↓
Program leads                  (house party · major donor · small dollar · campus · business)
```

**Interim:** Until dedicated fundraising slots exist, map to `CommunityWorkbenchLeadership` (`business_lead`, `events_lead`, `volunteer_lead`) with **OPEN** where empty.

**Strike team:** County `eventsCaptain` coordinates event-heavy lanes; dedicated `county_fundraising_lead` is a future strike role.

---

## KPI structure (shared pattern)

Every opportunity type defines:

| KPI class | Source |
|-----------|--------|
| **Goal** | Planning (`city-location-numeric-targets`, FOS-derived formula) or registry default |
| **Scheduled / pipeline** | `FundraisingOpportunityRecord.status` |
| **Held / completed** | Opportunity record or `CommunityWorkbenchEvent` |
| **Revenue / raised** | `compliance_donation_record` linked to opportunity — **Phase Donation Layer only** |

**Hard rule:** No fundraising number without underlying records. Click count → open opportunity list → open Person / Event / Donation.

---

## Rollup logic

```text
Opportunity records (community)
        ↓ sum by type
Community opportunity panel
        ↓ sum communities
County fundraising rollup
        ↓ sum counties
Cluster rollup
        ↓ sum (non-isolated)
Statewide
```

**Bonus cities (#41+):** Isolated from statewide opportunity rollups (same as FOS Quitman rule).

**Online / recurring:** Often statewide — do not invent geographic splits without attribution on donation records.

---

## County / community integration

| Surface | Section | Content |
|---------|---------|---------|
| Community Workbench | `#fundraising` | Goal card (base · stretch · gap · owner) |
| Community Workbench | `#fundraising-opportunities` | Pipeline lanes with drill-down |
| County Workbench v4 | `#fundraising` | County rollup + community table (FOS Phase 1 live) |
| County Workbench v4 | `#fundraising-pipeline` | Aggregated opportunity lanes |
| Event Leadership Workbench | event detail | Grassroots events revenue + assignments |
| Coalition Workbench | coalition section | Coalition fundraising sub-lane |

**Doctrine reminders:**

- Event hosts ≠ house-party hosts (`field_entry.category=house_party`)
- Grassroots & Guitar Strings → Event Leadership, not Sherwood `community_lead`
- Sherwood host/VIP planning JSON → planning panel only, not live KPI bars

---

## Fundraising Leadership Workbench (future)

When Leadership Workbench gates pass, **County Fundraising Lead** gets a workbench that answers:

```text
How much is my goal?
What opportunities exist?
Who owns each opportunity?
What is overdue?
Where is the gap?
```

Not sufficient:

```text
Goal
$25,000
```

Cross-reference: `leadership-workbench-registry.source.json` → future `fundraising_leadership` type; `fundraising-operating-system.source.json` → `futureLeadershipRoles[]`.

---

## Drill-down doctrine

Same as volunteer counts and leadership KPIs:

> **No fundraising number without underlying records.**

Every dollar and every count must drill into:

```text
Meetings · Events · House Parties · Sponsors · Donors · Opportunities
```

**Anti-pattern:** Static goal banner with $0 raised and no pipeline.

**Target pattern:**

```text
Goal card → opportunity lanes → record list → Person or Event
```

---

## Record model preview (not migrated)

Registry defines `FundraisingOpportunityRecord` preview fields — status, owner, type, linked event/donation, expected vs actual revenue. **Not in Prisma** until build gates pass.

Donation attribution links opportunities to `compliance_donation_record` (existing compliance lane) — no parallel donor CRM in election-plan.

---

## Build sequencing (after pilot)

```text
1. PPEN A.0b          Person + Participation + L1–L6
2. PPEN A.0c          Intake → activation → My Journey
3. Leadership Workbenches   (role-specific command surfaces)
4. Fundraising Opportunity Architecture   ← this doc (planning lock)
5. Fundraising Leadership Workbenches
6. Donation Record Layer   (compliance-backed raised rollups)
```

**Do not skip to donation processing** before opportunities and ownership exist — otherwise reporting runs ahead of execution.

---

## Phase map

| Phase | Scope | Build? |
|-------|-------|--------|
| **FOS-1** | Vote-target goals · rollups · goal card | Partial (local) |
| **FOP-plan** | This registry + architecture | **Now (planning lock)** |
| **FOP-1** | Opportunity records · house parties · business · grassroots events | After gates |
| **FOP-2** | Major donor · small dollar · campus · coalition · sponsorships | After FOP-1 |
| **FOP-3** | Online · recurring | After donation layer |
| **FOS-donation** | Compliance donation → community/county raised | Last in sequence |

---

## Related docs

- `docs/FUNDRAISING_OPERATING_SYSTEM_ARCHITECTURE.md`  
- `docs/LEADERSHIP_WORKBENCH_ARCHITECTURE.md`  
- `docs/ELECTION_PLAN_DATA_INTEGRITY_DOCTRINE.md`  
- `docs/ELECTION_PLAN_OPERATING_SYSTEM_DOCTRINE.md`  
- `docs/COMMUNITY_WORKBENCH_PPEN_ROADMAP.md`  
- `data/campaign-brain/fundraising-operating-system.source.json`  
- `data/campaign-brain/leadership-workbench-registry.source.json`
