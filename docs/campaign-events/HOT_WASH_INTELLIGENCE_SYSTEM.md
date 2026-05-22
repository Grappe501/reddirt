# Hot Wash Intelligence System (Sprint 7)

**Lane:** `RedDirt/`  
**Route:** `/admin/campaign-events/[recordId]` → Hot Wash tab

## Purpose

Turn each completed event into structured post-event intelligence: outcome, lessons, messaging, relationships, county signals, and follow-up — without overwhelming operators (progressive disclosure, summary-first).

## Storage

| Key | Location |
|-----|----------|
| `_hotWashIntelligence` | `CampaignEventLedgerRecord.factCard` |
| `_hotWash` (legacy sync) | Same record — updated on save/complete for backward compatibility |

**Load/save:** `src/lib/campaign-events/hot-wash-intelligence/hot-wash-intelligence-persist.ts`

## UI

- `HotWashIntelligenceWorkspace.tsx` — six collapsible sections + executive summary / top findings
- `hot-wash-intelligence-actions.ts` — save draft, complete review (learning loop), county preview, blueprint generate
- Media upload/approval unchanged below intelligence workspace in `HotWashMediaSection.tsx`

## Learning trigger

**Complete review & update memory** runs `runCampaignLearningLoop()`:

1. Enrich media metadata scaffolds (no transcription/OCR V1)
2. Additive county memory merge
3. Optional event blueprint when `isSuccessfulEvent()` heuristic passes

## Test

```bash
npm run campaign-events:test-hot-wash-intelligence
```

## AI tools (V1 deterministic)

Lifecycle `event_intelligence_sprint7` — see `sprint-event-intelligence-7-tools.ts` (20 contracts).
