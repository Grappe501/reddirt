# Phase 3A — Campaign Knowledge Graph + Lessons Engine Handoff

**Lane:** RedDirt  
**Branch:** `feature/kelly-schedule-settlement-dashboard`  
**Status:** Phase 3A functional — graph, intake, lessons, feedback loop, CampaignState merge

---

## What shipped

| Piece | Status |
|-------|--------|
| Campaign entity graph (types + JSON store) | ✅ |
| Observation intake (observations, hot wash, county, blockers) | ✅ |
| Lessons engine (rank, freshness, patterns) | ✅ |
| Recommendation feedback store | ✅ |
| `CampaignKnowledgeMemorySlice` → `CampaignState.knowledgeMemory` | ✅ |
| 11th signal source: `campaign_knowledge` in sourceHealth | ✅ |
| 20 tool contracts (`campaign_knowledge_graph` lifecycle) | ✅ |
| Orchestration UI: knowledge memory panel | ✅ |
| `agents:test-campaign-knowledge` | ✅ |

---

## Key paths

```
src/lib/agents/campaign-knowledge/
  campaign-entity-graph-types.ts
  campaign-entity-graph-store.ts
  campaign-observation-intake.ts
  campaign-lessons-types.ts
  campaign-lessons-store.ts
  campaign-lessons-engine.ts
  recommendation-feedback-types.ts
  recommendation-feedback-store.ts
  campaign-knowledge-memory-types.ts
  load-campaign-knowledge-bundle.ts

src/lib/campaign-events/ai-tools/sprint-campaign-knowledge-tools.ts
src/components/admin/orchestration/OrchestrationKnowledgeMemoryPanel.tsx

data/campaign-events/campaign-knowledge/
  entity-graph.json
  lessons.json
  recommendation-feedback.json
```

---

## Commands

```bash
cd RedDirt
npm run agents:test-campaign-knowledge
npm run agents:test-orchestration-state
npm run agents:test-orchestration-plan
npm run typecheck
```

---

## CampaignState fields added

`campaignState.knowledgeMemory`:

- `strongestLessons`, `recentChanges`, `staleDomains`
- `confidenceGaps`, `recurringBlockers`, `emergingPatterns`
- `underInformedDomains`, `recommendationFeedbackSummary`
- `knowsSummary`, `unknownSummary`

---

## Not in 3A (Phase 3B)

- Recommendation feedback UI on top moves
- Lesson approval admin UI
- Comms/volunteer/finance/tool-usage intake (contracts only)
- Graph visualization
- Dedicated `GET /api/agents/campaign-knowledge` (optional; bundle loads via orchestration)

---

## Completion checklist

- [x] Entity graph persists from intake
- [x] Lessons proposed from signals
- [x] Memory slice on CampaignState
- [x] Orchestration command center shows memory
- [x] Tool lifecycle registered
- [ ] Steve: review lesson approval workflow
- [ ] Phase 3B: feedback UI + lesson approval

---

## North star

> How does this improve the AI's understanding of the entire campaign?

Phase 3A adds **memory** — the campaign brain can now learn from observations, hot wash, county signals, and operator feedback on recommendations.
