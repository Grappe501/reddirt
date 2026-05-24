# Phase 3B — Feedback + Lesson Approval Loop Handoff

**Lane:** RedDirt  
**Branch:** `feature/kelly-schedule-settlement-dashboard`  
**Sprint:** Campaign Orchestration Intelligence — Phase 3B  
**North star:** How does this improve the AI's understanding of the entire campaign?

---

## What was built

Phase 3B closes the learning loop. The campaign brain can now record what humans did with recommendations, approve/reject lessons, and feed that back into CampaignState, reasoning, and the knowledge graph.

| Piece | Status |
|-------|--------|
| Recommendation outcome model | ✅ |
| Lesson approval model | ✅ |
| JSON persistence stores | ✅ |
| Feedback safety validation | ✅ |
| Feedback learning engine | ✅ |
| API routes | ✅ |
| Dashboard controls | ✅ |
| `CampaignState.feedbackLoop` | ✅ |
| Knowledge graph feedback observations/edges | ✅ |
| Reasoning uses ignored/failed/pending lesson signals | ✅ |
| `agents:test-orchestration-feedback-loop` | ✅ |

---

## Files changed

### Core module

`src/lib/agents/orchestration/feedback/`

| File | Role |
|------|------|
| `orchestration-feedback-types.ts` | RecommendationOutcome, LessonApproval, FeedbackLoopState |
| `recommendation-feedback-service.ts` | Record/list/summarize outcomes |
| `lesson-approval-service.ts` | Suggest/record/list lesson approvals |
| `feedback-learning-engine.ts` | Outcomes → observations, lessons, graph entities/edges, CampaignState summary |
| `feedback-safety.ts` | Status validation, secret/prohibited execution checks |
| `feedback-readme.ts` | Module orientation |

### Integration

- `campaign-state-types.ts` — adds `feedbackLoop`
- `build-campaign-state-from-signals.ts` — merges `FeedbackLoopState`
- `load-campaign-orchestration-signals.ts` — loads feedback loop before final state
- `orchestration-reasoning-engine.ts` — adoption risk, failed pattern, pending approval reasoning
- `knowledge/campaign-knowledge-state.ts` — feedback observations/lessons/entities/edges
- `knowledge/campaign-knowledge-types.ts` — lesson approval edge types
- `OrchestrationFeedbackLoopPanel.tsx` — dashboard controls
- `OrchestrationCommandCenter.tsx` — panel integration
- `scripts/test-orchestration-feedback-loop.ts`
- `package.json` — `agents:test-orchestration-feedback-loop`

---

## Storage strategy

No Prisma tables or migrations. Phase 3B follows the existing JSON runtime-store pattern.

| Store | Path |
|-------|------|
| Recommendation outcomes | `data/campaign-events/orchestration-feedback/recommendation-outcomes.json` |
| Lesson approvals | `data/campaign-events/orchestration-feedback/lesson-approvals.json` |

Stored data is feedback/approval metadata only. Routes reject secret-like text and prohibited execution references.

---

## API routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/agents/orchestration-feedback` | GET | FeedbackLoopState, recent outcomes, pending approvals, failed patterns |
| `/api/agents/orchestration-feedback` | POST | Record human recommendation outcome |
| `/api/agents/lesson-approvals` | GET | Lesson approvals, pending, approved |
| `/api/agents/lesson-approvals` | POST | Approve/reject/archive/expire lesson |

All routes are server-side, feedback-store-only, and never execute sends, exports, calendar writes, finance posts, or memory auto-promotion.

---

## Dashboard controls

`/admin/orchestration` → **Feedback + Lesson Approval Loop**

Shows:

- Top moves awaiting feedback
- Prepared actions awaiting feedback
- Tool recommendations awaiting feedback
- Recent accepted/rejected/completed/failed outcomes
- Pending lesson approvals
- Approved lessons and repeated failure patterns
- What the AI learned from human feedback

Buttons only call feedback/approval APIs:

- Accept / Reject / Completed / Failed / Needs revision
- Approve / Reject / Archive / Needs more evidence

No execute/send/submit/export/calendar buttons.

---

## CampaignState integration

```typescript
campaignState.feedbackLoop = {
  recentOutcomes,
  pendingLessonApprovals,
  approvedLessons,
  ignoredRecommendations,
  failedPatterns,
  learningSummary,
  feedbackHealth,
  domainSummary,
}
```

Reasoning now responds to:

- Many ignored recommendations → adoption risk
- Failed/needs-revision patterns → correction prompt
- Pending lesson approvals → top move when room exists

---

## Knowledge graph integration

Feedback produces:

- `recommendation_feedback` observations
- feedback-derived `what_worked` / `what_failed` lessons
- recommendation entities
- lesson entities
- edges: accepted_recommendation, rejected_recommendation, completed_workflow, failed_workflow, lesson_approved, lesson_rejected, needs_followup

---

## Tests run

| Command | Result |
|---------|--------|
| `npm run agents:test-orchestration-feedback-loop` | PASS |
| `npm run typecheck` | PASS during implementation |

Final full run required before commit:

```bash
npm run agents:test-orchestration-feedback-loop
npm run agents:test-agent-tooling-brain
npm run agents:test-campaign-knowledge
npm run agents:test-orchestration-state
npm run agents:test-orchestration-plan
npm run typecheck
NODE_OPTIONS=--max-old-space-size=8192 npm run build
npx prisma migrate status
```

---

## Migration status

No migration required. JSON stores only.

---

## Known blockers

- Lesson approval UI is compact V1 inside orchestration panel, not a dedicated review workbench.
- Feedback buttons do not yet refresh the panel automatically after save.
- Role-scoped feedback permissions are not enforced beyond server validation.

---

## Next recommended sprint

**Phase 4B — Tool outcome feedback + role-scoped tooling UI**

- Feed tool outcomes directly into recommendation feedback.
- Add role-specific filtered feedback controls.
- Add richer feedback review history and lesson approval workbench.

---

## Safety

- No auto-send email/SMS
- No Google Calendar write
- No finance post or reimbursement submit
- No voter/contact export
- No sensitive memory auto-approval
- Feedback APIs mutate only feedback/approval JSON stores
