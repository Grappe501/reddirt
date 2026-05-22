# County Data → Event Planning

**Helper:** `county-event-strategy.ts` · **UI:** `EventCountyIntelligenceCard` on planning tab

## Questions answered

| Question | Source |
|----------|--------|
| Why this event here? | `whyHere` + opportunities |
| County goals? | Registration + Power of 5 planning targets |
| What should Kelly say? | `kellyTalkingPoints` |
| Who to recruit? | `recruitTargets` |
| Follow-up? | `followUpActions` + workbench links |

## Wiring

`/admin/campaign-events/[recordId]` → `loadEventCountyContext(row.county)` server-side.

County slug resolved via workbench county name → registry slug match.
