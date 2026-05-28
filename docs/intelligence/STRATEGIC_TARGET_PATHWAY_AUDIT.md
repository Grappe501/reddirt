# Strategic Target Pathway Audit (NSI-7)

**Generated:** 2026-05-28  
**Lane:** RedDirt / Kelly SOS Campaign Intelligence  
**Purpose:** Inspect whether the strategic planning system has county-aware target numbers that roll up to a statewide winning number.

---

## Executive summary

The repo **does have** a statewide win-number scenario model and **75 county-level vote targets** with rollup math. County registration goals, live field tracking, and several baseline datasets remain **missing or incomplete**. The registration-to-vote conversion model exists only as **governed anecdotal assumptions** (30% turnout × 75% support capture) — not validated model output.

---

## Audit checklist

| Capability | Status | Location / notes |
|------------|--------|------------------|
| Statewide win number | **PRESENT** | `data/election/kelly-win-target-scenario-v1.json` — `workingTargetWithCushion: 764,876`, `legalTarget50Plus1: 753,572` |
| County-by-county vote targets | **PRESENT** | Same file — all 75 counties with `targetVotes`, `targetVoteGain`, `countyWinContribution` |
| County-by-county registration goals | **MISSING** | `data/election/arkansas-voter-registration-goals.normalized.json` — empty rows; all counties flag `registration_goal` in win scenario |
| Turnout assumptions | **PARTIAL** | Win scenario uses `midtermDropoffFactor: 0.72`; `data/simulations/turnout-sensitivity-models.json` exists; not wired to NSI-7 dashboard |
| Voter registration conversion assumptions | **ANECDOTAL** | `data/intelligence/campaign-voter-registration-assumptions.json` — 30% / 75%; `NEEDS_VALIDATION` |
| Volunteer capacity assumptions | **PRESENT** | `data/field-ops/volunteer-capacity-model-v1.json` |
| Field contact goals | **PARTIAL** | `data/field-ops/gotv-commitment-allocation-v1.json` — statewide goal 5,000; `currentCommitments: 0` (no live tracking) |
| Ballot initiative / direct democracy issue targets | **PARTIAL** | County briefings include ballot initiative impact sections; no statewide numeric targets |
| County priority tiers | **PRESENT** | `data/calendar-command-center/county-priority-snapshot.json` |
| Regional pathway model | **PRESENT** | `src/lib/intelligence/regionalStrategicModeling.ts` — clusters from NSI-6 |
| Persuasion / mobilization split | **MISSING** | No governed persuasion/mobilization vote split model in repo |
| Aggregate voter-file readiness | **PLANNED** | NSI-6 adapter registry marks voter-file adapters PLANNED, not LIVE |
| Election-results baseline | **PARTIAL** | `data/election/arkansas-county-election-history.normalized.json` (75 counties, synthetic/augmented); DB may be unpopulated |
| Turnout-history baseline | **PARTIAL** | Election history + turnout sensitivity models; low confidence on many counties |
| County rollup math | **PRESENT** | `src/lib/election-targets/build-win-target-scenario.ts`, `load-win-target-scenario.ts` |
| Path-to-victory dashboard | **PRESENT (NSI-7)** | `/admin/intelligence/strategic-target-pathway`; Calendar HUD at `/admin/calendar-command-center` |

---

## Statewide win number

**Artifact:** `data/election/kelly-win-target-scenario-v1.json`

| Field | Value |
|-------|-------|
| `projectedStatewideVotes` | 1,507,143 |
| `legalTarget50Plus1` | 753,572 |
| `workingTargetWithCushion` | 764,876 |
| `statewideBaselineVotes` | 561,827 |
| `statewideVoteGap` | 203,049 |

**Loaders:** `src/lib/election-targets/load-win-target-scenario.ts`, `win-target-types.ts`

**Note:** Manual LANE documentation references win numbers in the 325K–550K range that are **not reconciled** with the computed scenario (764,876). Operators must treat the JSON scenario as the governed planning artifact until reconciled.

---

## County vote targets

All 75 Arkansas counties have `targetVotes`, `targetVoteGain`, and `missingData` arrays. Most counties currently show:

- `confidence: "low"`
- `missingData` includes: `registration_goal`, `registered_voters_turnout_headroom`, `county_facts`

County targets **do roll up** to statewide gap math via `countyWinContribution` per county.

---

## Registration goals — gap

| Source | Status |
|--------|--------|
| `GLOBAL_NEW_VOTER_REGISTRATION_GOAL` | 50,000 (constant in `src/lib/campaign-dates.ts`) |
| `arkansas-voter-registration-goals.normalized.json` | **Empty rows — no county allocation** |
| Win scenario `registration_goal` flags | **All 75 counties missing** |

NSI-7 adds illustrative yield math only (`voterRegistrationTargetModel.ts`) — not a substitute for populated county goals.

---

## Field / volunteer / GOTV

| Artifact | Status |
|----------|--------|
| `volunteer-capacity-model-v1.json` | Present — capacity assumptions by region |
| `gotv-commitment-allocation-v1.json` | Present — statewide commitment goal 5,000; no live `currentCommitments` |
| Precinct-level PTV | **Not present** |

---

## NSI integration gaps

| Gap | Detail |
|-----|--------|
| Win-target not in NSI-6 adapter registry | Operational intelligence does not yet read win scenario |
| County ID conventions | NSI-5 uses `pulaski`; registry uses `pulaski-county`; field-ops uses `Pulaski` — normalized in sync layer |
| Census / BLS | PLANNED in adapter registry |
| Export-ready claims | Governed gate at 2 — must not regress |

---

## What data is needed to close gaps

1. **Official county registration goals** ingested into `arkansas-voter-registration-goals.normalized.json`
2. **SOS / county election results** to replace synthetic election history where flagged
3. **Live GOTV commitment tracking** wired to field-ops artifacts
4. **Reconciliation** of LANE manual win numbers vs `kelly-win-target-scenario-v1.json`
5. **Persuasion/mobilization split model** if strategic planning requires it (not yet specified)
6. **Win-target adapter** in NSI-6 read registry for operational overlay

---

## Governance

- Aggregate county-level only — no individual voter outputs
- Registration assumptions labeled `NEEDS_VALIDATION`
- No invented numbers in this audit except references to existing artifacts

---

## Related routes (NSI-7)

- `/admin/intelligence/strategic-target-pathway` — pathway dashboard
- `/admin/intelligence/morning-brief` — daily intelligence brief
- `/admin/intelligence/writing-toolbox` — governed draft helpers
