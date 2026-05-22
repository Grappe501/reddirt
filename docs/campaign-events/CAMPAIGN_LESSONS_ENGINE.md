# Campaign Lessons Engine

**Module:** `src/lib/agents/campaign-knowledge/`  
**Phase:** 3A

---

## What a lesson is

A **lesson** is structured campaign memory: what worked, what failed, or a pattern the staff should remember next time.

```typescript
// campaign-lessons-types.ts (conceptual)
{
  title, summary,
  domainId, lessonType,  // what_worked | what_failed | pattern | county | operational
  confidence,            // low | medium | high
  freshness,             // fresh | aging | stale (computed)
  usefulnessScore,       // 0–100 rank input
  sourceKind, sourceRef,
  linkedEntityIds[],
  status,                // proposed | approved | rejected | archived
  requiresHumanApproval
}
```

---

## Lifecycle

1. **Intake** — observation intake proposes lesson candidates from observations, hot wash, county gaps, blockers
2. **Dedupe** — `ingestLessonCandidates` skips duplicate titles
3. **Propose** — new lessons start as `proposed` with `requiresHumanApproval: true`
4. **Approve** — operator promotes to `approved` (Phase 3B UI; store API ready)
5. **Rank** — `rankCampaignLessons` sorts by usefulness + confidence + approval
6. **Surface** — top lessons appear in `knowledgeMemory.strongestLessons` and orchestration panel

---

## Freshness

| Age | Label |
|-----|-------|
| ≤ 14 days | fresh |
| ≤ 60 days | aging |
| > 60 days | stale |

Stale lessons contribute to `knowledgeMemory.staleDomains`.

---

## Pattern detection

- **Emerging patterns:** ≥ 2 pattern/failure lessons in same domain
- **Recurring blockers:** ≥ 2 blockers with same message prefix

Both feed `CampaignKnowledgeMemorySlice` for reasoning and UI.

---

## Linking

Lessons link to graph entities via `linkedEntityIds`. County lessons include `countySlug`. Domain id ties lesson to orchestration domain map.

---

## Files

| File | Role |
|------|------|
| `campaign-lessons-types.ts` | Types |
| `campaign-lessons-store.ts` | JSON persistence |
| `campaign-lessons-engine.ts` | Rank, ingest, patterns |
| `campaign-observation-intake.ts` | Candidate generation |
| `campaign-knowledge-memory-types.ts` | Memory slice builder |

---

## Operator workflow (V1)

1. Run orchestration load (automatic on `/admin/orchestration` or API)
2. Review **Campaign knowledge memory** panel
3. Approve/reject lessons manually in JSON or wait for Phase 3B UI
4. Record recommendation feedback when acting on AI top moves

---

## Test

```bash
cd RedDirt
npm run agents:test-campaign-knowledge
```
