# County Action Package System

**Code:** `src/lib/agents/county-intelligence/county-action-package-builder.ts`

## Package types

- `county_recovery`
- `county_growth`
- `event_preparation`
- `power_of_five_push`
- `volunteer_recruitment`
- `candidate_visit`
- `post_event_followup`

## Contents

Each `CountyActionPackage` includes: county summary, top goals/gaps, Power of 5 and registration targets, volunteer need, event and communications recommendations, field and intern task lists, candidate talking points, follow-up plan, and `routesToOpen`.

## Builders

- `buildCountyActionPackage(slug, type)` — single county
- `buildCountyActionPackagesForWeakCounties(limit)` — statewide weak set

## Observation

`county_action_package_created` when operators generate packages from command center or copilots.

## Test

`npm run agents:test-county-copilots` (Pulaski `county_recovery`)
