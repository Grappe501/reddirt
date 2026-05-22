# Campaign Knowledge Graph — Architecture

**Phase:** 3A — Campaign Knowledge Graph + Lessons Engine  
**North star:** Turn `CampaignState` from a snapshot into a living memory system.

---

## Purpose

The orchestration layer already **displays** what the campaign looks like right now. Phase 3A adds **learning**: ingest signals, connect entities, store lessons, and close the recommendation feedback loop so the AI knows what worked.

---

## Core questions answered

| Question | Source |
|----------|--------|
| What does the AI know? | `knowledgeMemory.knowsSummary` + entity graph summary |
| How does it know it? | Entity nodes carry `sourceSystem`, `sourceRef`, `confidence` |
| What changed? | `knowledgeMemory.recentChanges` (fresh lessons) |
| What worked / failed? | Lessons with `lessonType` + recommendation feedback statuses |
| What patterns are emerging? | `detectEmergingPatterns()` across lessons |
| What should we do differently? | Approved lessons linked to domains/counties/events |
| Which domains are under-informed? | Graph `underInformedKinds` + `underInformedDomains` |
| Which recommendations improved outcomes? | `RecommendationFeedbackSummary.successRate` |

---

## Entity graph

**Types:** `src/lib/agents/campaign-knowledge/campaign-entity-graph-types.ts`

**Node kinds:** person, county, organization, event, message, workflow, decision, outcome, observation, lesson, recommendation, blocker, tool_usage

**Storage:** `data/campaign-events/campaign-knowledge/entity-graph.json`

**Store:** `campaign-entity-graph-store.ts` — load, save, upsert with 500-node cap

---

## Intake pipeline

```
User observations ──┐
Hot wash learning ──┼──► campaign-observation-intake.ts ──► mergeIntakeResults
County intelligence ┤                                              │
Active blockers ────┘                                              ▼
                                                          entity graph + lesson candidates
```

**Loader:** `load-campaign-knowledge-bundle.ts` orchestrates intake, persists graph, ranks lessons, builds memory slice.

---

## Lessons engine

**Storage:** `data/campaign-events/campaign-knowledge/lessons.json`

**Engine:** `campaign-lessons-engine.ts`

- Ingest lesson candidates (dedupe by title)
- Rank by usefulness + confidence + approval status
- Refresh freshness (fresh / aging / stale)
- Detect emerging patterns and recurring blockers

**Human gate:** Lessons default to `proposed`; `approved` required for high-trust reasoning.

---

## Recommendation feedback loop

**Storage:** `data/campaign-events/campaign-knowledge/recommendation-feedback.json`

**Statuses:** pending, accepted, rejected, completed, ignored, successful, failed

**API surface (V1):** `recordRecommendationFeedback()` — UI wiring in Phase 3B.

---

## CampaignState integration

`CampaignKnowledgeMemorySlice` is merged into `CampaignState.knowledgeMemory` during `loadCampaignOrchestrationSignals`:

1. Build preliminary state (for blockers)
2. Load knowledge bundle with blockers
3. Push `campaign_knowledge` into `sourceHealth`
4. Rebuild state with full memory slice

**UI:** `/admin/orchestration` → `OrchestrationKnowledgeMemoryPanel`

---

## Tool lifecycle

**Id:** `campaign_knowledge_graph`  
**Contracts:** 20 tools in `sprint-campaign-knowledge-tools.ts`  
**Test:** `npm run agents:test-campaign-knowledge`

---

## Safety

- No raw PII in graph nodes — metadata and summaries only
- No auto-approval of strategic lessons
- Graceful degradation if county/hot-wash loaders fail
- Recommendation feedback is operator-recorded only

---

## Future (Phase 3B+)

- Comms / volunteer / finance / tool-usage intake (contracts marked `idea`)
- Lesson approval UI
- Recommendation feedback on top moves
- Graph visualization
