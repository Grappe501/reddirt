# Volunteer capacity and community coverage model V1

This packet is a **campaign-operations** planning aid: volunteer capacity, logistics, community-event support, **accessibility / language** support for public engagement, follow-up workload, and staff call prompts.

It is **not**:

- A voter-persuasion engine  
- A demographic micro-targeting system  
- An automated recommendation to contact voters  

**Human campaign leadership** approves political strategy, volunteer asks, and field plans.

## Outputs

- `data/field-ops/volunteer-capacity-model-v1.json` — full model + assumptions  
- `data/field-ops/volunteer-capacity-model-v1.csv` — summary export  
- Optional staff inputs (created empty by the build script if missing):  
  - `data/field-ops/volunteer-roster-inputs-v1.json` — roster hints (counts, hosts, guides, bilingual volunteers)  
  - `data/field-ops/county-acs-context-v1.json` — **public** ACS-style Hispanic or Latino population **share (percent)** for **accessibility** planning only  

## Inputs (file-staged)

- `data/election/kelly-win-target-scenario-v1.json` — operational workload proxies (`targetVotes`, `targetVoteGain`, `registrationGoal`)  
- `data/calendar-command-center/county-priority-snapshot.json` — touch counts, next anchors, `fewOpportunities` / `underTouched`  
- `data/calendar-command-center/community-opportunities-2026.normalized.json` — community events (high-value counts, campus/senior touchpoints)  

## Coverage need score (transparent blend)

All components are clamped to \([0,1]\) and combined as:

```text
coverageNeedScore =
  0.25 * normalizedTargetVoteGain +
  0.20 * normalizedRegistrationGoal +
  0.20 * opportunityLoadScore +
  0.15 * lowTouchPenalty +
  0.10 * localInfrastructureGap +
  0.10 * accessSupportNeed
```

- **Low touch penalty** increases **coverage need** when Nov 1→ touches are thin (logistics / relationship risk, not persuasion).  
- **Access support** reflects **language / partner** needs from optional ACS share and roster hints — **never** political preference.  

## Derived staffing (editable defaults)

Defaults live in `VolunteerCapacityAssumptions` (`src/lib/field-ops/volunteer-capacity-types.ts`). Staff should widen ranges when `missingData` is non-empty.

| Output | Formula (V1) |
|--------|----------------|
| `eventStaffingNeed` | `ceil(highValueCommunityEvents * eventVolunteerMinimum)` |
| `housePartyHostNeed` | `ceil(coverageNeedScore * 6)` |
| `followUpVolunteerNeed` | `ceil((upcomingCommunityEvents + housePartyHostNeed) / 2)` |
| `voterRegistrationEducationNeed` | blend of registration goal scale + coverage |
| `phoneBankCapacityNeedHours` | `round(coverageNeedScore * 25)` |
| `postcardCapacityNeedEstimate` | `round(coverageNeedScore * 500)` |
| `localGuideNeed` | `max(0, localGuidePerCountyMinimum - knownLocalGuides)` |

`highValueCommunityEvents` = opportunities with `campaignValue` ∈ {`must_attend`, `high_value`} and not duplicate / not_relevant.

## Hispanic / Latino community access layer

Uses **optional** `hispanicLatinoPopulationSharePercent` from `county-acs-context-v1.json` only to classify **access** (`hispanicCommunityAccessNeed`):

- `needs_bilingual_materials` — public materials / translation review / bilingual volunteer at events  
- `needs_local_partner` — trusted civic or community partner for distribution norms  
- `monitor` — thin data or borderline share  
- `none_known` — share below planning threshold  

**Do not** infer vote choice, party ID, or persuasion segments from ethnicity.

## Build

From `RedDirt/`:

```bash
npm run fieldops:volunteer-capacity:build
```

Requires win-target scenario JSON (run `npm run election:targets:build` first if missing).

## Kelly agent

Tool bundle key: `volunteer_capacity` — read-only structured output for staffing and access questions. Human override remains mandatory.
