# Communications Intelligence System (V2)

**Lane:** `RedDirt/` · single-campaign Kelly SOS  
**Code:** `src/lib/communications/`

## Architecture

```text
campaign-events/communications (JSON store, templates, readiness)
        ↓
relationship-intelligence (graph, engagement, strength)
        ↓
sequences (cadence, human-reviewed steps)
        ↓
writing-orchestration (audience × purpose × county)
        ↓
communications-intelligence-engine (dashboard context)
        ↓
/admin/communications/intelligence · /studio · copilots
```

## Human gates

- Mass send **blocked** in V1 bundle
- `EMAIL_SEND_ENABLED` required for production approval sends
- No inbox scraping · metadata + campaign interactions only
- Political persuasion and PO5 asks require explicit human approval

## Surfaces

| Route | Purpose |
|-------|---------|
| `/admin/communications` | Command center (providers, contacts) |
| `/admin/communications/intelligence` | Statewide comms priorities |
| `/admin/communications/studio` | Draft assist — no send button |

## Tests

```bash
npm run communications:test-intelligence
npm run communications:test-relationships
npm run communications:test-writing-orchestration
npm run campaign-events:test-communications
```
