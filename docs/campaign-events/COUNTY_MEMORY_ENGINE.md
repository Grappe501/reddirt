# County Memory Engine (Sprint 7)

**Lane:** `RedDirt/`  
**Pattern:** Additive summaries only — no destructive overwrite.

## Storage

`data/campaign-events/county-memory/{county-slug}.json`

Each approved/completed hot wash merges:

- Recurring issues, volunteers, hosts, donors (deduped append)
- Strong/weak messaging snippets
- Turnout and geography notes
- Best event formats, organizer reliability notes
- Relationship graph placeholders (V2)

## Code

| Module | Role |
|--------|------|
| `county-memory-types.ts` | Record shape |
| `county-memory-store.ts` | Read/write JSON per county |
| `county-memory-builder.ts` | `applyHotWashToCountyMemory()` |
| `county-pattern-detector` | `summarizeCountyTrends()` for command center |

## Command center

`loadCampaignLearningSnapshot()` aggregates county files for trends (issues, formats, volunteer/donor signal counts).

## Human gate

County memory updates only when an operator completes hot wash intelligence review (not on draft save alone).
