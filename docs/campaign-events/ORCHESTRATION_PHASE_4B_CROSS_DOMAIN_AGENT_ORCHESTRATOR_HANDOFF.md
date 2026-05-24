# Phase 4B — Cross-Domain Agent Tool Orchestrator Handoff

**Lane:** RedDirt  
**Branch:** `feature/kelly-schedule-settlement-dashboard`  
**Sprint:** Campaign Orchestration Intelligence — Phase 4B  
**North star:** How does this improve the AI's understanding of the entire campaign?

---

## What was built

Phase 4B upgrades the agent from isolated tool recommendations to section-aware cross-domain orchestration. The AI now understands major campaign sections, dependencies between them, which tools apply, which packets should be prepared, and what should be learned after human review.

| Piece | Status |
|-------|--------|
| Campaign section map | ✅ |
| Dependency graph | ✅ |
| Cross-domain tool router | ✅ |
| Playbook engine | ✅ |
| Non-executing action packets | ✅ |
| Learning hooks | ✅ |
| `CampaignState.crossDomainOrchestration` | ✅ |
| Read-only API | ✅ |
| Dashboard panel | ✅ |
| `agents:test-cross-domain-orchestrator` | ✅ |

---

## Files changed

### Core module

`src/lib/agents/orchestration/cross-domain/`

| File | Role |
|------|------|
| `cross-domain-orchestrator-types.ts` | Canonical section, graph, playbook, packet, hook, state types |
| `campaign-section-map.ts` | 18-section campaign map |
| `cross-domain-dependency-graph.ts` | Section nodes, edges, warnings, high-leverage sections |
| `cross-domain-tool-router.ts` | Section-aware tool selection and focus recommendation |
| `cross-domain-playbook-engine.ts` | Six deterministic cross-domain playbooks |
| `cross-domain-action-packets.ts` | Human-gated non-executing packets |
| `cross-domain-learning-hooks.ts` | Structured prompts for feedback/lessons |
| `cross-domain-orchestration-state.ts` | State builder |
| `cross-domain-readme.ts` | Module orientation |

### Integration

- `campaign-state-types.ts` — adds `crossDomainOrchestration`
- `build-campaign-state-from-signals.ts` — skeleton state support
- `build-orchestration-payload.ts` — builds and returns cross-domain state
- `orchestration-reasoning-engine.ts` — uses dependency warnings and section focus
- `OrchestrationCrossDomainPanel.tsx` — dashboard panel
- `OrchestrationCommandCenter.tsx` — panel/API link
- `src/app/api/agents/cross-domain-orchestration-state/route.ts`
- `scripts/test-cross-domain-orchestrator.ts`
- `package.json` — `agents:test-cross-domain-orchestrator`

---

## Campaign section map

18 canonical sections:

- executive_command
- county_intelligence
- communications
- email_os_ecc
- events_calendar
- volunteer_field
- finance_reimbursement
- compliance
- content_media
- donor_fundraising
- scheduling
- research_strategy
- ask_kelly
- tool_builder
- training_copilots
- memory_observations
- public_site
- deployment_readiness

Each section defines domains, routes, source paths, tools, dependencies, source health IDs, CampaignState fields, entity types, human owners, restricted actions, and how it improves campaign understanding.

---

## Dependency graph

The graph models how sections affect each other, including:

- County intelligence → events, volunteer, comms, content, fundraising
- Communications → Email OS/ECC, volunteer field, public narrative
- Events/calendar → county intelligence, volunteer, content/media, memory
- Finance/reimbursement → compliance and executive command
- Memory/observations → research strategy and tool builder
- Deployment readiness → public site and executive command

Outputs:

- nodes
- edges
- weakSections
- blockedSections
- highLeverageSections
- dependencyWarnings

---

## Tool router

The router takes CampaignState, sourceHealth, agentTooling, role, period, and optional requested section.

It returns:

- section diagnoses
- recommended tools by section
- blocked tools
- missing tools
- human approval gates
- expected learning outputs
- recommended section focus

---

## Playbook engine

Required playbooks implemented:

1. County Activation Playbook
2. Comms-to-Field Mobilization Playbook
3. Event Intelligence Playbook
4. Campaign Manager Daily Command Playbook
5. Compliance-Safe Operations Playbook
6. Deployment Readiness Playbook

All are preparation only and human-gated.

---

## Action packet model

Each packet includes:

- id/title/playbookId
- sections
- summary and whyNow
- recommendedOwner
- sourceEvidence
- preparedActions
- humanApprovalsRequired
- blockedBy and risks
- expectedCampaignStateImprovement
- expectedLessons
- doneWhen
- safetySummary with `canExecuteNow: false`

Packets are intended as future command-center units of work.

---

## Learning hooks

Every playbook produces structured learning hooks such as:

- Did the county event improve volunteer activation?
- Did email prep clear ECC gates?
- Did event hot wash produce an approved lesson?
- Did the daily command packet pick the actual highest-leverage section?
- Did compliance review block or revise operations?
- Did deployment verification prove the OS safe to ship?

Hooks suggest observations and lessons but do not approve sensitive memory.

---

## CampaignState integration

```typescript
campaignState.crossDomainOrchestration = {
  sectionMap,
  dependencyGraph,
  recommendedSectionFocus,
  playbooks,
  actionPackets,
  learningHooks,
  sectionCoverage,
  safetySummary,
  summary,
}
```

Reasoning now uses:

- dependency warnings as risks
- recommended section focus as a possible top move
- feedback confidence as a cross-domain confidence limiter

---

## Dashboard integration

`/admin/orchestration` → **Cross-Domain Agent Orchestrator**

Shows:

- Recommended section focus
- Dependency warnings
- High-leverage and blocked sections
- Cross-domain playbooks
- Action packets
- Learning hooks
- Safety gates

No unsafe execution buttons are exposed.

---

## API

`GET /api/agents/cross-domain-orchestration-state`

Read-only. Returns section map summary, dependency graph, recommended focus, playbooks, action packets, learning hooks, and safety summary.

---

## Tests run

| Command | Result |
|---------|--------|
| `npm run agents:test-cross-domain-orchestrator` | PASS |
| `npm run typecheck` | PASS during implementation |

Final full run required before commit:

```bash
npm run agents:test-cross-domain-orchestrator
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

No migration required.

---

## Known blockers

- Action packets are display/preparation V1; no dedicated packet review workbench yet.
- Section map is deterministic and curated; it does not yet learn new sections dynamically.
- API is read-only; marking packets for review can be layered onto the feedback store later.

---

## Next recommended sprint

**Phase 5 — Role-scoped orchestration delivery and packet review workflow**

- Filter packets by role and safety.
- Add packet review status using the feedback store.
- Turn packet completion into recommendation outcomes and lesson approvals.

---

## Safety

- No auto-send email/SMS
- No Google Calendar write
- No finance post or reimbursement submit
- No voter/contact export
- No production mutation
- No sensitive memory auto-approval
- All action packets have `canExecuteNow: false`
