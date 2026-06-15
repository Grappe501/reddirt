# Win Target Methodology — How We Create Target Numbers

**Lane:** `RedDirt/` · **Audience:** Kelly, Steve, Campaign Manager, data lead  
**Status:** Draft — **methodology decision required before Victory Map / Priority 2 treat targets as locked**  
**Technical reference:** [`docs/election/KELLY_WIN_TARGET_MODEL_V1.md`](../election/KELLY_WIN_TARGET_MODEL_V1.md)  
**Implementation:** `src/lib/election-targets/build-win-target-scenario.ts`  
**Scenario file:** `data/election/kelly-win-target-scenario-v1.json`  
**Rebuild:** `npm run election:targets:build`

> **Planning scenario — not a forecast.** Win targets exist so the campaign can allocate effort with explicit assumptions. They do not predict election outcomes.

---

## Why this document exists

Victory OS displays numbers like **203,049 statewide vote gap** and **764,876 working target**. Leadership must decide **how those numbers are produced** before:

- Victory Map classifications treat win-target percentiles as authoritative  
- Deployment Priority Engine uses county targets in scoring  
- Field staff or county chairs hear target numbers as operational orders  

This is **Decision 5 (Victory Assumptions)** in the Leadership Lock Session — expanded here for data and math clarity.

---

## The five-layer model (keep separate)

| Layer | Question | Output |
|-------|----------|--------|
| **1. Statewide win number** | What is 50% + 1, with what cushion? | `legalTarget50Plus1`, `workingTargetWithCushion` |
| **2. Projected turnout** | How many votes will be cast statewide? | `projectedTotalVotes` per county → sum |
| **3. Baseline Democratic vote** | Where do we start from historically? | `baselineDemVotes`, `baselineDemShare` |
| **4. Gap allocation** | How do we distribute the votes we still need? | `targetVoteGain`, `targetVotes` per county |
| **5. Guardrails** | What is implausible to ask of a county? | Plausible-share cap, confidence flags |

**Do not merge layers in debate.** Example: a county can have high turnout headroom (Layer 2–3) but low capacity score (Layer 4) if registration goals are missing.

---

## Layer 1 — Statewide win number

**North star (doctrine):** 50% + 1 statewide.

```text
projectedStatewideVotes     = Σ county.projectedTotalVotes
legalTarget50Plus1          = floor(projectedStatewideVotes / 2) + 1
workingTargetWithCushion    = ceil(legalTarget50Plus1 + projectedStatewideVotes × cushionPct)
statewideVoteGap            = workingTargetWithCushion − Σ county.baselineDemVotes
```

| Parameter | V1 default | Leadership lock |
|-----------|------------|-----------------|
| `cushionPct` | **0.75%** (0.0075) | ☐ Lock ☐ Revise → ___ |

**Leadership question:** Is 0.75% cushion enough for recount / late ballots / turnout surprise — or should planning use 1.0% / 1.5%?

**Current scenario (illustration):** ~1,507,143 projected votes → **753,572** legal → **764,876** working → **203,049** gap.

---

## Layer 2 — Projected county turnout (history + midterm realism)

Blend **official-style** past race totals per county. Weights renormalize when a race is missing.

```text
projectedTotalVotes =
  0.45 × SOS_2022_total
+ 0.20 × Treasurer_2022_total
+ 0.20 × Treasurer_2024_total
+ 0.15 × Presidential_2024_total × midtermDropoffFactor
```

| Parameter | V1 default | Leadership lock |
|-----------|------------|-----------------|
| SOS 2022 weight | 0.45 | ☐ |
| Treasurer 2022 weight | 0.20 | ☐ |
| Treasurer 2024 weight | 0.20 | ☐ |
| Presidential 2024 weight | 0.15 (before dropoff) | ☐ |
| `midtermDropoffFactor` | **0.72** | ☐ Lock ☐ Revise → ___ |

**Leadership questions:**

- Is **2022 SOS** the right anchor race for a 2026 SOS campaign? (Closest office analog — yes until Kelly-specific history exists.)  
- Should presidential 2024 be discounted more aggressively in rural counties? (Future enhancement — not in V1.)  
- When a county is **missing** a race leg, do we accept renormalized weights or mark county **unknown** for turnout?

**Data trust:** See [Data sources and trust tiers](#data-sources-and-trust-tiers) — synthetic history must not drive field targets without leadership acknowledgment.

---

## Layer 3 — Baseline Democratic vote

Weighted average of Democratic votes in the same races:

```text
baselineDemVotes =
  0.40 × SOS_2022_dem
+ 0.20 × Treasurer_2022_dem
+ 0.25 × Treasurer_2024_dem
+ 0.15 × Presidential_2024_dem
```

| Parameter | V1 default | Leadership lock |
|-----------|------------|-----------------|
| SOS 2022 dem weight | 0.40 | ☐ |
| Treasurer 2022 dem weight | 0.20 | ☐ |
| Treasurer 2024 dem weight | 0.25 | ☐ |
| Presidential 2024 dem weight | 0.15 | ☐ |

**Derived:** `baselineDemShare = baselineDemVotes / projectedTotalVotes`

**Leadership questions:**

- For **midterm D drop-off counties**, should baseline use SOS only (turnout lever) vs blended races (persuasion lever)?  
- Should Kelly-specific primary / prior run history replace SOS 2022 when available?

**Separate concept:** `priorComparableDemVotes` = SOS 2022 D votes (for win-contribution delta) — used in Victory Map seeding, not the same as baseline blend.

---

## Layer 4 — Realistic headroom & capacity allocation

After statewide gap is computed, distribute gain by **county capacity score** — not by population alone.

### Sub-scores (each clamped 0–1)

| Component | Weight (V1) | Meaning |
|-----------|------------:|---------|
| Baseline D share score | 0.30 | Higher existing share → more base to hold |
| Registration goal score | 0.20 | Room vs registration goal / registered voters |
| Turnout headroom score | 0.15 | Registered voters not yet in projected turnout |
| Recent growth score | 0.15 | Treasurer 2022 → 2024 D vote trend |
| County opportunity score | 0.10 | From calendar priority snapshot (heuristic) |
| Travel efficiency score | 0.05 | Few-opportunity counties penalized |
| Local infrastructure score | 0.05 | County facts / meeting status proxy |

```text
countyCapacityScore = weighted sum of sub-scores (weights above)

if statewideVoteGap > 0:
  targetVoteGain ≈ round(statewideVoteGap × countyCapacityScore / Σ countyCapacityScore)
  targetVotes      ≈ round(baselineDemVotes + targetVoteGain)
else:
  targetVotes = baselineDemVotes   // no artificial inflation
```

| Parameter | Leadership lock |
|-----------|-----------------|
| Capacity weights (7 components) | ☐ Approve V1 defaults ☐ Revise |
| Use calendar priority in capacity | ☐ Yes ☐ No — decouple from win target |
| Minimum confidence to include in allocation | ☐ high only ☐ medium+ ☐ all |

**Leadership questions:**

- Should **registration goals** drive allocation before official registered-voter counts exist?  
- Should **opportunity** in win-target math match Victory Map opportunity definitions after lock — or stay independent until Phase 2?  
- Counties with `missingData.length >= 3` get label `needs_data` — should they receive **zero** allocated gain until validated?

---

## Layer 5 — Guardrails (plausible share cap)

Prevent the model from assigning unrealistic vote shares:

```text
maxPlausibleShare = max(recentDemShare + 0.12, recentDemShare × 1.25)
targetVotes       = min(targetVotes, floor(projectedTotalVotes × maxPlausibleShare))
```

| Parameter | V1 default | Leadership lock |
|-----------|------------|-----------------|
| Absolute share bump cap | +12 percentage points | ☐ |
| Relative share multiplier | ×1.25 | ☐ |

**Leadership question:** Are +12pp / ×1.25 the right ceiling for persuasion + turnout combined — or too aggressive in red counties / too conservative in growth counties?

---

## Data sources and trust tiers

| Tier | Source | Use in V1 |
|------|--------|-----------|
| **A — Official** | SOS / vendor election results ingested | Preferred for all race legs |
| **B — Staged JSON** | `data/election/arkansas-county-election-history.normalized.json` | Primary file today |
| **C — Synthetic** | Build script fills missing counties with deterministic pseudo-history | **Runs pipeline; must be flagged** |
| **D — Missing** | No registration, no facts | `confidence: low`, `needs_data` |

**Registration:** `arkansas-voter-registration-goals.normalized.json` + optional `CountyCampaignStats.registrationGoal` from DB.

**County facts:** `data/calendar-command-center/county-facts.json` — registered voters when numeric.

**Leadership lock required:**

```text
☐ Synthetic history may be used for statewide planning totals until official ingest complete
☐ Synthetic history may NOT be shown to county chairs or field as county-specific targets
☐ Official SOS ingest replaces synthetic county-by-county as Tier A verified
```

---

## Confidence and missing data

Per county:

| `confidence` | Rule (V1) |
|--------------|-----------|
| **high** | No missing data flags |
| **medium** | 1–2 missing fields |
| **low** | 3+ missing fields |

**Dashboard labels:** `base_hold` · `growth_county` · `registration_opportunity` · `turnout_headroom` · `needs_data`

**Leadership alignment with readiness:** `needs_data` in win-target ≠ Weak readiness in Victory Map — same principle as **Unknown** readiness.

---

## Relationship to Victory Map and Priority 2

| System | Uses win target how |
|--------|---------------------|
| **Victory Map Sprint 0 seed** | Win-contribution percentiles → heuristic Critical (draft) |
| **Victory Map (after lock)** | Only if leadership locks win-target → map linkage |
| **Deployment Priority Engine** | **Blocked** until win-target methodology locked |
| **Path to Victory UI** | Displays planning gap from scenario file — labeled draft |

Win-target **capacity allocation** is not the same as **electoral importance** or **Kelly deployment**. Three dimensions — see [`sprint-0-5/00-STRATEGIC_FRAME.md`](./sprint-0-5/00-STRATEGIC_FRAME.md).

---

## County chair explainability test

A county chair should be able to hear:

> "Pulaski target vote gain is X because projected turnout is Y, baseline D is Z, registration headroom is [high/medium], and the statewide gap was allocated by capacity — capped at plausible share."

If leadership cannot explain a county number in **30 seconds**, the methodology is too complex for field use — simplify before lock.

---

## Leadership lock checklist (methodology)

| # | Decision | Locked? |
|---|----------|---------|
| 1 | Cushion % for working target | ☐ |
| 2 | Midterm dropoff factor on presidential leg | ☐ |
| 3 | Turnout race weights (4 races) | ☐ |
| 4 | Baseline D race weights (4 races) | ☐ |
| 5 | Capacity allocation weights (7 components) | ☐ |
| 6 | Plausible-share guardrail (+12pp / ×1.25) | ☐ |
| 7 | Synthetic vs official data policy | ☐ |
| 8 | Minimum confidence for operational use | ☐ |

**Lock sheet:** [`sprint-0-5/07-WIN_TARGET_METHODOLOGY_LOCK.md`](./sprint-0-5/07-WIN_TARGET_METHODOLOGY_LOCK.md)

---

## Amendment process

Changes to locked parameters require entry in [`ASSUMPTION_CHANGE_LOG.md`](./ASSUMPTION_CHANGE_LOG.md), then:

```bash
npm run election:targets:build
npm run victory:map:seed    # only after leadership approves map re-seed
```

---

## What we are not doing in V1

- Opponent modeling or partisan trend extrapolation beyond stored history  
- Voter-file microtargeting in target allocation  
- AI-generated vote predictions  
- Public publication of county targets on the website  

---

## Recommended sequence

1. Leadership locks methodology (this document + lock sheet 07).  
2. Data lead replaces synthetic counties with official SOS ingest where possible.  
3. Rebuild scenario JSON.  
4. Leadership reviews updated gap and county table.  
5. Only then tie win-target outputs to Victory Map refresh and Priority 2.
