# Orchestration Phase 2A — Live CampaignState API handoff

**Sprint:** Campaign Orchestration Intelligence — Phase 2A  
**Branch:** `feature/kelly-schedule-settlement-dashboard`  
**Lane:** `RedDirt/` only

---

## What was built

| Deliverable | Status |
|-------------|--------|
| Live `CampaignState` from domain signals | ✅ |
| Signal loader with `OrchestrationSourceHealth` | ✅ 10 sources |
| Deterministic reasoning V1 (executive summary, top 3 moves) | ✅ |
| Workflow activation from state conditions | ✅ 6 templates |
| Server API | ✅ `GET /api/agents/orchestration-state` |
| Safety payload on every response | ✅ |
| Test `agents:test-orchestration-state` | ✅ |
| Ernie work protocol doc | ✅ `ERNIE_CAMPAIGN_OS_WORK_PROTOCOL.md` |

---

## API route

**Path:** `/api/agents/orchestration-state`  
**File:** `src/app/api/agents/orchestration-state/route.ts`

**Query params:**

| Param | Default | Description |
|-------|---------|-------------|
| `period` | `2026-04` | Campaign month |
| `pathname` | `/admin/ai-command-center` | Cross-domain context path |
| `role` | `campaign_manager` | Valid `CampaignUserRole` |

**Example:**

```http
GET /api/agents/orchestration-state?period=2026-04
```

---

## Response shape

```ts
{
  ok: boolean;                    // false only when operatingMode === "skeleton"
  generatedAt: string;
  campaignState: CampaignState;   // live or degraded
  diagnosis: OrchestrationDiagnosis;
  recommendedWorkflows: OrchestrationWorkflow[];
  blockers: CampaignBlocker[];
  opportunities: CampaignOpportunity[];
  risks: string[];
  topMoves: OrchestrationTopMove[];  // max 3, with whyThisMatters
  sourceHealth: OrchestrationSourceHealth[];
  safety: {
    humanGateRequired: true;
    autoExecutionDisabled: true;
    restrictedActions: string[];
    controlRules: string[];
    safetyCheckOk: boolean;
  };
  errors?: string[];              // loader failures (partial degrade)
}
```

---

## Signal sources wired

| sourceId | Label |
|----------|--------|
| `os_control` | OS control bundle |
| `unified_context` | Unified campaign context |
| `county` | County intelligence V2 |
| `communications` | Communications intelligence V2 |
| `observations` | User observations (last 50) |
| `tool_builder` | Tool-builder queue |
| `cross_domain` | Cross-domain context composer |
| `events_dashboard` | Campaign events dashboard |
| `email_os` | Email OS / ECC readiness |
| `tool_registry` | Tool execution readiness |

---

## Degraded behavior

- Failed loader → `sourceHealth.status = "error"` + message in `errors[]`
- Missing data → `missing` status + blocker row in `CampaignState`
- API **never throws** to client — returns partial payload with `ok: true` when `operatingMode` is `live` or `degraded`
- `operatingMode`: `live` (all ready) · `degraded` (partial) · `skeleton` (insufficient signals)

---

## Files changed (Phase 2A)

| File | Role |
|------|------|
| `campaign-state-types.ts` | Extended CampaignState model |
| `orchestration-source-health.ts` | Source health types |
| `load-campaign-orchestration-signals.ts` | 10-source intake |
| `build-campaign-state-from-signals.ts` | Live state builder |
| `build-orchestration-payload.ts` | API payload assembler |
| `orchestration-reasoning-engine.ts` | Executive summary + top moves |
| `orchestration-workflow-planner.ts` | State-triggered workflows |
| `api/agents/orchestration-state/route.ts` | GET endpoint |
| `scripts/test-orchestration-state.ts` | Smoke test |
| `docs/ERNIE_CAMPAIGN_OS_WORK_PROTOCOL.md` | Agent protocol |

---

## Tests run

```bash
npm run agents:test-orchestration-state   # PASS
npm run agents:test-orchestration-plan    # PASS
npm run typecheck                         # PASS
```

Typical local result: `operatingMode: degraded`, `isLive: true`, 8/10 sources ready.

---

## Blockers / known gaps

1. `os_control` or `events_dashboard` may fail without full ledger/DB — graceful degrade OK  
2. No command center UI panel yet (Phase 4)  
3. Volunteer domain signals thin — comms graph proxy only  
4. No external LLM narration (deterministic V1 only)

---

## Next recommended sprint

**Phase 2B / 4:** `OrchestrationCommandCenterPanel` — executive summary, top 3 moves, collapsible blockers/workflows, route links only (no send buttons).

Wire panel to `GET /api/agents/orchestration-state` from server component in `/admin/ai-command-center`.

---

*See `ERNIE_CAMPAIGN_OS_WORK_PROTOCOL.md` for agent role and held phases.*
