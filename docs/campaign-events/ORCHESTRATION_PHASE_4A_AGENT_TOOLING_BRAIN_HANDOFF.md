# Phase 4A — AI Agent Tooling Brain Handoff

**Lane:** RedDirt  
**Branch:** `feature/kelly-schedule-settlement-dashboard`  
**Sprint:** Campaign Orchestration Intelligence — Phase 4A  
**North star:** How does this improve the AI's understanding of the entire campaign?

---

## Summary

Phase 4A adds the **AI Agent Tooling Brain** — a layer between CampaignState, the knowledge graph, workflows, and the existing tool catalog. The agent can now answer: what tools exist, which to use now, which are blocked, what requires human approval, and what sequence improves campaign intelligence.

---

## What was built

| Piece | Status |
|-------|--------|
| Agent tooling types (capability, recommendation, sequence, prepared action) | ✅ |
| Unified tool registry (737 tools from catalog + contracts) | ✅ |
| Deterministic tool selector | ✅ |
| Tool sequencer (5 sequences) | ✅ |
| Safe action prep (canExecuteNow: false default) | ✅ |
| Safety classifier (safe_read / safe_prepare / approval_required / prohibited) | ✅ |
| Coverage analysis (all 20 domains) | ✅ |
| `CampaignState.agentTooling` + payload `agentTooling` | ✅ |
| Reasoning engine references best next tool | ✅ |
| Read-only API `GET /api/agents/orchestration-tooling-state` | ✅ |
| Dashboard section **AI Agent Tooling Brain** | ✅ |
| `agents:test-agent-tooling-brain` | ✅ |

---

## Module path

`src/lib/agents/orchestration/tooling/`

| File | Role |
|------|------|
| `agent-tooling-types.ts` | Canonical types + `AgentToolingState` |
| `agent-tool-registry.ts` | Unifies orchestration, knowledge, master catalog |
| `agent-tool-selector.ts` | Recommends tools from state + gaps + blockers |
| `agent-tool-sequencer.ts` | County, comms, CM daily, hot wash, finance sequences |
| `agent-action-prep.ts` | Prepared actions — non-executable by default |
| `agent-tool-safety.ts` | Safety levels + prohibited execution types |
| `agent-tool-coverage.ts` | Per-domain coverage (20 domains) |
| `agent-tool-learning.ts` | Tool → knowledge learning hooks |
| `agent-tooling-state.ts` | `buildAgentToolingState()` entry point |
| `agent-tooling-readme.ts` | Module orientation |

---

## Tool registry

- Sources: `ORCHESTRATION_INTELLIGENCE_TOOL_CONTRACTS`, `CAMPAIGN_KNOWLEDGE_TOOL_CONTRACTS`, `AI_TOOL_LIFECYCLES` + supplement
- Every tool includes **`improvesCampaignUnderstandingHow`** (validated in tests)
- Status mapped: functional→ready, partial→partial, idea→planned
- **737 tools** in unified registry (typical dev load)

---

## Selector logic (V1)

Prioritizes tools that:
1. Refresh CampaignState (`campaign-state-loader`)
2. Fill knowledge gaps (`campaign-lessons-engine`, memory synthesizer)
3. Clear P0/P1 blockers (domain-specific orchestrators)
4. Strengthen county intelligence when weak
5. Inspect comms readiness when send gated
6. Mine friction → tool-builder when observation friction high
7. CM daily plan when role is campaign_manager

---

## Sequences (V1)

1. **County intelligence refresh** — state → field priorities → observations → county lessons → review packet  
2. **Comms readiness** — comms priorities → source health → blockers → sandbox checklist  
3. **Campaign manager daily** — state → diagnosis → workflows → daily plan → rank  
4. **Event hot wash learning** — extract → intake → lessons → graph → county router  
5. **Finance/compliance safety** — risk detector → diagnosis → review checklist (no post/submit)

---

## Action prep model

- `PreparedAgentAction.canExecuteNow` is always **`false`**
- `restrictedExecution: true`, `humanApprovalRequired: true`
- Includes: top moves, comms draft checklist, knowledge gap review, finance compliance review, tool recommendation prep

---

## Safety model

| Level | Meaning |
|-------|---------|
| `safe_read` | Read-only catalog / state tools |
| `safe_prepare` | Prepares drafts/checklists |
| `approval_required` | Human must approve before any effect |
| `prohibited` | Blocked / never auto-execute |

**Prohibited types:** auto_send_email, auto_send_sms, google_calendar_write, finance_post, reimbursement_submit, voter_export, contact_export, sensitive_memory_auto_store, production_mutation_without_approval, + orchestration forbidden auto actions

---

## CampaignState integration

```typescript
campaignState.agentTooling: {
  registryToolCount,
  topRecommendedTools,
  recommendedSequences,
  preparedActions,
  coverageByDomain,
  blockedTools,
  missingTools,
  safetySummary,
  bestNextToolForCampaignState,
  toolingSummary,
}
```

Also on `OrchestrationStatePayload.agentTooling`.

---

## Dashboard

`/admin/orchestration` → **AI Agent Tooling Brain** panel  
No execute/send/submit buttons — copy briefing and view prepared packets only.

---

## API

`GET /api/agents/orchestration-tooling-state?period=2026-04`  
Read-only. Returns registry summary + agentTooling + safety.

---

## Tests run

| Command | Result |
|---------|--------|
| `npm run agents:test-agent-tooling-brain` | **PASS** |
| `npm run agents:test-campaign-knowledge` | **PASS** |
| `npm run agents:test-orchestration-state` | **PASS** |
| `npm run agents:test-orchestration-plan` | **PASS** |
| `npm run typecheck` | **PASS** |
| `npm run build` | Run locally — prior OOM on agent machine |
| `npx prisma migrate status` | **PASS** — no new migrations |

---

## Known gaps (Phase 4B)

- Mark recommendation feedback from tooling panel (accept/reject tool advice)
- Role-specific tool filtering (intern-safe subset UI)
- Tool usage runtime audit → graph intake
- Execute buttons remain forbidden — Phase 4B may add "mark for review" only

---

## Next recommended sprint

**Phase 4B — Tool outcome feedback + role-scoped tooling UI**

---

## Safety

- No auto-send, GCal write, finance post, voter export
- All prepared actions non-executable
- Human gates on approval_required tools
