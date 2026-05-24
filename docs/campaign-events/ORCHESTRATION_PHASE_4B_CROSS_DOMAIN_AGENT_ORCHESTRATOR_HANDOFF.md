# Phase 4B — Cross-Domain Agent Tool Orchestrator Handoff

**Lane:** RedDirt  
**Branch:** `feature/kelly-schedule-settlement-dashboard`  
**Sprint:** Campaign Orchestration Intelligence — Phase 4B  
**North star:** How does this improve the AI's understanding of the entire campaign?

---

## What was built

Phase 4B upgrades the agent from isolated tool recommendation to cross-section orchestration. The agent now maps campaign sections, understands dependencies, routes tools by section/domain, prepares cross-domain playbooks, creates non-executing action packets, and defines learning hooks for human feedback afterward.

| Piece | Status |
|-------|--------|
| Campaign section map | ✅ |
| Cross-domain dependency graph | ✅ |
| Section-aware tool router | ✅ |
| Required playbooks | ✅ |
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
| `cross-domain-orchestrator-types.ts` | Canonical types |
| `campaign-section-map.ts` | 18-section campaign map |
| `cross-domain-dependency-graph.ts` | Section nodes, edges, warnings |
| `cross-domain-tool-router.ts` | Section tool diagnosis and recommendations |
| `cross-domain-playbook-engine.ts` | Required cross-domain playbooks |
| `cross-domain-action-packets.ts` | Preparation-only action packets |
| `cross-domain-learning-hooks.ts` | Structured after-action learning prompts |
| `cross-domain-orchestration-state.ts` | State builder |
| `cross-domain-readme.ts` | Module orientation |

### Integration

- `campaign-state-types.ts` — adds `crossDomainOrchestration`
- `build-campaign-state-from-signals.ts` — default empty cross-domain state
- `build-orchestration-payload.ts` — builds and exposes cross-domain state
- `orchestration-reasoning-engine.ts` — uses section focus and dependency warnings
- `src/app/api/agents/cross-domain-orchestration-state/route.ts`
- `OrchestrationCrossDomainPanel.tsx`
- `OrchestrationCommandCenter.tsx`
- `scripts/test-cross-domain-orchestrator.ts`
- `package.json`

---

## Campaign section map

Canonical sections:

executive_command, county_intelligence, communications, email_os_ecc, events_calendar, volunteer_field, finance_reimbursement, compliance, content_media, donor_fundraising, scheduling, research_strategy, ask_kelly, tool_builder, training_copilots, memory_observations, public_site, deployment_readiness.

Each section defines mission, owned domains, routes/APIs/source paths, primary/related tools, upstream/downstream dependencies, source health IDs, CampaignState fields, graph entity types, owners, restricted actions, and how it improves campaign understanding.

---

## Dependency graph

The graph builds deterministic section nodes and edges, including:

- County intelligence unlocks events, volunteer/field, comms, content, fundraising.
- Communications depends on and unlocks Email OS/ECC and volunteer activation.
- Events feed county, comms, content/media, and memory observations.
- Finance/reimbursement requires compliance review.
- Memory/feedback informs research, strategy, and tool builder.
- Deployment readiness blocks public/admin shipping confidence.

---

## Tool router

The router uses CampaignState, source health, section ownership, dependencies, and the unified agent tool registry to produce:

- section diagnosis
- recommended tools by section
- blocked/missing tools
- human approval gates
- expected learning outputs
- recommended section focus

---

## Playbook engine

Required playbooks implemented:

- County Activation Playbook
- Comms-to-Field Mobilization Playbook
- Event Intelligence Playbook
- Campaign Manager Daily Command Playbook
- Compliance-Safe Operations Playbook
- Deployment Readiness Playbook

All playbooks prepare review packets only. They never send, submit, export, write calendar, post finance, or mutate production state.

---

## Action packets

Action packets are the future unit of work for the command center. Each includes playbook, sections, owner, why now, evidence, prepared actions, human approvals, blockers, risks, CampaignState improvement, expected lessons, done-when, and safety summary.

Every packet has:

```typescript
canExecuteNow: false
autoExecutionDisabled: true
humanGateRequired: true
```

---

## Learning hooks

Every playbook emits structured hooks asking what happened afterward, whether humans accepted/rejected/corrected the packet, and what lesson should be suggested. Sensitive/strategic hooks require approval before memory promotion.

---

## CampaignState integration

```typescript
campaignState.crossDomainOrchestration = {
  sectionMap,
  dependencyGraph,
  recommendedSectionFocus,
  sectionDiagnoses,
  playbooks,
  actionPackets,
  learningHooks,
  sectionCoverage,
  safetySummary,
}
```

Reasoning now can surface section focus and dependency warnings in top risks/moves.

---

## Dashboard integration

`/admin/orchestration` → **Cross-Domain Agent Orchestrator**

Shows recommended section focus, dependency warnings, high-leverage sections, playbooks, action packets, learning hooks, and safety gates.

No unsafe execution controls.

---

## API route

`GET /api/agents/cross-domain-orchestration-state`

Read-only. Returns section map summary, dependency graph, recommended section focus, playbooks, action packets, learning hooks, and safety summary.

---

## Tests run

| Command | Result |
|---------|--------|
| `npm run agents:test-cross-domain-orchestrator` | PASS during implementation |

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

No migration required. Phase 4B is typed orchestration state, read-only API, and dashboard presentation.

---

## Known blockers

- Action packets do not yet have a dedicated review queue beyond dashboard display.
- Section permissions are advisory V1; future work can filter packets by role.
- Route health inside Deployment Readiness playbook is packet metadata, not a live crawler yet.

---

## Next recommended sprint

Role-scoped packet review and outcome capture:

- Mark cross-domain packets accepted/rejected/completed/failed directly into Phase 3B feedback store.
- Add role-filtered packet review views.
- Convert packet outcomes into more precise lessons and tool build tickets.

---

## Safety

- No auto-send email/SMS
- No Google Calendar write
- No finance post or reimbursement submit
- No voter/contact export
- No sensitive memory auto-approval
- No direct production mutation
- Packets are preparation-only and human-gated
