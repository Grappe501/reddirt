# Phase 3A — Campaign Knowledge Graph + Lessons Engine Handoff

**Lane:** RedDirt  
**Branch:** `feature/kelly-schedule-settlement-dashboard`  
**Sprint:** Campaign Orchestration Intelligence — Phase 3A  
**North star:** How does this improve the AI's understanding of the entire campaign?

---

## Summary

Phase 3A transforms `CampaignState` from a live snapshot into a **living campaign memory system**. The AI is now both:

1. **Map reader** — understands current reality via CampaignState + knowledge graph  
2. **Map builder** — improves the map from observations, blockers, lessons, and recommendation feedback  

---

## What was built

| Piece | Status |
|-------|--------|
| Canonical types (`CampaignKnowledgeEntity`, `Edge`, `Observation`, `Lesson`, `RecommendationFeedback`) | ✅ |
| Deterministic graph builder from CampaignState + sourceHealth | ✅ |
| Observation intake (`intakeRawObservation`, user observation bridge) | ✅ |
| Lessons engine (recurring blockers, knowledge gaps, patterns) | ✅ |
| Recommendation feedback loop (types + store bridge) | ✅ |
| `CampaignState.knowledge` summary | ✅ |
| Reasoning engine uses lessons + gaps in top moves | ✅ |
| Read-only API `GET /api/agents/campaign-knowledge-state` | ✅ |
| Orchestration UI section **Campaign Knowledge + Lessons** | ✅ |
| Tool lifecycle `campaign_knowledge_graph` (20 tools) | ✅ |
| `agents:test-campaign-knowledge` | ✅ |

---

## Files changed / added

### Core module (`src/lib/agents/orchestration/knowledge/`)

| File | Role |
|------|------|
| `campaign-knowledge-types.ts` | Entity, edge, observation, lesson, feedback, summary types |
| `campaign-knowledge-graph.ts` | `buildCampaignKnowledgeGraph` — deterministic V1 builder |
| `campaign-observation-intake.ts` | Raw note → structured observation; prohibited content filter |
| `campaign-lessons-engine.ts` | Recurring blockers, knowledge gaps, lesson ranking |
| `campaign-recommendation-feedback.ts` | Feedback types + legacy store bridge |
| `campaign-knowledge-state.ts` | `buildCampaignKnowledgeLayer` — orchestration entry |
| `campaign-knowledge-readme.ts` | Module orientation for agents |
| `knowledge-memory-adapter.ts` | Sync legacy `knowledgeMemory` from `knowledge` |

### Integration

- `campaign-state-types.ts` — added `knowledge: CampaignKnowledgeSummary`
- `build-campaign-state-from-signals.ts` — merges knowledge summary
- `load-campaign-orchestration-signals.ts` — 11th source `campaign_knowledge`
- `orchestration-reasoning-engine.ts` — top moves reference gaps + recurring blockers
- `orchestration-learning-insights.ts` — knowledge-aware summaries
- `src/app/api/agents/campaign-knowledge-state/route.ts` — read-only API
- `OrchestrationKnowledgeMemoryPanel.tsx` — dashboard section
- `sprint-campaign-knowledge-tools.ts` — 20 tool contracts
- `ai-tools-supplement.ts` — lifecycle registration

### Persistence (JSON, existing)

- `data/campaign-events/campaign-knowledge/entity-graph.json`
- `data/campaign-events/campaign-knowledge/lessons.json`
- `data/campaign-events/campaign-knowledge/recommendation-feedback.json`

### Legacy bridge

- `src/lib/agents/campaign-knowledge/*` — persistence stores retained; orchestration/knowledge is canonical

---

## Graph model

**Entities:** person, county, organization, event, message, workflow, recommendation, decision, task, donor, volunteer, media_item, issue, risk, blocker, opportunity, tool, domain, document, observation, lesson, outcome

**Edges:** relates_to, caused_by, blocks, unlocks, supports, contradicts, belongs_to, occurred_at, involved_person, involved_county, used_tool, produced_lesson, triggered_workflow, generated_recommendation, accepted/rejected_recommendation, completed/failed_workflow, improved/weakened_domain, needs_followup

**Builder inputs:** CampaignState, sourceHealth, observations, persisted entities, blockers, opportunities, domain statuses, county heat list, finance warnings, prepared workflows

---

## Lessons model

**Types:** what_worked, what_failed, repeated_blocker, emerging_pattern, county/message/volunteer/event/finance/compliance/tool/workflow_learning, strategic_warning, strategic_opportunity, **knowledge_gap**

**Knowledge gaps** are first-class — the AI explicitly learns what it does not know (degraded sources, weak domains, sparse graph, county bridge missing, email gates, workflow friction).

---

## Observation intake

- `intakeRawObservation({ title, rawText, source, domains, counties, people, tags, sensitivity })`
- Prohibited content filter (secrets, SSN patterns, etc.)
- Strategic/sensitive observations default to `proposed` approval — never auto-approved
- Suggests entities, edges, lessons without auto-persisting sensitive memory

---

## Recommendation feedback

**Statuses:** proposed, accepted, rejected, ignored, completed, failed

**Store:** `recordRecommendationFeedback()` via orchestration/knowledge bridge  
**UI:** Phase 3B — mark top moves accepted/rejected/successful

---

## CampaignState integration

```typescript
campaignState.knowledge: {
  graphHealth,
  strongestLessons,
  recentObservations,
  recurringBlockers,
  knowledgeGaps,
  recommendationFeedbackSummary,
  staleDomains,
  knowsSummary,
  unknownSummary,
}
```

---

## Dashboard integration

`/admin/orchestration` → **Campaign Knowledge + Lessons** panel shows graph health, strongest lessons, recent observations, knowledge gaps, recurring blockers, stale domains, recommendation feedback summary.

---

## API

`GET /api/agents/campaign-knowledge-state?period=2026-04`

Read-only. Returns `knowledge` summary + safety object. No auto-execution.

---

## Tests run

| Command | Result |
|---------|--------|
| `npm run agents:test-campaign-knowledge` | **PASS** |
| `npm run agents:test-orchestration-state` | **PASS** |
| `npm run agents:test-orchestration-plan` | **PASS** |
| `npm run typecheck` | **PASS** |
| `npm run build` | **FAIL — OOM** (Node heap limit on build machine; not a type error) |
| `npx prisma migrate status` | **PASS** — 80 migrations, schema up to date |

---

## Migration status

No new migrations required — Phase 3A uses JSON file stores only.

---

## Known gaps (Phase 3B)

- Recommendation feedback UI on top moves
- Lesson approval admin UI
- Comms/volunteer/finance/tool-usage full intake (contracts marked `idea`)
- Graph visualization
- Production build OOM on current agent machine — retry with `NODE_OPTIONS=--max-old-space-size=8192` locally

---

## Next recommended sprint

**Phase 3B — Recommendation feedback UI + lesson approval gate**

- Mark top moves accepted/rejected/completed/failed from orchestration panel
- Approve/reject proposed lessons
- Wire feedback into reasoning confidence scoring

---

## Safety

- No auto-send, GCal write, finance post, voter export
- No auto-approval of strategic/sensitive memory
- Graceful degradation when sources fail — gaps surfaced, not hidden
- Human gates on all execution paths
