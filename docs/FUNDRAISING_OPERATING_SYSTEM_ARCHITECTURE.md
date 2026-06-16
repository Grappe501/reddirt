# Fundraising Operating System (FOS)

> **Status:** Phase 1 — vote-target allocation, automatic rollups, workbench visibility.  
> **Config:** `data/campaign-brain/fundraising-operating-system.source.json`  
> **Loader:** `src/lib/election-plan/load-fundraising-operating-system.ts`  
> **Lane:** RedDirt / election-plan only

---

## Why FOS exists

Fundraising cannot be a standalone dashboard or a spreadsheet disconnected from victory math. Kelly's campaign already has **VCI**, **vote targets**, **tiers**, and **plurality victory math**. FOS applies the same doctrine to money:

```text
State Goal ($300,000)
        ↓
Cluster Goals (automatic rollup)
        ↓
County Goals (automatic rollup)
        ↓
Community Goals (vote-target formula)
        ↓
Fundraising Workbenches (future leadership layer)
        ↓
Fundraisers · House Parties · Major Donors · Small Donors · Campus · Coalition Giving
```

**Not population. Not equal share. Vote target.**

---

## Core formula

```text
Community Vote Goal
÷
Top 40 Total Vote Goal
=
Fundraising Share

Fundraising Share × State Goal = Base Goal
```

**Example (illustrative numbers):**

```text
State goal                    $300,000
Total Top 40 vote goal        300,000 votes   ← teaching example only

Sherwood vote goal            3,000 votes
Share                         1%
Sherwood base goal            $3,000
```

**Live data (2026-06-16):** Top 40 cities sum to **207,507** vote targets from chapter-05 / numeric targets. Sherwood's vote target is **6,495** → **~$9,390 base** at the $300K state goal (not $3,000 — that example used rounded teaching numbers).

Stretch goal = base × community stretch multiplier (default **1.67×**), capturing house parties, special events, campus upside without rewriting base victory math.

---

## Allocation universe

| Layer | Rule |
|-------|------|
| **Top 40 cities** | In vote-share denominator; each gets `(cityVotes / top40Total) × stateGoal` |
| **Bonus cities (#41+)** | **Excluded** from denominator and statewide rollups; manual override only (Quitman: $2K base / $5K stretch) |
| **Coalition / SMOS / CCH workbenches** | No vote-target allocation — not in Top 40 city pool |
| **County rural remainder** | Phase 2 — allocate county-level vote targets not assigned to named cities |

---

## Base vs stretch

| Field | Purpose |
|-------|---------|
| **Base goal** | Tied to victory math — non-negotiable planning floor |
| **Stretch goal** | House parties, special events, campus fundraising, unexpected opportunities |

Per-community stretch multipliers live in `fundraising-operating-system.source.json` (e.g. Sherwood 1.75× for host/VIP upside).

---

## Goal card (required on every community surface)

Every fundraising display must include:

```text
Base Goal · Stretch Goal · Raised · Gap · Ownership (Fundraising Lead)
```

**Sherwood (live FOS, 2026-06-16):**

```text
Base Goal           $9,390
Stretch Goal        $16,433
Raised              $0
Gap                 $9,390
Fundraising Lead    OPEN
```

**A goal without an owner is just a number.** See [Fundraising Opportunity Architecture](./FUNDRAISING_OPPORTUNITY_ARCHITECTURE.md) for the pipeline that makes targets executable.

---

## Rollups (automatic)

```text
Community base goals
        ↓ sum by county
County rollup
        ↓ sum by cluster (execution.clusters from snapshot)
Cluster rollup
        ↓ sum statewide
State rollup ($300,000 target)
```

**Pulaski County (live calc):** Little Rock + NLR + Sherwood + Jacksonville + Maumelle → **~$100K base** at $300K state goal.

**Central Arkansas Metro cluster:** Pulaski + Saline + Lonoke + Faulkner counties → **~$126K base**.

Rollups recompute whenever snapshot vote targets or FOS config change — no manual spreadsheet maintenance.

---

## Phase 1 surfaces (live)

| Surface | Route | What shows |
|---------|-------|------------|
| **Community Workbench** | `/election-plan/workbenches/{slug}#fundraising` | Vote goal, base, stretch, raised ($0 until records), progress |
| **County Workbench v4** | `/election-plan/counties/{countySlug}#fundraising` | County rollup table + drill to communities |
| **War room tracker** | Election plan dashboard | Statewide raised (provisional from AR filing) vs budget milestones |

---

## Raised amounts — data integrity

| Level | Raised source (Phase 1) |
|-------|-------------------------|
| **State** | `fundraising-tracker.json` — provisional $60K until post-filing reconciliation |
| **Community / county / cluster** | **$0** — no fake allocation of statewide raised across cities |

**Hard rule:** Do not divide provisional statewide raised across communities without compliance-backed donation records per geography.

---

## Fundraising sources (Phase 2)

Track separately when donation records exist:

| Source | KPIs |
|--------|------|
| **Direct Donations** | Goal, raised, donors, average gift |
| **House Parties** | Goal, held, scheduled, revenue |
| **Fundraising Events** | Goal, held, revenue |
| **College Teams** | Participants, revenue, new donors |
| **Coalition Giving** | Veterans, women, faith, labor, business lanes |

Schema defined in `fundraising-operating-system.source.json` → `fundraisingSources[]`.

---

## County Fundraising Workbench structure (Phase 2)

Every county eventually gets:

```text
Fundraising Overview
Goal · Raised · Pipeline · Events · House Parties · Donors · Opportunities
```

---

## Fundraising Leadership Workbench (future)

After Leadership Workbench gates pass, dedicated roles get prospect lists, events, goals, and KPIs:

- County Fundraising Lead  
- House Party Lead  
- Major Donor Lead  
- Small Donor Lead  
- Campus Fundraising Lead  

Cross-reference: `docs/LEADERSHIP_WORKBENCH_ARCHITECTURE.md` + `leadership-workbench-registry.source.json`.

---

## Relationship to existing budget tracker

| System | Purpose |
|--------|---------|
| **`fundraising-tracker.json`** | Statewide milestone ($60K) + working campaign ($232K) = $292K combined — **actual raised tracking** |
| **FOS** | **$300K aggressive state goal** allocated by vote target to communities — **geographic responsibility** |

These are complementary: tracker answers *"How much have we raised?"* FOS answers *"Who owns raising which share?"*

---

## Phase 1 complete ✓

1. Calculate community fundraising targets from vote targets  
2. Roll community → county → cluster → state  
3. Surface goals on community and county workbenches  
4. Architecture + config registry  

## Phase 1 explicitly NOT built

- Donation processing  
- Donor CRM expansion  
- Projections / forecasting  
- Per-source revenue tracking  
- Fundraising Leadership Workbench UI  
- Fundraising Opportunity Pipeline UI  

---

## What comes next (planning locked)

**[Fundraising Opportunity Architecture](./FUNDRAISING_OPPORTUNITY_ARCHITECTURE.md)** — answers *How do we get there?* Ten opportunity types (house parties, grassroots events, major donor meetings, …) with ownership, KPIs, rollups, and drill-down doctrine.

Registry: `data/campaign-brain/fundraising-opportunity-registry.source.json`

---

## Build order (after pilot — do not reorder)

```text
1. PPEN A.0b + A.0c
2. Leadership Workbenches
3. Fundraising Opportunity Pipeline (FOP-1 → FOP-3)
4. Fundraising Leadership Workbenches
5. Donation Record Layer → community/county raised rollups
```

Legacy phase labels:

```text
FOS-2   Donation records → raised rollups (after FOP)
FOP-1   House parties · business outreach · grassroots events
FOP-2   Major donor · small dollar · campus · coalition · sponsorships
FOP-3   Online · recurring
FOS-4   County Fundraising Workbench shell
FOS-5   Fundraising Leadership Workbench
```

---

## Related docs

- `docs/FUNDRAISING_OPPORTUNITY_ARCHITECTURE.md`  
- `docs/ELECTION_PLAN_DATA_INTEGRITY_DOCTRINE.md`  
- `docs/LEADERSHIP_WORKBENCH_ARCHITECTURE.md`  
- `docs/strategic-plan/plurality-victory-plan/executive-book-v1/06-CAMPAIGN-BUDGET-AND-FUNDRAISING-TARGETS.md`  
- `docs/COUNTY_WORKBENCH_V4_DOCTRINE.md`
