# Kelly win target model V1 (scenario)

This document describes the **planning / scenario** math used in `data/election/kelly-win-target-scenario-v1.json`. It is **not** a public prediction of election outcomes. Staff and the Kelly agent use it to **recommend, explain, and prioritize** counties; **humans approve** field plans, spend, and outreach.

## Inputs

- **County election history** — `data/election/arkansas-county-election-history.normalized.json` (per-race totals and Democratic votes where available). The build script can synthesize missing counties so the pipeline runs; replace with **official SOS / vendor** tables when ingested.
- **Registration goals** — `data/election/arkansas-voter-registration-goals.normalized.json` (optional; neutral score when absent).
- **County priority snapshot** — `data/calendar-command-center/county-priority-snapshot.json` (opportunity / travel heuristics).
- **County facts** — `data/calendar-command-center/county-facts.json` (registered voters when numeric; otherwise flagged `needs_data`).
- **Registry** — `ARKANSAS_COUNTY_REGISTRY` for the authoritative 75-county list.

## Statewide formulas

```text
projectedStatewideVotes = Σ county.projectedTotalVotes
legalTarget50Plus1      = floor(projectedStatewideVotes / 2) + 1
workingTargetWithCushion = ceil(legalTarget50Plus1 + projectedStatewideVotes * cushionPct)
```

Default `cushionPct = 0.0075` (0.75%). Override via scenario `config` or env `KELLY_WIN_TARGET_CUSHION` when running `npm run election:targets:build`.

## Projected county turnout

Weighted blend of **official-style** race totals (weights renormalized if a race is missing):

```text
0.45 · SOS_2022_total
+ 0.20 · Treasurer_2022_total
+ 0.20 · Treasurer_2024_total
+ 0.15 · Presidential_2024_total · midtermDropoffFactor
```

Default `midtermDropoffFactor = 0.72` (midterm / down-ballot discount on presidential volume). Editable in `config` or env `KELLY_WIN_TARGET_MIDTERM_DROPOFF`.

## Baseline Democratic support

Weighted average of Democratic votes:

```text
0.40 · SOS_2022_dem
+ 0.20 · Treasurer_2022_dem
+ 0.25 · Treasurer_2024_dem
+ 0.15 · Presidential_2024_dem
```

Weights renormalize when a leg is missing; confidence drops when coverage is thin.

## County capacity score

Composite (each sub-score clamped to \([0,1]\)):

```text
0.30 · baselineDemVoteShareScore
+ 0.20 · registrationGoalScore
+ 0.15 · turnoutHeadroomScore
+ 0.15 · recentGrowthScore
+ 0.10 · countyOpportunityScore
+ 0.05 · travelEfficiencyScore
+ 0.05 · localInfrastructureScore
```

Component rationales live in code comments in `src/lib/election-targets/build-win-target-scenario.ts` so the UI / agent can echo **why** a county received capacity weight.

## Vote gap allocation

```text
statewideBaselineVotes = Σ county.baselineDemVotes
statewideVoteGap       = workingTargetWithCushion − statewideBaselineVotes
```

If `statewideVoteGap > 0`, allocate gain by capacity share:

```text
countyTargetVoteGain ≈ round(statewideVoteGap · countyCapacityScore / Σ countyCapacityScore)
countyTargetVotes    ≈ round(baselineDemVotes + countyTargetVoteGain)
```

If the gap is **not positive**, counties **hold** at baseline (no artificial inflation).

### Plausible-share guardrail

```text
maxPlausibleShare = max(recentDemShare + 0.12, recentDemShare · 1.25)
countyTargetVotes = min(countyTargetVotes, floor(projectedTotalVotes · maxPlausibleShare))
```

## Outputs

- **Scenario JSON** — `data/election/kelly-win-target-scenario-v1.json`
- **CSV** — `data/election/kelly-county-targets-v1.csv`
- **Agent tool** — `win_targets` in `src/lib/kelly-agent/kelly-agent-tools.ts` (read-only bundle for `/recommend`).

## Human override

The Kelly agent **never** autonomously spends, contacts voters, publishes calendar events, or commits the candidate. Win targets are **advisory**; field leadership can override any county weighting after review.

## References (context only)

- [2024 United States presidential election in Arkansas](https://en.wikipedia.org/wiki/2024_United_States_presidential_election_in_Arkansas) — turnout shape by county (presidential cycle; midterm discount applied in-model).
- [2022 Arkansas Secretary of State election](https://en.wikipedia.org/wiki/2022_Arkansas_Secretary_of_State_election) — closest office analog for baseline weighting until SOS ingest is live.
