# Relationship Intelligence Graph

**Path:** `src/lib/communications/relationship-intelligence/`

## Model

- `RelationshipNode` — volunteer, host, county leader, donor, team; trust, influence, engagement, burnout, follow-up flags
- `RelationshipGraph` — built from `communications-store` contacts + send audit (read-only)

## APIs

- `buildRelationshipGraph()` / `loadRelationshipGraph()`
- `buildRelationshipHealthBrief()`
- `buildRelationshipMemoryLines(node)`

## Storage

Optional persist: `data/campaign-events/communications/relationship-graph.json`

## Test

`npm run communications:test-relationships`
