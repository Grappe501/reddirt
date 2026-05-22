# County Copilot Applications (V2)

**Lane:** `RedDirt/`  
**Code:** `src/lib/agents/county-intelligence/county-copilot-applications.ts`  
**Engine merge:** `src/lib/agents/role-copilots/copilot-intelligence-engine.ts` → `mergeCountyIntoCopilotBrief`

## Roles wired

| Copilot | County guidance |
|---------|-----------------|
| Field manager | Top weak counties, daily field plan, PO5 gaps, event needs, routes |
| County lead | Local goals, weaknesses, outreach plan, PO5/volunteer targets |
| Volunteer coordinator | Counties needing recruitment, event staffing, PO5 helpers |
| Intern | Safe research, profile review, data cleanup tasks |
| Communications lead | Message angles, issue patterns, PO5 copy drafts |
| Candidate | County briefing, talking/listening points, follow-up focus |
| Campaign manager | Statewide weak/opportunity summary via same merge |

## APIs

- `applyCountyIntelToCopilot(role, countySlug?)` — structured `CountyCopilotApplication`
- `buildFieldManagerDailyCountyPlan()` — `FieldManagerDailyCountyPlan`
- `buildCandidateCountyBriefing(slug)` — `CountyIntelligenceSummary`
- `buildCopilotBriefWithCounty(role, slug?)` — full copilot brief with county tasks

## Human gates

- Recommendations only — no auto outreach, email, or workbench writes
- Intern tasks require supervisor review

## Test

`npm run agents:test-county-copilots`
