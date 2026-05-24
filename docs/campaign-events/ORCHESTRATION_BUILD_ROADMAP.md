# Orchestration build roadmap

**Milestone:** Campaign Orchestration Intelligence Layer  

---

## Phase overview

| Phase | Focus | Progress |
|-------|--------|----------|
| **1** | Inventory + architecture + tool contracts | `[██████████] 100%` |
| **2** | CampaignState loader + reasoning API | `[██████████] 100%` |
| **2B** | Command center orchestration panel | `[████████░░] 85%` |
| **3A** | Knowledge graph + lessons engine | `[████████░░] 85%` |
| **3B** | Recommendation feedback + lesson approval UI | `[████████░░] 85%` |
| **4A** | AI Agent Tooling Brain | `[████████░░] 85%` |
| **4B** | Cross-domain agent tool orchestrator | `[████████░░] 85%` ← **this phase** |
| **5** | Role-specific orchestration delivery | `[██░░░░░░░░] 20%` |
| **6** | Memory review + learning loop | `[██░░░░░░░░] 20%` |
| **7** | Dashboard adaptation + workspaces | `[█░░░░░░░░░] 10%` |
| **8** | Presentation / demo polish | `[█░░░░░░░░░] 10%` |


---

## Phase 1 — Inventory + architecture + contracts ✅

**Goals**

- Document all intelligence systems
- Define 8-layer architecture
- 20-domain map
- 39 orchestration tool contracts
- Skeleton types + loaders + reasoning V1
- `agents:test-orchestration-plan`

**Files**

- `docs/campaign-events/ORCHESTRATION_*.md` (6 docs)
- `src/lib/agents/orchestration/`*
- `sprint-orchestration-intelligence-tools.ts`
- `scripts/test-orchestration-plan.ts`

**Tests**

- `npm run agents:test-orchestration-plan`

**Risks**

- Low — planning only

**Done when**

- Steve has master plan + green plan test + docs linked from BUILD_SPRINT_STATUS

---

## Phase 2 — CampaignState loader + reasoning ✅ (Phase 2A)

**Goals**

- `loadCampaignOrchestrationSignals` populates real domain slices ✅
- Map OS snapshot → `CampaignState` fields ✅
- County/comms/volunteer health bands from live data ✅
- API route `/api/agents/orchestration-state` ✅

**Files**

- `load-campaign-orchestration-signals.ts` ✅
- `build-campaign-state-from-signals.ts` ✅
- `build-orchestration-payload.ts` ✅
- `api/agents/orchestration-state/route.ts` ✅

**Tests**

- `agents:test-orchestration-state` ✅
- `agents:test-orchestration-plan` ✅

**Done when**

- API returns live/degraded CampaignState in dev ✅
- Diagnosis lists blockers + top 3 moves ✅

---

## Phase 3A — Knowledge graph + lessons engine ✅ (functional)

**Goals**

- Campaign entity graph (people, counties, events, observations, blockers, …) ✅
- Observation intake from staff signals ✅
- Lessons engine with confidence, freshness, usefulness ✅
- Recommendation feedback loop (store) ✅
- `CampaignState.knowledgeMemory` integration ✅

**Files**

- `src/lib/agents/campaign-knowledge/`*
- `sprint-campaign-knowledge-tools.ts`
- `OrchestrationKnowledgeMemoryPanel.tsx`
- `PHASE_3A_KNOWLEDGE_GRAPH_HANDOFF.md`

**Tests**

- `agents:test-campaign-knowledge` ✅
- `agents:test-orchestration-state` (knowledgeMemory assert) ✅

**Done when**

- Orchestration panel shows lessons, patterns, confidence gaps ✅
- Graph persists under `data/campaign-events/campaign-knowledge/` ✅

---

## Phase 3B — Feedback + Lesson Approval Loop ✅ (functional)

**Goals**

- Record accepted/rejected/ignored/completed/failed/needs revision recommendation outcomes ✅
- Approve/reject/archive/expire suggested lessons ✅
- Produce feedback-derived observations, lessons, and graph edges ✅
- Add `CampaignState.feedbackLoop` and reasoning adoption-risk handling ✅
- Dashboard controls write only feedback/approval records ✅

**Files**

- `src/lib/agents/orchestration/feedback/*`
- `src/app/api/agents/orchestration-feedback/route.ts`
- `src/app/api/agents/lesson-approvals/route.ts`
- `OrchestrationFeedbackLoopPanel.tsx`
- `ORCHESTRATION_PHASE_3B_FEEDBACK_LESSON_APPROVAL_HANDOFF.md`

**Tests**

- `agents:test-orchestration-feedback-loop` ✅
- `agents:test-orchestration-state` (feedbackLoop assert) ✅

**Done when**

- Humans can mark outcomes and lesson approvals without execution controls ✅
- Feedback appears in CampaignState, payload, reasoning, and graph ✅

---

## Phase 4A — AI Agent Tooling Brain ✅ (functional)

**Goals**

- Unified tool registry with `improvesCampaignUnderstandingHow` on every tool ✅
- Deterministic selector + sequencer ✅
- Safe action prep (non-executable default) ✅
- Safety classifier + prohibited types ✅
- Coverage analysis for all 20 domains ✅
- `CampaignState.agentTooling` + dashboard panel ✅

**Files**

- `src/lib/agents/orchestration/tooling/*`
- `OrchestrationAgentToolingPanel.tsx`
- `ORCHESTRATION_PHASE_4A_AGENT_TOOLING_BRAIN_HANDOFF.md`

**Tests**

- `agents:test-agent-tooling-brain` ✅
- `agents:test-orchestration-state` (agentTooling assert) ✅

**Done when**

- Orchestration panel shows recommended tools, sequences, prepared actions ✅
- API `/api/agents/orchestration-tooling-state` read-only ✅

---

## Phase 4B — Cross-Domain Agent Tool Orchestrator ✅ (functional)

**Goals**

- Canonical campaign section map across 18 major sections ✅
- Dependency graph showing section leverage, blocked sections, and warnings ✅
- Tool router that selects tools by section/domain and identifies section focus ✅
- Six cross-domain playbooks with human-gated action packets ✅
- Learning hooks for what the AI should capture after packet review ✅
- `CampaignState.crossDomainOrchestration` + dashboard + read-only API ✅

**Files**

- `src/lib/agents/orchestration/cross-domain/*`
- `src/app/api/agents/cross-domain-orchestration-state/route.ts`
- `OrchestrationCrossDomainPanel.tsx`
- `ORCHESTRATION_PHASE_4B_CROSS_DOMAIN_AGENT_ORCHESTRATOR_HANDOFF.md`

**Tests**

- `agents:test-cross-domain-orchestrator` ✅
- `agents:test-orchestration-state` (crossDomainOrchestration assert) ✅

**Done when**

- Command center shows recommended section focus, playbooks, packets, hooks, and safety gates ✅
- All packets remain non-executing and human-gated ✅

---

## Phase 2B — Command center panel (RECOMMENDED NEXT)

**Goals**

- Merge OS `preparedActions` with workflow execution packages
- Readiness scores use real blocker counts
- County action packages attach to `activate-weak-county`

**Files**

- `orchestration-workflow-planner.ts`
- `county-action-package-builder.ts` integration
- `agent-action-preparer.ts` handoff

**Tests**

- New `agents:test-orchestration-workflows`

**Risks**

- Duplicate plans vs OS top moves — **dedupe** in UI

**Done when**

- Six templates produce checklist + routes verified in test

---

## Phase 4 — Command center orchestration panel

**Goals**

- Executive summary + top 3 + collapsible sections (architecture doc)
- No send buttons; route links only

**Files**

- `OrchestrationCommandCenterPanel.tsx` (new component)
- Wire into `AiCommandCenterHub.tsx`

**Tests**

- Manual smoke + optional Playwright later

**Risks**

- UI overload — strict collapsible default

**Done when**

- Steve can open command center and see live diagnosis

---

## Phase 5 — Role-specific delivery

**Goals**

- Copilot brief orchestration slice per role
- CM daily + candidate briefing tools call real engines

**Files**

- `copilot-intelligence-engine.ts`
- `role-copilot-engine.ts`

**Tests**

- `agents:test-role-copilots` extended

---

## Phase 6 — Memory + learning loop

**Goals**

- Observation miner → memory candidates → review queue
- Hot wash router creates county strategy suggestions

**Files**

- `agent-memory-write-planner.ts` integration
- Training modules `orch-`*

---

## Phase 7 — Dashboard adaptation

**Goals**

- Orchestration-driven blueprint simplification
- Render county/comms blocks in preview

**Files**

- `dashboard-blueprint-builder.ts`
- `adaptive-dashboard-orchestrator.ts`

---

## Phase 8 — Demo polish

**Goals**

- Gate B demo: onboarding → orchestration panel → county → comms draft → reimbursement workflow card
- Update `PRESENTATION_READINESS_CHECKLIST.md`

---

## Implementation readiness

```
Phase 1 planning           [██████████] 100%
Phase 2 loader+reasoning   [███░░░░░░░]  30%
Phase 3 workflows          [███░░░░░░░]  30%
Phase 4 command center UI  [██░░░░░░░░]  20%
Overall orchestration      [███████░░░]  72%
```

---

**Steve decision point:** Approve Phase 2 start after reviewing architecture + inventory docs.