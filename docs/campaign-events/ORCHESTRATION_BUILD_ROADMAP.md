# Orchestration build roadmap

**Milestone:** Campaign Orchestration Intelligence Layer  
**First implementation phase recommended:** **Phase 2** (after this planning commit)

---

## Phase overview

| Phase | Focus | Progress |
|-------|--------|----------|
| **1** | Inventory + architecture + tool contracts | `[██████████] 100%` ← **this sprint** |
| **2** | CampaignState loader + reasoning API | `[████████░░] 85%` ← **Phase 2A done** |
| **2B** | Command center orchestration panel | `[██░░░░░░░░] 20%` |
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
- `src/lib/agents/orchestration/*`
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
- Training modules `orch-*`

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
